export default function ProfitLossLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-theme-dark min-h-[calc(100vh-4rem)]">
      {children}
    </div>
  )
} 