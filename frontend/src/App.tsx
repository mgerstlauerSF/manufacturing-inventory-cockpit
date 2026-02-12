import { useState, useCallback } from 'react'
import { Layout, defaultNavItems } from './components/Layout'
import { CortexAgentChat } from './components/CortexAgentChat'
import CommandCenterPage from './pages/CommandCenterPage'
import SimulatorPage from './pages/SimulatorPage'
import LogisticsPage from './pages/LogisticsPage'
import AIAnalyticsPage from './pages/AIAnalyticsPage'
import './styles/globals.css'

function App() {
  const [currentPage, setCurrentPage] = useState('command-center')
  const [chatOpen, setChatOpen] = useState(false)

  const handleNavigate = useCallback((page: string) => {
    setCurrentPage(page)
  }, [])

  const toggleChat = useCallback(() => {
    setChatOpen(prev => !prev)
  }, [])

  const renderPage = () => {
    switch (currentPage) {
      case 'command-center':
        return <CommandCenterPage />
      case 'simulator':
        return <SimulatorPage />
      case 'logistics':
        return <LogisticsPage />
      case 'ai-analytics':
        return <AIAnalyticsPage />
      default:
        return <CommandCenterPage />
    }
  }

  return (
    <>
      <Layout
        appName="Manufacturing Cockpit"
        currentPage={currentPage}
        onNavigate={handleNavigate}
        navItems={defaultNavItems}
        chatOpen={chatOpen}
        onToggleChat={toggleChat}
      >
        {renderPage()}
      </Layout>

      <CortexAgentChat
        agentEndpoint="/api/agent/chat"
        agentName="Manufacturing AI"
        welcomeMessage="Hello! I'm your Manufacturing Intelligence Assistant. Ask me about inventory levels, production planning, logistics performance, or supply chain risks."
        suggestedQuestions={[
          "What are the critical inventory alerts?",
          "Show me high-risk suppliers",
          "Which plants have the most cash tied?",
        ]}
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
      />
    </>
  )
}

export default App
