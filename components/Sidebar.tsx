'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  HomeIcon,
  ChartBarIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { GoldIcon } from './icons/GoldIcon'
import SidebarGoldCalculator from './SidebarGoldCalculator'

export default function Sidebar() {
  const pathname = usePathname()
  const [openMenus, setOpenMenus] = useState<string[]>([])

  const menuItems = [
    { name: 'Ana Sayfa', href: '/', icon: HomeIcon },
    { name: 'Portföy', href: '/portfolio', icon: ChartBarIcon },
    { name: 'Altın Takip', href: '/gold-tracker', icon: GoldIcon }
  ]

  return (
    <div className="flex h-full flex-col bg-theme">
      <div className="flex h-16 items-center justify-between gap-2 px-6">
        <div className="flex items-center gap-2">
          <span className="text-accent">●</span>
          <span className="text-lg font-medium text-content">Finans Takip</span>
        </div>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('toggle-sidebar'))}
          className="block md:hidden rounded-lg p-1.5 text-content-secondary hover:bg-theme-light hover:text-accent"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-col flex-1">
        <nav className="space-y-1 p-4">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`sidebar-item ${isActive ? 'active' : ''}`}
                onClick={() => window.dispatchEvent(new CustomEvent('toggle-sidebar'))}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Altın Hesaplayıcı Kartı */}
        <div className="px-4 pt-4">
          <SidebarGoldCalculator />
        </div>
      </div>
    </div>
  )
}
