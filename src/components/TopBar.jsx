import React from 'react'
import { Bell, RefreshCw } from 'lucide-react'

export default function TopBar({ title, fundingFilter, setFundingFilter, onSync, syncing }) {
    return (
        <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-3.5 bg-white/90 backdrop-blur border-b border-gray-100 shadow-sm">
            {/* Page title */}
            <h1 className="text-base font-semibold text-gray-800">{title}</h1>

            {/* Controls */}
            <div className="flex items-center gap-3">
                {/* Funding Source Filter */}
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
                    {['All', 'KaluluII', 'ZGF'].map((src) => (
                        <button
                            key={src}
                            onClick={() => setFundingFilter(src)}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-150 ${fundingFilter === src
                                    ? 'bg-white text-primary-700 shadow-sm font-semibold'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {src}
                        </button>
                    ))}
                </div>

                {/* Year badge */}
                <span className="badge badge-green text-xs font-semibold">FY 2026</span>

                {/* Sync button */}
                {onSync && (
                    <button
                        onClick={onSync}
                        disabled={syncing}
                        className="btn-outline text-xs gap-1.5"
                        title="Sync from SharePoint"
                    >
                        <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
                        {!syncing ? 'Sync' : 'Syncing…'}
                    </button>
                )}

                {/* Notification bell */}
                <button className="relative p-2 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors">
                    <Bell size={16} />
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary-500 rounded-full" />
                </button>

                {/* Avatar */}
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center text-white text-xs font-bold shadow-sm cursor-pointer">
                    ZGF
                </div>
            </div>
        </header>
    )
}
