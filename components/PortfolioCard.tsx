interface PortfolioCardProps {
  title: string
  value: string
  change: string
  trend: 'up' | 'down'
}

export default function PortfolioCard({ title, value, change, trend }: PortfolioCardProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-800">{title}</h3>
        <span className={`flex items-center gap-1 rounded-full px-2 py-1 text-sm font-medium ${
          trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {trend === 'up' ? '↑' : '↓'} {change}
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold text-gray-900">${value}</p>
    </div>
  )
} 