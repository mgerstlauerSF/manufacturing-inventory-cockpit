import { useState, memo, type ReactNode } from 'react'
import { LayoutDashboard, Settings, Truck, Bot, ChevronLeft, ChevronRight } from 'lucide-react'

interface NavItem {
  id: string
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  description: string
}

interface LayoutProps {
  children: ReactNode
  currentPage: string
  onNavigate: (page: string) => void
  navItems: NavItem[]
  appName: string
  chatOpen?: boolean
  onToggleChat?: () => void
}

const NavButton = memo(function NavButton({ 
  item, 
  isActive, 
  onClick, 
  showLabel 
}: { 
  item: NavItem
  isActive: boolean
  onClick: () => void
  showLabel: boolean
}) {
  const Icon = item.icon
  return (
    <button
      onClick={onClick}
      aria-label={item.description}
      aria-current={isActive ? 'page' : undefined}
      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all
        focus-visible:ring-2 focus-visible:ring-accent-blue focus-visible:outline-none
        ${isActive ? 'bg-accent-blue/10 text-accent-blue' : 'text-slate-400 hover:bg-navy-700/50 hover:text-slate-200'}`}
    >
      <Icon size={18} />
      {showLabel && <span className="text-sm font-medium">{item.label}</span>}
    </button>
  )
})

export function Layout({ children, currentPage, onNavigate, navItems, appName, chatOpen, onToggleChat }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-navy-900 flex">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-accent-blue focus:text-white focus:z-50">
        Skip to main content
      </a>
      
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-navy-800/50 border-r border-navy-700/50 flex flex-col transition-all duration-200`}>
        <div className="p-4 border-b border-navy-700/50 flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-cyan rounded-lg flex items-center justify-center">
                <LayoutDashboard size={16} className="text-white" />
              </div>
              <h1 className="font-bold text-slate-200 text-sm">{appName}</h1>
            </div>
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className="p-2 rounded-lg hover:bg-navy-700 focus-visible:ring-2 focus-visible:ring-accent-blue transition-colors"
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>
        
        <nav className="flex-1 p-3 space-y-1" role="navigation" aria-label="Main">
          {navItems.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              isActive={currentPage === item.id}
              onClick={() => onNavigate(item.id)}
              showLabel={sidebarOpen}
            />
          ))}
        </nav>

        {onToggleChat && (
          <div className="p-3 border-t border-navy-700/50">
            <button
              onClick={onToggleChat}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all
                ${chatOpen ? 'bg-accent-purple/10 text-accent-purple' : 'text-slate-400 hover:bg-navy-700/50 hover:text-slate-200'}`}
              aria-label="Toggle AI Assistant"
            >
              <Bot size={18} />
              {sidebarOpen && <span className="text-sm font-medium">AI Assistant</span>}
              {chatOpen && sidebarOpen && (
                <span className="ml-auto w-2 h-2 bg-accent-green rounded-full animate-pulse" />
              )}
            </button>
          </div>
        )}
      </aside>
      
      <main id="main-content" className="flex-1 overflow-auto" role="main">
        {children}
      </main>
    </div>
  )
}

export const defaultNavItems: NavItem[] = [
  { id: 'command-center', label: 'Command Center', icon: LayoutDashboard, description: 'Global overview and KPIs' },
  { id: 'simulator', label: 'Planning Simulator', icon: Settings, description: 'Production & inventory simulation' },
  { id: 'logistics', label: 'Logistics', icon: Truck, description: '3PL provider optimization' },
  { id: 'ai-analytics', label: 'AI Analytics', icon: Bot, description: 'ML forecasts and insights' },
]
