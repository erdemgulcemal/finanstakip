'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { ArrowsRightLeftIcon } from '@heroicons/react/24/outline'

interface ExchangeRates {
  [key: string]: number
}

export default function CurrencyConverter() {
  const [amount, setAmount] = useState('')
  const [fromCurrency, setFromCurrency] = useState('USD')
  const [toCurrency, setToCurrency] = useState('EUR')
  const [rates, setRates] = useState<ExchangeRates>({})
  const [loading, setLoading] = useState(false)

  const currencies = {
    USD: { name: 'Amerikan Doları', symbol: '$' },
    EUR: { name: 'Euro', symbol: '€' },
    TRY: { name: 'Türk Lirası', symbol: '₺' },
    GBP: { name: 'İngiliz Sterlini', symbol: '£' },
    JPY: { name: 'Japon Yeni', symbol: '¥' },
    CHF: { name: 'İsviçre Frangı', symbol: 'Fr' },
    AUD: { name: 'Avustralya Doları', symbol: 'A$' },
    CAD: { name: 'Kanada Doları', symbol: 'C$' },
  }

  useEffect(() => {
    const fetchRates = async () => {
      try {
        setLoading(true)
        const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD')
        setRates(response.data.rates)
      } catch (error) {
        console.error('Döviz kurları çekilemedi:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRates()
    const interval = setInterval(fetchRates, 60000) // Her dakika güncelle

    return () => clearInterval(interval)
  }, [])

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
  }

  const calculateResult = () => {
    if (!amount || !rates[fromCurrency] || !rates[toCurrency]) return ''

    const result = (Number(amount) / rates[fromCurrency]) * rates[toCurrency]
    return result.toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

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
            <div className="mb-6 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <ArrowsRightLeftIcon className="h-5 w-5 text-yellow-500 animate-pulse" />
                  <span className="text-sm font-medium text-content">Döviz Çevirici</span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-content-secondary">
                  <div className="flex items-center gap-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div>
                    <span>Canlı</span>
                  </div>
                  <span>•</span>
                  <span>{new Date().toLocaleTimeString('tr-TR')}</span>
                </div>
              </div>
            </div>

            {/* Döviz çevirici formu */}
            <div className="space-y-4">
              {/* Giriş alanı */}
              <div className="group relative">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-300 opacity-0 blur transition-opacity group-hover:opacity-20"></div>
                <div className="relative flex items-center gap-2">
                  <select
                    value={fromCurrency}
                    onChange={(e) => setFromCurrency(e.target.value)}
                    className="w-32 rounded-lg border-none bg-theme-light/10 px-2 py-1.5 text-sm text-content transition-colors hover:bg-theme-light/20 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                  >
                    {Object.entries(currencies).map(([code, { name }]) => (
                      <option key={code} value={code}>
                        {code} - {name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-lg border-none bg-theme-light/10 px-3 py-1.5 text-sm text-content placeholder:text-content-secondary transition-colors hover:bg-theme-light/20"
                    placeholder="Miktar"
                  />
                </div>
              </div>

              {/* Değiştirme butonu */}
              <div className="relative">
                <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-theme-light/20 to-transparent"></div>
                <button
                  onClick={handleSwapCurrencies}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-theme-dark p-2 text-yellow-500 transition-colors hover:text-yellow-400"
                >
                  <ArrowsRightLeftIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Sonuç alanı */}
              <div className="group relative">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-300 opacity-0 blur transition-opacity group-hover:opacity-20"></div>
                <div className="relative flex items-center gap-2">
                  <select
                    value={toCurrency}
                    onChange={(e) => setToCurrency(e.target.value)}
                    className="w-32 rounded-lg border-none bg-theme-light/10 px-2 py-1.5 text-sm text-content transition-colors hover:bg-theme-light/20 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                  >
                    {Object.entries(currencies).map(([code, { name }]) => (
                      <option key={code} value={code}>
                        {code} - {name}
                      </option>
                    ))}
                  </select>
                  <div className="w-full rounded-lg bg-theme-light/10 px-3 py-1.5">
                    <span className="text-sm font-medium text-content">
                      {calculateResult()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Kur bilgisi */}
            <div className="mt-6 text-center text-xs text-content-secondary">
              {loading ? (
                <span>Kurlar yükleniyor...</span>
              ) : (
                rates[fromCurrency] && rates[toCurrency] && (
                  <span>
                    1 {fromCurrency} = {((1 / rates[fromCurrency]) * rates[toCurrency]).toFixed(4)} {toCurrency}
                  </span>
                )
              )}
            </div>

            {/* Alt bilgi */}
            <div className="mt-4 flex items-center justify-between border-t border-theme-light/5 pt-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-yellow-500/50"></div>
                  <span className="text-xs font-medium tracking-wider text-content-secondary">FOREX</span>
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