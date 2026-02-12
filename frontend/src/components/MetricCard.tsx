import { memo, type ReactNode } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  trendInverse?: boolean
}

export const MetricCard = memo(function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend,
  trendValue,
  trendInverse = false
}: MetricCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  
  const getTrendColor = () => {
    if (!trend || trend === 'neutral') return 'text-slate-400'
    const isPositive = trend === 'up'
    if (trendInverse) {
      return isPositive ? 'text-accent-red' : 'text-accent-green'
    }
    return isPositive ? 'text-accent-green' : 'text-accent-red'
  }

  return (
    <article className="metric-card">
      <div className="flex items-start gap-4">
        {icon && (
          <div className="w-12 h-12 rounded-xl bg-accent-blue/20 flex items-center justify-center flex-shrink-0" aria-hidden="true">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-400 truncate mb-1">{title}</p>
          <p className="text-2xl font-semibold text-slate-100 tabular-nums">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-1 truncate">{subtitle}</p>}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 ${getTrendColor()}`} aria-label={`Trend: ${trend}`}>
            <TrendIcon size={18} aria-hidden="true" />
            {trendValue && <span className="text-sm font-medium tabular-nums">{trendValue}</span>}
          </div>
        )}
      </div>
    </article>
  )
})

interface KPIGridProps {
  children: ReactNode
}

export function KPIGrid({ children }: KPIGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {children}
    </div>
  )
}
