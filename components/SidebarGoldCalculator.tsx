'use client'

import { useState, useEffect } from 'react'
import { BoltIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline'
import axios from 'axios'

interface CollectAPIResponse {
  success: boolean
  result: {
    buying: number
    selling: number
    datetime: string
    change_rate: number
    change_amount: number
    name: string
  }[]
}

const API_CONFIG = {
  baseURL: 'https://api.collectapi.com/economy/goldPrice',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'apikey 5B98TSB5yby4Si1t6unQ1k:2In7VKlQTRrgkWPaQ4e5FF'
  }
}

interface GoldPrice {
  name: string
  code: string
  buying: number
  selling: number
  change: number
  lastUpdate: string
}

const goldTypes: { [key: string]: { key: string; type: string; trackerKey: string; multiplier: number } } = {
  Gram: { key: 'gram-altin', type: 'Gram Altın', trackerKey: 'Gram', multiplier: 1 },
  Cumhuriyet: { key: 'cumhuriyet-altin', type: 'Cumhuriyet Altını', trackerKey: 'Cumhuriyet', multiplier: 7.32 },
  Yarım: { key: 'yarim-altin', type: 'Yarım Altın', trackerKey: 'Yarım', multiplier: 3.5 },
  Çeyrek: { key: 'ceyrek-altin', type: 'Çeyrek Altın', trackerKey: 'Çeyrek', multiplier: 1.75 },
}

export default function SidebarGoldCalculator() {
  const [amount, setAmount] = useState('')
  const [selectedGold, setSelectedGold] = useState('Gram')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [goldPrices, setGoldPrices] = useState<Record<string, GoldPrice>>({
    Gram: { name: 'Gram Altın', code: 'Gram', buying: 0, selling: 0, change: 0, lastUpdate: '' },
    Cumhuriyet: { name: 'Cumhuriyet Altını', code: 'Cumhuriyet', buying: 0, selling: 0, change: 0, lastUpdate: '' },
    Yarım: { name: 'Yarım Altın', code: 'Yarım', buying: 0, selling: 0, change: 0, lastUpdate: '' },
    Çeyrek: { name: 'Çeyrek Altın', code: 'Çeyrek', buying: 0, selling: 0, change: 0, lastUpdate: '' }
  })

  // API'den altın fiyatlarını çekme
  // GoldTracker'dan fiyat verilerini al
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await axios.get<CollectAPIResponse>(API_CONFIG.baseURL, {
          headers: API_CONFIG.headers
        })

        if (response.data.success) {
          const newGoldPrices = { ...goldPrices }

          response.data.result.forEach(item => {
            const normalizedName = item.name.toLowerCase()
              .replace(/\s+/g, '-')
              .replace(/[ıİ]/g, 'i')
              .replace(/[ğĞ]/g, 'g')
              .replace(/[üÜ]/g, 'u')
              .replace(/[şŞ]/g, 's')
              .replace(/[öÖ]/g, 'o')
              .replace(/[çÇ]/g, 'c')

            // API response'daki isimle eşleşen goldType'ı bul
            // Önce gram altın fiyatını bul
            if (normalizedName === goldTypes.Gram.key || normalizedName.includes('gram')) {
              const gramBuying = Number(item.buying)
              const gramSelling = Number(item.selling)

              if (!isNaN(gramBuying) && !isNaN(gramSelling)) {
                // Diğer altın türlerinin fiyatlarını hesapla
                Object.entries(goldTypes).forEach(([code, goldType]) => {
                  newGoldPrices[code] = {
                    name: goldType.type,
                    code,
                    buying: gramBuying * goldType.multiplier,
                    selling: gramSelling * goldType.multiplier,
                    change: 0,
                    lastUpdate: item.datetime
                  }
                })
              }
            }
          })

          setGoldPrices(newGoldPrices)
        }
      } catch (error) {
        console.error('Fiyat verileri alınırken hata:', error)
        setError('Fiyat verileri alınamadı')
      } finally {
        setLoading(false)
      }
    }

    fetchPrices()
    const interval = setInterval(fetchPrices, 30000)
    return () => clearInterval(interval)
  }, [])

  // Saat güncellemesi
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const calculateValue = () => {
    const amountNum = Number(amount)
    if (!amount || isNaN(amountNum)) {
      return { total: '0,00', unitPrice: '0,00' }
    }

    const goldPrice = goldPrices[selectedGold]
    if (!goldPrice) {
      return { total: '0,00', unitPrice: '0,00' }
    }

    // Her altın türü için birim fiyat zaten çarpanla hesaplanmış durumda
    const unitPrice = goldPrice.selling
    // Toplam değer sadece miktar ile birim fiyatın çarpımı
    const total = amountNum * unitPrice

    return {
      total: total.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      unitPrice: unitPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }
  }


  // Yükleme ve hata durumları için UI
  if (loading || error) {
    return (
      <div className="w-full rounded-2xl bg-theme-dark/90 backdrop-blur-xl p-4">
        <div className="flex flex-col items-center justify-center space-y-2 h-60">
          {loading ? (
            <>
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-yellow-500 border-t-transparent"></div>
              <div className="text-xs text-content-secondary">Altın fiyatları yükleniyor...</div>
            </>
          ) : (
            <>
              <div className="text-red-500 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="text-sm text-red-500 text-center">{error}</div>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                Yeniden Dene
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  // Main component UI
  return (
    <div className="w-full">
      {/* Gradient border ve arka plan efekti */}
      <div className="relative">
        {/* Animasyonlu arka plan efekti */}
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-yellow-300/20 to-yellow-600/20 blur-3xl animate-pulse-soft"></div>

        {/* Ana kart */}
        <div className="relative rounded-2xl bg-theme-dark/90 backdrop-blur-xl">
          {/* Üst kısım - Dekoratif çizgiler */}
          <div className="absolute inset-x-0 top-0 h-32 overflow-hidden rounded-t-2xl">
            <div className="absolute inset-0">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="absolute h-[2px] w-full bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent"
                  style={{
                    top: `${i * 8}px`,
                    transform: `rotate(${i % 2 ? 1 : -1}deg)`,
                    animation: `pulse ${3 + i}s infinite`,
                    opacity: 1 - (i * 0.15)
                  }}
                ></div>
              ))}
            </div>
          </div>

          {/* Kart içeriği */}
          <div className="relative p-4">
            {/* Üst bilgi alanı */}
            <div className="mb-6 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <BoltIcon className="h-5 w-5 text-yellow-500 animate-pulse" />
                  <span className="text-sm font-medium text-content">Altın Hesaplayıcı</span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-content-secondary">
                  <div className="flex items-center gap-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div>
                    <span>Canlı</span>
                  </div>
                  <span>•</span>
                  <span suppressHydrationWarning>{currentTime.toLocaleTimeString('tr-TR')}</span>
                </div>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500/10">
                <ArrowTrendingUpIcon className="h-5 w-5 text-yellow-500" />
              </div>
            </div>

            {/* Altın hesaplayıcı */}
            <div className="relative space-y-3">
              {/* Altın seçimi ve miktar */}
              <div className="group relative">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-300 opacity-0 blur transition-opacity group-hover:opacity-20"></div>
                <div className="relative flex items-center gap-2">
                  <select
                    value={selectedGold}
                    onChange={(e) => setSelectedGold(e.target.value)}
                    className="w-32 rounded-lg border-none bg-theme-light/10 px-2 py-1.5 text-sm text-content transition-colors hover:bg-theme-light/20 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/20"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.5rem center',
                      backgroundSize: '1.2em 1.2em',
                      paddingRight: '2rem'
                    }}
                  >
                    {Object.entries(goldPrices).map(([code, data]) => (
                      <option
                        key={code}
                        value={code}
                        className="bg-theme-dark text-content hover:bg-theme-light/20"
                      >
                        {data.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Miktar"
                    className="w-full rounded-lg border-none bg-theme-light/10 px-3 py-1.5 text-sm text-content placeholder:text-content-secondary transition-colors hover:bg-theme-light/20"
                  />
                </div>
              </div>

              {/* Fiyat bilgisi */}
              <div className="rounded-lg bg-theme-light/5 p-3">
                <div className="text-xs text-content-secondary">
                  <span>Birim Fiyat</span>
                </div>
                <div className="mt-1 text-lg font-medium text-content">
                  ₺{calculateValue().unitPrice}
                </div>
              </div>

              {/* Toplam değer */}
              <div className="rounded-lg bg-theme-light/5 p-4">
                <div className="text-sm text-content-secondary">Toplam Değer</div>
                <div className="mt-1 text-2xl font-semibold text-content">
                  ₺{calculateValue().total}
                </div>
              </div>
            </div>

            {/* Alt bilgi - Yeni tasarım */}
            <div className="mt-4 flex items-center justify-between border-t border-theme-light/5 pt-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-yellow-500/50"></div>
                  <span className="text-xs font-medium tracking-wider text-content-secondary">GOLD</span>
                </div>
                <span className="text-[10px] text-content-secondary/50">v1.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
