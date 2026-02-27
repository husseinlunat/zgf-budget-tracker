import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function StatCard({ label, value, sub, trend, icon: Icon, color = 'green', delay = 0 }) {
    const colors = {
        green: { bg: 'bg-primary-50', icon: 'text-primary-600', ring: 'ring-primary-100' },
        amber: { bg: 'bg-amber-50', icon: 'text-amber-600', ring: 'ring-amber-100' },
        red: { bg: 'bg-red-50', icon: 'text-red-600', ring: 'ring-red-100' },
        blue: { bg: 'bg-blue-50', icon: 'text-blue-600', ring: 'ring-blue-100' },
    }
    const c = colors[color] || colors.green

    const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus
    const trendColor = trend > 0 ? 'text-primary-600' : trend < 0 ? 'text-red-500' : 'text-gray-400'

    return (
        <div
            className="stat-card animate-fade-in-up"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="flex items-start justify-between">
                <div className={`p-2.5 rounded-xl ${c.bg} ring-1 ${c.ring}`}>
                    <Icon size={18} className={c.icon} />
                </div>
                {trend !== undefined && (
                    <span className={`flex items-center gap-0.5 text-xs font-medium ${trendColor}`}>
                        <TrendIcon size={12} />
                        {Math.abs(trend).toFixed(1)}%
                    </span>
                )}
            </div>
            <div>
                <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>
                <p className="text-xs font-medium text-gray-500 mt-0.5">{label}</p>
                {sub && <p className="text-[10px] text-gray-400 mt-1">{sub}</p>}
            </div>
        </div>
    )
}
