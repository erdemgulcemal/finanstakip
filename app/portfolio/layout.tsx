'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    const handleToggleSidebar = () => {
      setIsSidebarOpen(prev => !prev)
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
      <div className="flex-1 w-full">
        {/* Header */}
        <Header />

        {/* Sayfa İçeriği */}
        <main className="bg-theme-dark">
          {children}
        </main>
      </div>
    </div>
  )
}