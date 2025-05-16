'use client'

import { useState, useEffect } from 'react'
import DashboardStats from '@/components/DashboardStats'
import Header from '@/components/Header'
import PortfolioSection from '@/components/PortfolioSection'
import Sidebar from '@/components/Sidebar'

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    const handleToggleSidebar = (event: Event) => {
      // CustomEvent'ten gelen detail özelliğini kontrol et
      const customEvent = event as CustomEvent
      if (customEvent.detail?.force === false) {
        setIsSidebarOpen(false)
      } else {
        setIsSidebarOpen(prev => !prev)
      }
    }

    window.addEventListener('toggle-sidebar', handleToggleSidebar)
    return () => window.removeEventListener('toggle-sidebar', handleToggleSidebar)
  }, [])

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-theme">
      {/* Mobil Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed md:relative md:block w-64 h-full border-r border-theme-light bg-theme z-50 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}>
        <Sidebar />
      </div>

      {/* Ana İçerik */}
      <main className="flex-1 bg-theme-dark w-full">
        <Header />

        {/* İçerik */}
        <div className="p-6">
          <div className="mx-auto max-w-6xl space-y-6">
            <DashboardStats />
            <PortfolioSection />
          </div>
        </div>
      </main>
    </div>
  )
}