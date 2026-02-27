import React, { useState, useCallback } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import Dashboard from './pages/Dashboard'
import BudgetLines from './pages/BudgetLines'
import PaymentRequests from './pages/PaymentRequests'
import Analytics from './pages/Analytics'
import { syncFromSharePoint } from './lib/sharepointSync'
import { isSharePointConfigured } from './lib/sharepointSync'
import { isSupabaseConfigured } from './lib/supabaseClient'

const PAGE_TITLES = {
    '/': 'Dashboard',
    '/budget-lines': 'Budget Lines',
    '/payment-requests': 'Payment Requests',
    '/analytics': 'Analytics',
}

function Layout() {
    const [collapsed, setCollapsed] = useState(false)
    const [fundingFilter, setFundingFilter] = useState('All')
    const [syncing, setSyncing] = useState(false)
    const { pathname } = useLocation()

    const title = PAGE_TITLES[pathname] || 'ZGF Budget Tracker'

    const handleSync = useCallback(async () => {
        setSyncing(true)
        try {
            if (isSharePointConfigured && isSupabaseConfigured) {
                await syncFromSharePoint()
            } else {
                // Demo delay
                await new Promise((r) => setTimeout(r, 1500))
            }
        } catch (err) {
            console.error('[Sync]', err)
        } finally {
            setSyncing(false)
        }
    }, [])

    return (
        <div className="flex h-screen overflow-hidden bg-surface">
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopBar
                    title={title}
                    fundingFilter={fundingFilter}
                    setFundingFilter={setFundingFilter}
                    onSync={pathname === '/payment-requests' ? handleSync : undefined}
                    syncing={syncing}
                />
                <main className="flex-1 overflow-y-auto">
                    <Routes>
                        <Route path="/" element={<Dashboard fundingFilter={fundingFilter} />} />
                        <Route path="/budget-lines" element={<BudgetLines fundingFilter={fundingFilter} />} />
                        <Route path="/payment-requests" element={<PaymentRequests fundingFilter={fundingFilter} />} />
                        <Route path="/analytics" element={<Analytics fundingFilter={fundingFilter} />} />
                    </Routes>
                </main>
            </div>
        </div>
    )
}

export default function App() {
    return (
        <BrowserRouter>
            <Layout />
        </BrowserRouter>
    )
}
