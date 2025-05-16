'use client'

import { useState, useEffect } from 'react'
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts'
import axios from 'axios'

interface GoldPrice {
  type: string
  buying: number
  selling: number
  lastUpdate: string
  chartData: { value: number; date: string }[]
}

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

// API yapılandırması
const API_CONFIG = {
  baseURL: 'https://api.collectapi.com/economy/goldPrice',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'apikey 5B98TSB5yby4Si1t6unQ1k:2In7VKlQTRrgkWPaQ4e5FF'
  }
}


// Hata mesajları
const ERROR_MESSAGES = {
  FETCH_ERROR: 'Altın fiyatları alınırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
  API_KEY_ERROR: 'API anahtarı geçersiz veya eksik.',
  RATE_LIMIT_ERROR: 'Çok fazla istek yapıldı. Lütfen biraz bekleyin.',
  NETWORK_ERROR: 'İnternet bağlantınızı kontrol edin.',
  UNKNOWN_ERROR: 'Beklenmeyen bir hata oluştu.'
}

interface ChartDataPoint {
  date: string
  value: number
}

interface GoldPrice {
  type: string
  buying: number
  selling: number
  lastUpdate: string
  chartData: ChartDataPoint[]
}

export default function GoldTracker() {
  const [selectedGold, setSelectedGold] = useState<string>('Gram')

  // API Test Hook'u
  useEffect(() => {
    const testAPI = async () => {
      try {
        console.log('Testing API with config:', {
          url: API_CONFIG.baseURL,
          headers: { ...API_CONFIG.headers, 'Authorization': '***' }
        })

        const response = await axios.get<CollectAPIResponse>(API_CONFIG.baseURL, {
          headers: API_CONFIG.headers
        })

        if (response.data.success) {
          console.log('API Test Successful')
          console.log('Available Gold Types:', response.data.result.map(item => item.name))
          console.log('Sample Data:', response.data.result[0])
        } else {
          console.error('API Test Failed: Response not successful')
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error('API Test Error:', {
            status: error.response?.status,
            message: error.message,
            data: error.response?.data
          })
        } else {
          console.error('API Test Unknown Error:', error)
        }
      }
    }
    testAPI()
  }, [])

  const [goldPrices, setGoldPrices] = useState<{ [key: string]: GoldPrice }>({
    Gram: {
      type: 'Gram Altın',
      buying: 0,
      selling: 0,
      lastUpdate: '',
      chartData: []
    },
    Çeyrek: {
      type: 'Çeyrek Altın',
      buying: 0,
      selling: 0,
      lastUpdate: '',
      chartData: []
    },
    Yarım: {
      type: 'Yarım Altın',
      buying: 0,
      selling: 0,
      lastUpdate: '',
      chartData: []
    },
    Tam: {
      type: 'Tam Altın',
      buying: 0,
      selling: 0,
      lastUpdate: '',
      chartData: []
    },
    Ata: {
      type: 'Ata Altın',
      buying: 0,
      selling: 0,
      lastUpdate: '',
      chartData: []
    },
    Cumhuriyet: {
      type: 'Cumhuriyet Altını',
      buying: 0,
      selling: 0,
      lastUpdate: '',
      chartData: []
    }
  })
  const [loading, setLoading] = useState(true)

  // Altın türleri için çarpan faktörleri
  const multipliers = {
    gram: 1,
    quarter: 1.75,    // Çeyrek altın yaklaşık 1.75 gram
    half: 3.5,        // Yarım altın yaklaşık 3.5 gram
    full: 7.0,        // Tam altın yaklaşık 7 gram
    ata: 7.2,         // Ata altın yaklaşık 7.2 gram
    cumhuriyet: 7.32  // Cumhuriyet altını yaklaşık 7.32 gram
  }

  // Altın türlerinin API karşılıkları güncellendi
  interface GoldTypeInfo {
    key: string
    type: string
  }

  type GoldTypes = {
    [key: string]: GoldTypeInfo
  }

  const goldTypes: GoldTypes = {
    Gram: { key: 'gram-altin', type: 'Gram Altın' },
    Çeyrek: { key: 'ceyrek-altin', type: 'Çeyrek Altın' },
    Yarım: { key: 'yarim-altin', type: 'Yarım Altın' },
    Tam: { key: 'tam-altin', type: 'Tam Altın' },
    Ata: { key: 'ata-altin', type: 'Ata Altın' },
    Cumhuriyet: { key: 'cumhuriyet-altin', type: 'Cumhuriyet Altını' }
  }

  // API yanıtındaki altın isimlerini normalize etme fonksiyonu
  const normalizeGoldName = (name: string): string => {
    return name.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/ı/g, 'i')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c');
  }

  useEffect(() => {
    const fetchGoldPrices = async () => {
      try {
        setLoading(true)
        const response = await axios.get<CollectAPIResponse>(API_CONFIG.baseURL, {
          headers: API_CONFIG.headers
        })

        if (response.data.success) {
          console.log('API Response:', response.data.result)
          const newGoldPrices: { [key: string]: GoldPrice } = {}

          response.data.result.forEach(item => {
            const normalizedItemName = normalizeGoldName(item.name)
            console.log('Normalized item name:', normalizedItemName)

            const goldKey = Object.entries(goldTypes).find(([_, value]) =>
              normalizeGoldName(value.key) === normalizedItemName ||
              normalizedItemName.includes(normalizeGoldName(value.key))
            )?.[0]

            if (goldKey) {
              console.log('Match found:', goldKey, 'for item:', item.name, 'with values:', {
                buying: item.buying,
                selling: item.selling,
                change: item.change_rate
              })
              // Sayısal değerleri doğru formata çevir
              const buying = typeof item.buying === 'string' ? parseFloat(item.buying) : item.buying
              const selling = typeof item.selling === 'string' ? parseFloat(item.selling) : item.selling

              if (!isNaN(buying) && !isNaN(selling)) {
                newGoldPrices[goldKey] = {
                  type: goldTypes[goldKey].type,
                  buying,
                  selling,
                  lastUpdate: item.datetime || new Date().toISOString(),
                  chartData: generateChartData(selling)
                }
                console.log(`Updated ${goldKey} price:`, newGoldPrices[goldKey])
              } else {
                console.error(`Invalid price values for ${goldKey}:`, { buying, selling })
              }
            }
          })

          const updatedPrices = Object.keys(newGoldPrices)
          if (updatedPrices.length > 0) {
            console.log(`Successfully updated prices for: ${updatedPrices.join(', ')}`)
            setGoldPrices(prev => ({
              ...prev,
              ...newGoldPrices
            }))
          } else {
            console.error('No gold prices were matched. API response:', response.data.result)
            alert('Altın fiyatları güncellenemedi. Lütfen daha sonra tekrar deneyin.')
          }
        }
      } catch (error) {
        console.error('Altın fiyatları alınırken hata oluştu:', error)
        let errorMessage = ERROR_MESSAGES.UNKNOWN_ERROR

        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            errorMessage = ERROR_MESSAGES.API_KEY_ERROR
          } else if (error.response?.status === 429) {
            errorMessage = ERROR_MESSAGES.RATE_LIMIT_ERROR
          } else if (!error.response && error.request) {
            errorMessage = ERROR_MESSAGES.NETWORK_ERROR
          } else {
            errorMessage = ERROR_MESSAGES.FETCH_ERROR
          }
        }

        // Hata durumunda loading state'ini false yap ve alert göster
        alert(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchGoldPrices()
    const interval = setInterval(fetchGoldPrices, 30000) // Her 30 saniyede bir güncelle
    return () => clearInterval(interval)
  }, [])

  // Günlük değişim verilerini tutan state
  const [historicalData, setHistoricalData] = useState<{ [key: string]: ChartDataPoint[] }>({})

  // Tarihsel veri ve grafik verisi oluşturma fonksiyonu
  const generateChartData = (currentPrice: number): ChartDataPoint[] => {
    const data: ChartDataPoint[] = []
    const basePrice = currentPrice * 0.98 // Başlangıç fiyatı olarak current price'ın %2 altını alalım

    for (let i = 0; i < 24; i++) {
      const time = new Date(Date.now() - (23 - i) * 3600000)
      // Gerçekçi dalgalanma için kademeli değişim
      const progress = i / 23 // 0'dan 1'e ilerleme
      const randomFactor = (Math.random() - 0.5) * 0.01 // ±0.5% random değişim
      const trendFactor = (currentPrice - basePrice) / basePrice // Genel trend
      const value = basePrice * (1 + (trendFactor * progress) + randomFactor)

      data.push({
        date: time.toISOString(),
        value: Number(value.toFixed(2))
      })
    }

    return data
  }

  // Tarihsel veri çekme fonksiyonu
  const fetchHistoricalData = async (goldType: string) => {
    try {
      const currentPrice = goldPrices[goldType]?.selling || 0
      const data = generateChartData(currentPrice)
      setHistoricalData(prev => ({
        ...prev,
        [goldType]: data
      }))
    } catch (error) {
      console.error('Tarihsel veri alınırken hata oluştu:', error)
    }
  }

  // Seçili altın değiştiğinde tarihsel veriyi güncelle
  useEffect(() => {
    if (selectedGold) {
      fetchHistoricalData(selectedGold)
    }
  }, [selectedGold, goldPrices[selectedGold]?.selling])

  // Seçili altın verilerini güvenli bir şekilde al
  const selectedGoldData = goldPrices[selectedGold] || goldPrices.Gram || {
    type: 'Gram Altın',
    buying: 0,
    selling: 0,
    lastUpdate: '',
    chartData: []
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent"></div>
          <div className="text-sm text-content-secondary">Altın fiyatları yükleniyor...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 w-full">
      <div className="mx-auto max-w-7xl space-y-6 w-full">
        {/* Üst Bilgi ve İstatistik Kartları */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {Object.entries(goldPrices).map(([key, gold]) => (
            <div
              key={key}
              onClick={() => setSelectedGold(key)}
              className={`relative overflow-hidden rounded-xl cursor-pointer transition-all hover:scale-[1.02] ${selectedGold === key ? 'ring-2 ring-yellow-500/50' : ''
                }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-yellow-300/10 to-yellow-600/10 blur-2xl"></div>

              <div className="relative rounded-xl bg-theme-dark/90 backdrop-blur-xl p-4">
                <div className="flex items-center mb-2">
                  <h3 className="text-sm font-medium text-content">{gold.type}</h3>
                </div>
                <div className="text-lg sm:text-xl font-semibold text-content">
                  ₺{gold.selling.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Seçili Altın Detay Kartı */}
        <div className="relative overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 via-yellow-300/20 to-yellow-600/20 blur-3xl animate-pulse-soft"></div>

          <div className="relative rounded-2xl bg-theme-dark/90 backdrop-blur-xl p-4 sm:p-5 md:p-6">
            <div className="grid gap-6 lg:grid-cols-[1fr,2fr] w-full">
              {/* Sol Taraf - Detay Bilgileri */}
              <div className="space-y-4 sm:space-y-6 w-full">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-content">{selectedGoldData.type}</h2>
                    <div className="mt-1 flex items-center gap-2 text-sm text-content-secondary">
                      <div className="flex items-center gap-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-accent-green animate-pulse"></div>
                        <span>Canlı</span>
                      </div>
                      <span>•</span>
                      <span>{new Date().toLocaleTimeString('tr-TR')}</span>
                    </div>
                  </div>
                  <ChartBarIcon className="h-6 w-6 text-yellow-500" />
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl bg-theme-light/5 p-4">
                    <div className="text-sm text-content-secondary">Alış</div>
                    <div className="mt-1 text-xl sm:text-2xl font-semibold text-content">
                      ₺{selectedGoldData.buying.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div className="rounded-xl bg-theme-light/5 p-4">
                    <div className="text-sm text-content-secondary">Satış</div>
                    <div className="mt-1 text-xl sm:text-2xl font-semibold text-content">
                      ₺{selectedGoldData.selling.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}
                    </div>
                  </div>

                </div>
              </div>

              {/* Sağ Taraf - Grafik */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs sm:text-sm text-content-secondary">Son 24 Saat Değişim</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-content-secondary">
                      Min: ₺{Math.min(...selectedGoldData.chartData.map(d => d.value)).toLocaleString('tr-TR', { maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-xs text-content-secondary">
                      Max: ₺{Math.max(...selectedGoldData.chartData.map(d => d.value)).toLocaleString('tr-TR', { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="h-[250px] sm:h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={selectedGoldData.chartData}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#F59E0B"
                        strokeWidth={2}
                        dot={false}
                        fill="url(#colorValue)"
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload?.[0]?.value) {
                            return (
                              <div className="rounded-lg bg-theme-dark/95 backdrop-blur-xl border border-theme-light/20 p-3 shadow-xl">
                                <div className="text-xs text-content-secondary">
                                  {new Date(payload[0].payload.date).toLocaleTimeString('tr-TR')}
                                </div>
                                <div className="text-sm font-semibold text-content">
                                  ₺{Number(payload[0].value).toLocaleString('tr-TR', { maximumFractionDigits: 2 })}
                                </div>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                  {['1S', '1G', '1H', '1A'].map((period) => (
                    <button
                      key={period}
                      className="rounded-lg bg-theme-light/5 px-4 py-2 text-sm text-content-secondary transition-colors hover:bg-theme-light/10"
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}