import React from 'react'
import { X, Calendar, Code2, Tag, Layers, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { formatZMW } from '../data/budgetData'

function QuarterBar({ label, amount, max }) {
    const pct = max > 0 ? Math.min((amount / max) * 100, 100) : 0
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-xs">
                <span className="font-medium text-gray-600">{label}</span>
                <span className="text-gray-500">{formatZMW(amount)}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-primary-500 rounded-full transition-all duration-700"
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    )
}

function StatusIcon({ status }) {
    if (status === 'Approved') return <CheckCircle2 size={12} className="text-primary-600" />
    if (status === 'Rejected') return <XCircle size={12} className="text-red-500" />
    return <Clock size={12} className="text-amber-500" />
}

export default function BudgetDetailPanel({ line, requests, onClose }) {
    if (!line) return null

    const spent = line.spent || 0
    const remaining = line.totalCost - spent
    const pct = line.totalCost > 0 ? (spent / line.totalCost) * 100 : 0
    const relatedRequests = requests.filter((r) => r.budgetLineId === line.id)

    const statusColor =
        pct > 100 ? 'bg-red-500' :
            pct > 80 ? 'bg-amber-500' :
                pct > 50 ? 'bg-blue-500' :
                    'bg-primary-500'

    return (
        <div className="fixed inset-0 z-30 flex">
            {/* Backdrop */}
            <div className="flex-1 bg-black/20 backdrop-blur-sm" onClick={onClose} />

            {/* Panel */}
            <div className="w-full max-w-md bg-white shadow-2xl animate-slide-in-right flex flex-col overflow-y-auto">
                {/* Header */}
                <div className="flex items-start justify-between p-5 border-b border-gray-100 bg-primary-50">
                    <div>
                        <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide">{line.id}</p>
                        <h2 className="text-base font-bold text-gray-900 mt-0.5 leading-snug">{line.activity}</h2>
                        <p className="text-xs text-gray-500 mt-1">{line.strategicPillar}</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                        <X size={16} />
                    </button>
                </div>

                {/* Budget Progress */}
                <div className="p-5 border-b border-gray-100">
                    <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                        <span>Utilisation</span>
                        <span className="font-semibold">{pct.toFixed(1)}%</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${statusColor} rounded-full transition-all duration-700`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-4">
                        {[
                            { label: 'Total Budget', val: line.totalCost, color: 'text-gray-800' },
                            { label: 'Spent', val: spent, color: 'text-red-600' },
                            { label: 'Remaining', val: remaining, color: 'text-primary-700' },
                        ].map(({ label, val, color }) => (
                            <div key={label} className="text-center">
                                <p className={`text-sm font-bold ${color}`}>{formatZMW(val)}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quarter Breakdown */}
                <div className="p-5 border-b border-gray-100 space-y-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                        <Calendar size={12} /> Quarter Breakdown
                    </p>
                    <QuarterBar label="Q1 (Jan–Mar)" amount={line.q1} max={line.totalCost} />
                    <QuarterBar label="Q2 (Apr–Jun)" amount={line.q2} max={line.totalCost} />
                    <QuarterBar label="Q3 (Jul–Sep)" amount={line.q3} max={line.totalCost} />
                    <QuarterBar label="Q4 (Oct–Dec)" amount={line.q4} max={line.totalCost} />
                </div>

                {/* Metadata */}
                <div className="p-5 border-b border-gray-100 space-y-2.5 text-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5 mb-3">
                        <Layers size={12} /> Details
                    </p>
                    {[
                        { label: 'Funding Source', value: line.fundingSource, icon: Tag },
                        { label: 'Budget Code', value: line.budgetCode, icon: Code2 },
                        { label: 'ZGF Code', value: line.zgfCode, icon: Tag },
                        { label: 'Odoo Category', value: line.odooCategory, icon: Layers },
                        { label: 'Objective', value: line.objective, icon: Tag },
                    ].map(({ label, value, icon: Ico }) => (
                        <div key={label} className="flex gap-2">
                            <Ico size={13} className="text-gray-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-[10px] text-gray-400">{label}</p>
                                <p className="text-xs font-medium text-gray-800">{value || '—'}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Related Payment Requests */}
                <div className="p-5">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        Payment Requests ({relatedRequests.length})
                    </p>
                    {relatedRequests.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">No payment requests linked to this line item.</p>
                    ) : (
                        <div className="space-y-2">
                            {relatedRequests.map((req) => (
                                <div key={req.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <StatusIcon status={req.status} />
                                        <div>
                                            <p className="text-xs font-medium text-gray-800 leading-tight">{req.name}</p>
                                            <p className="text-[10px] text-gray-400">{req.date} · {req.requestedBy}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-gray-800">{formatZMW(req.amount)}</p>
                                        <span className={`text-[10px] font-medium ${req.status === 'Approved' ? 'text-primary-600' :
                                                req.status === 'Rejected' ? 'text-red-500' : 'text-amber-600'
                                            }`}>{req.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
