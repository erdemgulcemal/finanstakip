'use client'

import { useState, useEffect } from 'react'
import { BellIcon, Bars3Icon } from '@heroicons/react/24/outline'
import {
  CurrencyDollarIcon,
  CurrencyEuroIcon,
  CurrencyPoundIcon,
  CurrencyYenIcon
} from '@heroicons/react/24/solid'
import axios from 'axios'
import NotificationDropdown from './NotificationDropdown' // Yeni eklenen import

// Bildirim arayüzü
interface Notification {
  id: string
  message: string
  timestamp: Date
  read: boolean
  permanent?: boolean // Kalıcı bildirim özelliği eklendi
}

// Döviz kuru verisi arayüzü
interface ExchangeRates {
  [key: string]: number
}

export default function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(true) // Başlangıçta açık olacak
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'permanent-currency',
      message: 'Döviz kurları gösterge niteliğindedir. Kesin işlemler için lütfen bankanız veya diğer finans kurumları ile iletişime geçiniz.',
      timestamp: new Date(),
      read: false,
      permanent: true // Kalıcı bildirim
    },
    {
      id: 'permanent-gold',
      message: 'Altın fiyatları referans amaçlıdır. Güncel ve kesin fiyatlar için kuyumcunuz veya bankanız ile görüşmenizi öneririz.',
      timestamp: new Date(),
      read: false,
      permanent: true // Kalıcı bildirim
    }
  ])
  const [unreadCount, setUnreadCount] = useState(2) // Başlangıçta 2 okunmamış bildirim
  const [previousRates, setPreviousRates] = useState<ExchangeRates>({})
  const [currentTime, setCurrentTime] = useState(new Date())

  // Saat güncellemesi
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Döviz kurlarını çekme ve bildirim oluşturma
  useEffect(() => {
    const fetchRatesAndNotify = async () => {
      try {
        const response = await axios.get('https://api.exchangerate-api.com/v4/latest/TRY')
        const newRates: ExchangeRates = response.data.rates

        const trackedCurrencies = ['USD', 'EUR', 'GBP'] // Takip edilecek para birimleri
        const newNotifications: Notification[] = []

        trackedCurrencies.forEach(code => {
          const newValue = 1 / newRates[code]
          const oldValue = previousRates[code] ? 1 / previousRates[code] : newValue
          const changePercent = ((newValue - oldValue) / oldValue) * 100

          // Belirli bir eşiği aşan değişimler için bildirim oluştur (%0.1 gibi)
          if (previousRates[code] && Math.abs(changePercent) > 0.1) {
            const direction = changePercent > 0 ? 'yükseldi' : 'düştü'
            const message = `${code} %${Math.abs(changePercent).toFixed(2)} ${direction}. Yeni değer: ${newValue.toFixed(4)} TRY`
            newNotifications.push({
              id: `${code}-${Date.now()}`,
              message,
              timestamp: new Date(),
              read: false
            })
          }
        })

        if (newNotifications.length > 0) {
          // Kalıcı bildirimleri koru ve yeni bildirimleri ekle
          setNotifications(prev => {
            const permanentNotifications = prev.filter(n => (n as any).permanent)
            return [...newNotifications, ...permanentNotifications].slice(0, 20) // Son 20 bildirimi tut
          })
          setUnreadCount(prev => prev + newNotifications.length)
        }

        setPreviousRates(newRates)

      } catch (error) {
        console.error('Döviz kurları çekilemedi veya bildirim oluşturulamadı:', error)
      }
    }

    fetchRatesAndNotify() // İlk çalıştırma
    const interval = setInterval(fetchRatesAndNotify, 60000) // Her dakika güncelle

    return () => clearInterval(interval)
  }, [previousRates])

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    )
    setUnreadCount(prev => (prev > 0 ? prev - 1 : 0))
  }

  const handleClearAll = () => {
    // Kalıcı bildirimleri koru, diğerlerini temizle
    const permanentNotifications = notifications.filter(n => (n as any).permanent)
    setNotifications(permanentNotifications)
    setUnreadCount(permanentNotifications.filter(n => !n.read).length)
    setIsDropdownOpen(false) // Dropdown'ı kapat
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-theme-light/10 bg-theme-card px-3 md:px-6">
      {/* Sol Taraf - Menü ve Saat */}
      <div className="flex items-center gap-4 md:gap-6">
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('toggle-sidebar'))}
          className="block md:hidden rounded-lg p-2 text-content-secondary hover:bg-theme-light hover:text-accent"
        >
          <Bars3Icon className="h-5 w-5" />
        </button>
        <div className="text-base md:text-lg font-medium text-content" suppressHydrationWarning>
          {currentTime.toLocaleTimeString('tr-TR')}
        </div>
        <div className="hidden md:block text-sm text-content-secondary" suppressHydrationWarning>
          {currentTime.toLocaleDateString('tr-TR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </div>

      {/* Orta - Logo ve Para Birimleri */}
      <div className="hidden md:flex items-center gap-6">
        <div className="flex items-center gap-3 border-l border-theme-light/10 pl-6">
          <div className="flex -space-x-1">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent">
              <CurrencyDollarIcon className="h-5 w-5" />
            </div>
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-accent-purple/10 text-accent-purple">
              <CurrencyEuroIcon className="h-5 w-5" />
            </div>
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-accent-green/10 text-accent-green">
              <CurrencyPoundIcon className="h-5 w-5" />
            </div>
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-accent-red/10 text-accent-red">
              <CurrencyYenIcon className="h-5 w-5" />
            </div>
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary-500/10 text-primary-500">
              <span className="text-lg font-semibold">₺</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobil Para Birimleri */}
      <div className="md:hidden flex items-center">
        <div className="flex -space-x-1 scale-90">
          <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 text-accent">
            <CurrencyDollarIcon className="h-4 w-4" />
          </div>
          <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-accent-purple/10 text-accent-purple">
            <CurrencyEuroIcon className="h-4 w-4" />
          </div>
          <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-primary-500/10 text-primary-500">
            <span className="text-base font-semibold">₺</span>
          </div>
        </div>
      </div>

      {/* Sağ Taraf - Bildirimler ve Tema Değiştirici */}
      <div className="relative flex items-center gap-2 md:gap-4">
        <button
          onClick={() => {
            setIsDropdownOpen(!isDropdownOpen)
            // Dropdown açıldığında okunmamış sayısını sıfırla (isteğe bağlı)
            // setUnreadCount(0)
          }}
          className="relative rounded-lg p-2 text-content-secondary hover:bg-theme-light hover:text-accent"
        >
          <BellIcon className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount} {/* 9+ gösterimi */}
            </span>
          )}
        </button>
        {isDropdownOpen && (
          <NotificationDropdown
            notifications={notifications}
            onClose={() => setIsDropdownOpen(false)}
            onMarkAsRead={handleMarkAsRead}
            onClearAll={handleClearAll}
          />
        )}
        <div className="h-8 w-px bg-theme-light/10"></div>
        {/* Tema Değiştirici buraya eklenebilir */}
      </div>
    </header>
  )
}