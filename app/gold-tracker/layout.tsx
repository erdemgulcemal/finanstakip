import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'

export default function GoldTrackerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-theme">
      {/* Sidebar */}
      <div className="w-64 border-r border-theme-light">
        <Sidebar />
      </div>

      {/* Ana İçerik */}
      <div className="flex-1">
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