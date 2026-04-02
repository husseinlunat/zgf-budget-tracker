import React, { useState, useCallback, useRef, useMemo } from 'react'
import * as XLSX from 'xlsx'
import {
    UploadCloud, FileSpreadsheet, CheckCircle2, AlertTriangle,
    X, Download, Loader2, ChevronDown, ChevronUp, RefreshCw
} from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import { useBudgetLines } from '../hooks/useBudgetLines'
import { formatZMW } from '../data/budgetData'

// ── Amount parser (same logic as server-side script) ──────────────────────────
const RATE = { USD: 25, GBP: 30, ZAR: 1.35 }

function parseAmount(raw) {
    if (!raw && raw !== 0) return 0
    const s = String(raw).trim()
    if (!s) return 0

    // ZMW / K prefix — e.g. "K13,050.00", "ZMW 5000"
    const zmwMatch = s.match(/(?:ZMW|K|k)\s*([\d,]+(?:\.\d+)?)/i)
    if (zmwMatch) return parseFloat(zmwMatch[1].replace(/,/g, ''))

    // Plain number (no currency prefix)
    const plain = s.replace(/\s/g, '').match(/^[\d,]+(?:\.\d+)?$/)
    if (plain) return parseFloat(s.replace(/,/g, ''))

    // USD "$668"
    const usd = s.match(/\$\s*([\d,]+(?:\.\d+)?)/)
    if (usd) return parseFloat(usd[1].replace(/,/g, '')) * RATE.USD

    // GBP
    const gbp = s.match(/GBP\s*([\d,]+(?:\.\d+)?)/i)
    if (gbp) return parseFloat(gbp[1].replace(/,/g, '')) * RATE.GBP

    // Inline ZMW "USD500, ZMW1000"
    const inlineZmw = s.match(/(?:ZMW|ZWM)\s*([\d,]+(?:\.\d+)?)/i)
    if (inlineZmw) return parseFloat(inlineZmw[1].replace(/,/g, ''))

    // Inline USD "850 USD"
    const inlineUsd = s.match(/([\d,]+(?:\.\d+)?)\s*USD/i)
    if (inlineUsd) return parseFloat(inlineUsd[1].replace(/,/g, '')) * RATE.USD

    // Fallback: first number
    const any = s.replace(/,/g, '').match(/[\d]+(?:\.\d+)?/)
    return any ? parseFloat(any[0]) : 0
}

// ── Funding source normaliser ─────────────────────────────────────────────────
function normaliseFS(raw) {
    if (!raw) return 'Comic Relief'
    const s = String(raw).trim()
    if (/mott\s*\$/i.test(s) || /mott\s*iii/i.test(s) || /^mott$/i.test(s)) return 'MOTTIII'
    if (/kalulu\s*\$/i.test(s) || /kalulu\s*ii/i.test(s) || /^kalulu$/i.test(s)) return 'KaluluII'
    if (/^zgf$/i.test(s)) return 'ZGF'
    if (/loop/i.test(s)) return 'Comic Relief'
    if (/sharetrust/i.test(s)) return 'KaluluII'
    if (/comic/i.test(s)) return 'Comic Relief'
    if (s.includes(';')) return normaliseFS(s.split(';')[0])
    return s
}

// ── Map a data row (from Excel/CSV) to a payment request object ───────────────
function mapRow(row, headerMap) {
    const get = (...keys) => {
        for (const k of keys) {
            if (headerMap[k] !== undefined) {
                const v = row[headerMap[k]]
                if (v !== null && v !== undefined && String(v).trim() !== '') return String(v).trim()
            }
        }
        return ''
    }

    const rawId   = get('ID', 'Id', 'id')
    const name    = get('Activity/Purpose', 'Activity', 'Purpose', 'Description', 'Name', 'name')
    const reqBy   = get('Requested by.', 'Requested by', 'Requested By', 'RequestedBy', 'requested_by')
    const code    = get('Budget Code.', 'Budget Code', 'BudgetCode', 'budget_code').replace(/\s+/g,'')
    const rawFS   = get('Funding source', 'Funding Source', 'FundingSource', 'funding_source')
    const rawAmt  = get('Total', 'Amount', 'amount', 'total')
    const payee   = get('Payee', 'payee')
    const status  = get('Approval status', 'Approval Status', 'Status', 'status') || 'Pending'
    const rawYear = get('Year', 'year')

    return {
        rawId,
        id:             rawId ? `PR-${rawId}` : null,
        name,
        requested_by:   reqBy,
        budget_code:    code || null,
        funding_source: normaliseFS(rawFS),
        amount:         parseAmount(rawAmt),
        payee,
        status:         status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(),
        year:           rawYear ? parseInt(rawYear) || 2026 : 2026,
    }
}

// ── Parse spreadsheet bytes → rows ────────────────────────────────────────────
function parseWorkbook(buffer) {
    const wb = XLSX.read(buffer, { type: 'array' })
    const sheetName = wb.SheetNames[0]
    const ws = wb.Sheets[sheetName]
    const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null })
    if (raw.length < 2) return { rows: [], headers: [] }

    // Find header row (first row with ≥ 3 non-null cells)
    let headerIdx = 0
    for (let i = 0; i < Math.min(10, raw.length); i++) {
        const nonNull = raw[i].filter(v => v != null).length
        if (nonNull >= 3) { headerIdx = i; break }
    }

    const headers = raw[headerIdx].map(h => h != null ? String(h).trim() : '')
    const headerMap = {}
    headers.forEach((h, i) => { if (h) headerMap[h] = i })

    const rows = []
    for (let r = headerIdx + 1; r < raw.length; r++) {
        const row = raw[r]
        if (!row || row.every(v => v == null)) continue
        const mapped = mapRow(row, headerMap)
        if (!mapped.name && !mapped.rawId) continue
        rows.push(mapped)
    }
    return { rows, headers: Object.keys(headerMap) }
}

// ────────────────────────────────────────────────────────────────────────────
export default function ImportRequests() {
    const { lines } = useBudgetLines()
    const [dragging, setDragging]       = useState(false)
    const [file, setFile]               = useState(null)
    const [rows, setRows]               = useState([])
    const [headers, setHeaders]         = useState([])
    const [importing, setImporting]     = useState(false)
    const [importResult, setImportResult] = useState(null)
    const [expandedRows, setExpandedRows] = useState({})
    const [yearFilter, setYearFilter]   = useState('2026')
    const inputRef = useRef()

    // ── Budget-line lookup map ────────────────────────────────────────────────
    const codeMap = useMemo(() => {
        const m = {}
        lines.forEach(l => {
            if (l.budgetCode) {
                if (!m[l.budgetCode]) m[l.budgetCode] = []
                m[l.budgetCode].push(l)
            }
        })
        return m
    }, [lines])

    // ── Validate and annotate parsed rows ─────────────────────────────────────
    const annotated = useMemo(() => {
        return rows.map(r => {
            const matches = r.budget_code ? (codeMap[r.budget_code] || []) : []
            // Try funding-source specific match first
            const fsMatch = matches.find(l =>
                l.fundingSource.toLowerCase().replace(/\s+/g,'') === r.funding_source.toLowerCase().replace(/\s+/g,'')
            )
            const bestLine = fsMatch || matches[0] || null
            const valid = !!r.id && !!r.name && r.amount > 0
            const yearNum = parseInt(yearFilter) || 2026

            return {
                ...r,
                budgetLineId: bestLine?.id || null,
                budgetLineActivity: bestLine?.activity?.substring(0, 60) || null,
                codeMatched: matches.length > 0,
                valid,
                include: valid && r.year === yearNum,
            }
        })
    }, [rows, codeMap, yearFilter])

    const included  = useMemo(() => annotated.filter(r => r.include), [annotated])
    const matched   = useMemo(() => annotated.filter(r => r.codeMatched && r.include), [annotated])
    const unmatched = useMemo(() => annotated.filter(r => !r.codeMatched && r.include), [annotated])

    // ── File handling ─────────────────────────────────────────────────────────
    const processFile = useCallback((f) => {
        setFile(f)
        setImportResult(null)
        setRows([])
        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const buf = new Uint8Array(e.target.result)
                const { rows: parsed, headers: hdrs } = parseWorkbook(buf)
                setRows(parsed)
                setHeaders(hdrs)
            } catch (err) {
                console.error(err)
                setImportResult({ error: `Parse error: ${err.message}` })
            }
        }
        reader.readAsArrayBuffer(f)
    }, [])

    const onDrop = useCallback((e) => {
        e.preventDefault(); setDragging(false)
        const f = e.dataTransfer.files[0]
        if (f) processFile(f)
    }, [processFile])

    const onFileInput = (e) => {
        const f = e.target.files[0]
        if (f) processFile(f)
    }

    const reset = () => {
        setFile(null); setRows([]); setHeaders([])
        setImportResult(null); setExpandedRows({})
        if (inputRef.current) inputRef.current.value = ''
    }

    // ── Import to Supabase ────────────────────────────────────────────────────
    const handleImport = async () => {
        if (!included.length) return
        setImporting(true)
        setImportResult(null)

        const toUpsert = included.map(r => ({
            id:             r.id,
            name:           r.name,
            requested_by:   r.requested_by || null,
            budget_code:    r.budget_code || null,
            budget_line_id: r.budgetLineId || null,
            funding_source: r.funding_source,
            amount:         r.amount,
            status:         r.status,
            year:           r.year,
            date:           `${r.year}-01-01`,
            synced_at:      new Date().toISOString(),
        }))

        if (!isSupabaseConfigured) {
            // Simulate
            await new Promise(res => setTimeout(res, 1500))
            setImportResult({ inserted: toUpsert.length, errors: [], demo: true })
            setImporting(false)
            return
        }

        const BATCH = 50
        const errors = []
        let inserted = 0

        for (let i = 0; i < toUpsert.length; i += BATCH) {
            const batch = toUpsert.slice(i, i + BATCH)
            const { error } = await supabase.from('payment_requests').upsert(batch, { onConflict: 'id' })
            if (error) {
                errors.push(`Batch ${Math.floor(i / BATCH) + 1}: ${error.message}`)
            } else {
                inserted += batch.length
            }
        }

        setImportResult({ inserted, errors })
        setImporting(false)
    }

    const toggleRow = (idx) => setExpandedRows(prev => ({ ...prev, [idx]: !prev[idx] }))

    // ── Status badge ──────────────────────────────────────────────────────────
    const StatusBadge = ({ status }) => {
        const cfg = {
            Approved: 'bg-green-100 text-green-700',
            Pending:  'bg-amber-100 text-amber-700',
            Rejected: 'bg-red-100 text-red-700',
        }
        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg[status] || 'bg-gray-100 text-gray-600'}`}>
                {status}
            </span>
        )
    }

    return (
        <div className="p-6 space-y-6 animate-fade-in-up">

            {/* ── Header ──────────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-primary-50 rounded-xl text-primary-600">
                            <FileSpreadsheet size={20} />
                        </div>
                        <div>
                            <h1 className="text-base font-bold text-gray-900">Import Payment Requests</h1>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Upload an Excel (.xlsx) or CSV file — rows are extracted, validated against budget lines, and imported to Supabase.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Year</label>
                        <select className="input-field py-1 px-2 text-xs" value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
                            {['2024','2025','2026','2027'].map(y => <option key={y}>{y}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* ── Drop zone ────────────────────────────────────────────── */}
            {!file && (
                <div
                    onDragOver={e => { e.preventDefault(); setDragging(true) }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={onDrop}
                    onClick={() => inputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 ${dragging ? 'border-primary-400 bg-primary-50 scale-[1.01]' : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'}`}
                >
                    <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={onFileInput} />
                    <UploadCloud size={40} className={`mx-auto mb-3 transition-colors ${dragging ? 'text-primary-500' : 'text-gray-300'}`} />
                    <p className="text-sm font-semibold text-gray-600">Drag & drop your Excel or CSV file</p>
                    <p className="text-xs text-gray-400 mt-1">or click to browse — .xlsx, .xls, .csv supported</p>
                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-xs font-bold hover:bg-primary-700 transition-colors">
                        <UploadCloud size={14} /> Choose File
                    </div>
                </div>
            )}

            {/* ── File loaded: summary ─────────────────────────────────── */}
            {file && rows.length > 0 && (
                <>
                    {/* Stats bar */}
                    <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-50 rounded-lg">
                                    <FileSpreadsheet size={16} className="text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-800">{file.name}</p>
                                    <p className="text-[10px] text-gray-400">{(file.size / 1024).toFixed(1)} KB · {annotated.length} rows extracted</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-3 text-xs">
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-lg">
                                    <CheckCircle2 size={13} className="text-green-600" />
                                    <span className="font-bold text-green-700">{matched.length} matched</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-lg">
                                    <AlertTriangle size={13} className="text-amber-600" />
                                    <span className="font-bold text-amber-700">{unmatched.length} unmatched codes</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-lg">
                                    <Download size={13} className="text-blue-600" />
                                    <span className="font-bold text-blue-700">{included.length} to import</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={reset} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                    <X size={13} /> Clear
                                </button>
                                <button
                                    onClick={handleImport}
                                    disabled={importing || included.length === 0}
                                    className="flex items-center gap-1.5 px-4 py-1.5 bg-primary-600 text-white text-xs font-bold rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {importing
                                        ? <><Loader2 size={13} className="animate-spin" /> Importing…</>
                                        : <><Download size={13} /> Import {included.length} Records</>
                                    }
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Import result */}
                    {importResult && (
                        <div className={`rounded-2xl p-4 border ${importResult.error ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                            {importResult.error ? (
                                <div className="flex items-center gap-2 text-red-700 text-sm font-medium">
                                    <AlertTriangle size={16} /> {importResult.error}
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-green-700 text-sm font-bold">
                                        <CheckCircle2 size={16} />
                                        Successfully imported {importResult.inserted} payment requests{importResult.demo ? ' (demo mode)' : ' to Supabase'}.
                                    </div>
                                    {importResult.errors?.length > 0 && (
                                        <span className="text-xs text-red-600">{importResult.errors.length} batch errors — check console</span>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Detected headers */}
                    {headers.length > 0 && (
                        <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100">
                            <p className="text-[10px] font-bold uppercase text-gray-400 mb-2">Detected Columns ({headers.length})</p>
                            <div className="flex flex-wrap gap-1.5">
                                {headers.map(h => (
                                    <span key={h} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-mono">{h}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Preview table */}
                    <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
                        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-gray-700">Extracted Rows Preview</h2>
                            <span className="text-[10px] text-gray-400">{annotated.length} rows · click row to expand</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50">
                                        <th className="py-2 px-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400 w-8">#</th>
                                        <th className="py-2 px-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">ID</th>
                                        <th className="py-2 px-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400 max-w-[200px]">Activity</th>
                                        <th className="py-2 px-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Code</th>
                                        <th className="py-2 px-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Funding Source</th>
                                        <th className="py-2 px-3 text-right text-[10px] font-bold uppercase tracking-wider text-gray-400">Amount</th>
                                        <th className="py-2 px-3 text-center text-[10px] font-bold uppercase tracking-wider text-gray-400">Status</th>
                                        <th className="py-2 px-3 text-center text-[10px] font-bold uppercase tracking-wider text-gray-400">Code ✓</th>
                                        <th className="py-2 px-3 text-center text-[10px] font-bold uppercase tracking-wider text-gray-400">Import</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {annotated.map((r, i) => (
                                        <React.Fragment key={i}>
                                            <tr
                                                onClick={() => toggleRow(i)}
                                                className={`border-b border-gray-50 cursor-pointer transition-colors ${
                                                    !r.include ? 'opacity-40' :
                                                    r.codeMatched ? 'hover:bg-green-50' : 'hover:bg-amber-50'
                                                }`}
                                            >
                                                <td className="py-2 px-3 text-gray-400 text-[10px]">{i + 1}</td>
                                                <td className="py-2 px-3 font-mono text-gray-600">{r.rawId || '—'}</td>
                                                <td className="py-2 px-3 max-w-[200px]">
                                                    <p className="truncate text-gray-800 font-medium">{r.name || '—'}</p>
                                                    {expandedRows[i] && r.budgetLineActivity && (
                                                        <p className="text-[10px] text-gray-400 mt-0.5 italic">→ {r.budgetLineActivity}</p>
                                                    )}
                                                </td>
                                                <td className="py-2 px-3 font-mono text-gray-700">{r.budget_code || <span className="text-gray-300">—</span>}</td>
                                                <td className="py-2 px-3">
                                                    <span className="font-medium text-gray-700">{r.funding_source}</span>
                                                </td>
                                                <td className="py-2 px-3 text-right font-mono font-bold text-gray-900">{formatZMW(r.amount)}</td>
                                                <td className="py-2 px-3 text-center"><StatusBadge status={r.status} /></td>
                                                <td className="py-2 px-3 text-center">
                                                    {r.budget_code ? (
                                                        r.codeMatched
                                                            ? <CheckCircle2 size={14} className="mx-auto text-green-500" />
                                                            : <AlertTriangle size={14} className="mx-auto text-amber-500" />
                                                    ) : <span className="text-gray-300 text-[10px]">no code</span>}
                                                </td>
                                                <td className="py-2 px-3 text-center">
                                                    {r.include
                                                        ? <CheckCircle2 size={14} className="mx-auto text-blue-500" />
                                                        : <X size={14} className="mx-auto text-gray-300" />
                                                    }
                                                </td>
                                            </tr>
                                            {expandedRows[i] && (
                                                <tr className="bg-gray-50">
                                                    <td colSpan={9} className="px-6 py-3">
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[10px]">
                                                            <div><span className="font-bold text-gray-400 uppercase">Requested By</span><p className="text-gray-700 mt-0.5">{r.requested_by || '—'}</p></div>
                                                            <div><span className="font-bold text-gray-400 uppercase">Payee</span><p className="text-gray-700 mt-0.5">{r.payee || '—'}</p></div>
                                                            <div><span className="font-bold text-gray-400 uppercase">Year</span><p className="text-gray-700 mt-0.5">{r.year}</p></div>
                                                            <div><span className="font-bold text-gray-400 uppercase">Budget Line ID</span><p className="text-gray-700 mt-0.5 font-mono">{r.budgetLineId || '—'}</p></div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* ── Empty state after file load with no rows ─────────────── */}
            {file && rows.length === 0 && !importResult?.error && (
                <div className="bg-white rounded-2xl p-10 text-center shadow-card border border-gray-100">
                    <AlertTriangle size={32} className="mx-auto text-amber-400 mb-3" />
                    <p className="text-sm font-semibold text-gray-600">No rows could be extracted from this file.</p>
                    <p className="text-xs text-gray-400 mt-1">Make sure the file has column headers like: ID, Activity/Purpose, Budget Code, Funding source, Total</p>
                    <button onClick={reset} className="mt-4 flex items-center gap-2 px-4 py-2 text-xs text-primary-600 border border-primary-200 rounded-xl hover:bg-primary-50 mx-auto transition-colors">
                        <RefreshCw size={13} /> Try another file
                    </button>
                </div>
            )}

            {/* ── Guide ────────────────────────────────────────────────── */}
            {!file && (
                <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
                    <h3 className="text-xs font-bold text-gray-700 mb-3">Expected Column Headers</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {[
                            ['ID',             'SharePoint item ID (e.g. 2632)'],
                            ['Activity/Purpose','Description of the request'],
                            ['Requested by.',  'Staff member name'],
                            ['Budget Code.',   'ZGF code e.g. 1.1.1, 5.3.1'],
                            ['Funding source', 'Comic Relief / MOTTIII / etc.'],
                            ['Total',          'Amount (K, $, GBP supported)'],
                            ['Payee',          'Who receives the payment'],
                            ['Approval status','Approved / Pending / Rejected'],
                        ].map(([col, desc]) => (
                            <div key={col} className="p-3 bg-gray-50 rounded-xl">
                                <p className="text-[10px] font-mono font-bold text-gray-700">{col}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">{desc}</p>
                            </div>
                        ))}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-3">
                        ⚡ Mixed currencies are automatically converted: USD × 25, GBP × 30. ZMW values are used directly.
                    </p>
                </div>
            )}
        </div>
    )
}
