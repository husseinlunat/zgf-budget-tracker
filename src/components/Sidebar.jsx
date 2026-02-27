import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
    LayoutDashboard,
    ListOrdered,
    ClipboardList,
    BarChart3,
    ChevronLeft,
    ChevronRight,
    Building2,
} from 'lucide-react'

const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/budget-lines', label: 'Budget Lines', icon: ListOrdered },
    { to: '/payment-requests', label: 'Payment Requests', icon: ClipboardList },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
]

export default function Sidebar({ collapsed, setCollapsed }) {
    return (
        <aside
            className={`
        flex flex-col bg-white border-r border-gray-100 shadow-card
        transition-all duration-300 ease-in-out h-screen sticky top-0
        ${collapsed ? 'w-16' : 'w-60'}
      `}
        >
            {/* Logo */}
            <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-100">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center shadow-sm animate-pulse-glow">
                    <Building2 size={16} className="text-white" />
                </div>
                {!collapsed && (
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold text-primary-700 leading-tight">ZGF</p>
                        <p className="text-[10px] text-gray-400 font-medium leading-tight uppercase tracking-wide">Budget Tracker 2026</p>
                    </div>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                {navItems.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === '/'}
                        className={({ isActive }) =>
                            isActive ? 'nav-link-active group' : 'nav-link group'
                        }
                        title={collapsed ? label : undefined}
                    >
                        <Icon size={18} className="flex-shrink-0" />
                        {!collapsed && <span className="truncate">{label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* Collapse Toggle */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="flex items-center justify-center h-10 border-t border-gray-100 text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors duration-150"
                title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
                {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
        </aside>
    )
}
