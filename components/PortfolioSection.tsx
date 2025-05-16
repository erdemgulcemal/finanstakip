'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import axios from 'axios'
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline'

interface CurrencyData {
  symbol: string
  name: string
  amount: number
  rate: number
  change: number
  value: number
  chartData: { value: number }[]
}

export default function PortfolioSection() {
  const [activeTab, setActiveTab] = useState('all')
  const [currencies, setCurrencies] = useState<CurrencyData[]>([])
  const [loading, setLoading] = useState(true)

  // İzlenecek para birimleri
  const currencyList = [
    { code: 'USD', symbol: '$', name: 'Amerikan Doları', amount: 1 },
    { code: 'EUR', symbol: '€', name: 'Euro', amount: 1 },
    { code: 'GBP', symbol: '£', name: 'İngiliz Sterlini', amount: 1 },
    { code: 'JPY', symbol: '¥', name: 'Japon Yeni', amount: 1 },
    { code: 'CHF', symbol: 'Fr', name: 'İsviçre Frangı', amount: 1 },
    { code: 'CAD', symbol: '$', name: 'Kanada Doları', amount: 1 },
    { code: 'AUD', symbol: '$', name: 'Avustralya Doları', amount: 1 },
    { code: 'CNY', symbol: '¥', name: 'Çin Yuanı', amount: 1 }
  ]

  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        setLoading(true)
        // Güncel kurlar
        const response = await axios.get('https://api.exchangerate-api.com/v4/latest/TRY')

        // Son 7 günlük veri için tarihler
        const dates = Array.from({ length: 7 }, (_, i) => {
          const date = new Date()
          date.setDate(date.getDate() - (6 - i))
          return date.toISOString().split('T')[0]
        })

        // Her para birimi için veri oluştur
        const currenciesData = await Promise.all(
          currencyList.map(async (currency) => {
            // Bir gün önceki kur için
            const yesterdayDate = dates[dates.length - 2]
            const yesterdayResponse = await axios.get(
              `https://api.exchangerate-api.com/v4/latest/${currency.code}?date=${yesterdayDate}`
            )

            const currentRate = 1 / response.data.rates[currency.code]
            const yesterdayRate = 1 / yesterdayResponse.data.rates[currency.code]
            const changePercent = ((currentRate - yesterdayRate) / yesterdayRate) * 100

            // Son 7 günlük veri simülasyonu
            const historicalData = dates.map(() => ({
              value: currentRate * (1 + (Math.random() - 0.5) * 0.02)
            }))

            return {
              symbol: currency.code,
              name: currency.name,
              amount: currency.amount,
              rate: currentRate,
              change: changePercent,
              value: currency.amount * currentRate,
              chartData: historicalData
            }
          })
        )

        setCurrencies(currenciesData)
        setLoading(false)
      } catch (error) {
        console.error('Döviz kurları alınamadı:', error)
        setLoading(false)
      }
    }

    fetchExchangeRates()
    const interval = setInterval(fetchExchangeRates, 60000) // Her dakika güncelle

    return () => clearInterval(interval)
  }, [])

  const filteredCurrencies = currencies.filter(currency => {
    if (activeTab === 'yükselenler') return currency.change > 0
    if (activeTab === 'düşenler') return currency.change < 0
    return true
  })

  // Miktar değişikliğini yönetmek için
  const handleAmountChange = (symbol: string, newAmount: string) => {
    const numericAmount = newAmount.replace(/[^0-9.]/g, '')

    setCurrencies(prevCurrencies =>
      prevCurrencies.map(currency => {
        if (currency.symbol === symbol) {
          const amount = parseFloat(numericAmount) || 0
          return {
            ...currency,
            amount,
            value: amount * currency.rate // TL değerini güncelle
          }
        }
        return currency
      })
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-0 md:justify-between">
        <h2 className="text-base md:text-lg font-medium text-content">Diğer Para Birimleri</h2>
        <button className="self-end text-sm text-accent hover:text-accent/80">
          Tümünü Gör →
        </button>
      </div>

      <div className="flex gap-2 md:gap-4 border-b border-theme-light overflow-x-auto scrollbar-hide">
        {['Tümü', 'Yükselenler', 'Düşenler'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase())}
            className={`px-3 md:px-4 py-2 text-sm whitespace-nowrap transition-colors ${
              activeTab === tab.toLowerCase()
                ? 'border-b-2 border-accent text-accent font-medium'
                : 'text-content-secondary hover:text-content'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-3 md:space-y-4">
        {loading ? (
          <div className="text-center text-content-secondary">Yükleniyor...</div>
        ) : (
          filteredCurrencies.map((currency) => (
            <div key={currency.symbol} className="relative overflow-hidden rounded-xl">
              <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 rounded-lg bg-theme-card p-4 hover:bg-theme-light/10 transition-colors">
                {/* Üst Kısım - Mobilde görünür */}
                <div className="flex items-center justify-between md:hidden">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-theme-light/10">
                      <span className="text-lg font-semibold text-content">{currency.symbol}</span>
                    </div>
                    <div>
                      <div className="font-medium text-content">{currency.symbol}</div>
                      <div className="text-sm text-content-secondary">{currency.name}</div>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                    currency.change >= 0 ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-red/10 text-accent-red'
                  }`}>
                    {currency.change >= 0 ? <ArrowTrendingUpIcon className="h-4 w-4" /> : <ArrowTrendingDownIcon className="h-4 w-4" />}
                    {currency.change >= 0 ? '+' : ''}{currency.change.toFixed(2)}%
                  </div>
                </div>

                {/* Para Birimi Bilgisi - Desktop */}
                <div className="hidden md:block min-w-[120px]">
                  <div className="font-medium text-content">{currency.symbol}</div>
                  <div className="text-sm text-content-secondary">{currency.name}</div>
                </div>

                {/* Miktar ve Kur Bilgisi */}
                <div className="grid grid-cols-2 md:flex gap-4 md:gap-6">
                  <div className="min-w-[100px]">
                    <div className="text-sm text-content-secondary mb-1">Miktar</div>
                    <input
                      type="text"
                      value={currency.amount.toLocaleString('tr-TR')}
                      onChange={(e) => handleAmountChange(currency.symbol, e.target.value)}
                      className="w-full md:w-32 bg-transparent text-lg md:text-xl font-semibold text-content focus:outline-none"
                      placeholder="0"
                    />
                  </div>

                  <div className="min-w-[120px]">
                    <div className="text-sm text-content-secondary">Güncel Kur</div>
                    <div className="text-lg md:text-xl font-semibold text-content">
                      ₺{currency.rate.toLocaleString('tr-TR', { maximumFractionDigits: 4 })}
                    </div>
                  </div>

                  {/* Değişim - Desktop */}
                  <div className="hidden md:block min-w-[100px]">
                    <div className="text-sm text-content-secondary">Değişim</div>
                    <div className={`flex items-center gap-1 ${
                      currency.change >= 0 ? 'text-accent-green' : 'text-accent-red'
                    }`}>
                      {currency.change >= 0 ? <ArrowTrendingUpIcon className="h-4 w-4" /> : <ArrowTrendingDownIcon className="h-4 w-4" />}
                      {currency.change >= 0 ? '+' : ''}{currency.change.toFixed(2)}%
                    </div>
                  </div>

                  <div className="min-w-[120px]">
                    <div className="text-sm text-content-secondary">TL Değeri</div>
                    <div className="text-lg md:text-xl font-semibold text-content">
                      ₺{currency.value.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>

                {/* Grafik */}
                <div className="h-16 md:h-12 w-full md:w-32 md:ml-auto mt-2 md:mt-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={currency.chartData}>
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={currency.change >= 0 ? '#1AB98B' : '#FF5C5C'}
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="relative rounded-xl bg-theme-dark/90 backdrop-blur-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* ... para birimi bilgileri aynı */}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
