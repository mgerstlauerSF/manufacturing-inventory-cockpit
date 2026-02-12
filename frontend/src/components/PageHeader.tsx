import { memo, type ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  icon?: ReactNode
  actions?: ReactNode
}

export const PageHeader = memo(function PageHeader({ title, subtitle, icon, actions }: PageHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-navy-800 to-navy-800/50 border-b border-navy-700/50 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-10 h-10 bg-accent-blue/20 rounded-xl flex items-center justify-center">
              {icon}
            </div>
          )}
          <div>
            <h1 className="text-xl font-semibold text-slate-100">{title}</h1>
            {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  )
})

interface SectionProps {
  title: string
  subtitle?: string
  children: ReactNode
  className?: string
}

export function Section({ title, subtitle, children, className = '' }: SectionProps) {
  return (
    <section className={`card ${className}`}>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
        {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
      </div>
      {children}
    </section>
  )
}

interface AlertCardProps {
  type: 'critical' | 'warning' | 'success'
  title: string
  description: string
  details?: string
  action?: string
}

export function AlertCard({ type, title, description, details, action }: AlertCardProps) {
  const baseClass = type === 'critical' ? 'alert-critical' : type === 'warning' ? 'alert-warning' : 'alert-success'
  
  return (
    <div className={`${baseClass} mb-3`}>
      <div className="font-semibold text-slate-100">{title}</div>
      <p className="text-sm text-slate-300 mt-1">{description}</p>
      {details && <p className="text-xs text-slate-400 mt-1">{details}</p>}
      {action && <p className="text-xs text-accent-blue mt-2 font-medium">{action}</p>}
    </div>
  )
}
