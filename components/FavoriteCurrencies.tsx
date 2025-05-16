'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid'

interface CurrencyData {
  code: string
  name: string
  symbol: string
  value: number
  change: number
}

export default function FavoriteCurrencies() {
  const [currencies, setCurrencies] = useState<CurrencyData[]>([
    { code: 'USD', name: 'US Dollar', symbol: '$', value: 0, change: 0 },
    { code: 'EUR', name: 'Euro', symbol: '€', value: 0, change: 0 },
    { code: 'GBP', name: 'British Pound', symbol: '£', value: 0, change: 0 },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', value: 0, change: 0 },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr', value: 0, change: 0 }
  ])

  const [loading, setLoading] = useState(true)
  const [previousRates, setPreviousRates] = useState<{[key: string]: number}>({})

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await axios.get('https://api.exchangerate-api.com/v4/latest/TRY')
        const newRates = response.data.rates

        setCurrencies(prev => prev.map(currency => {
          const newValue = 1 / newRates[currency.code]
          const oldValue = previousRates[currency.code] ? 1 / previousRates[currency.code] : newValue
          const changePercent = ((newValue - oldValue) / oldValue) * 100

          return {
            ...currency,
            value: newValue,
            change: previousRates[currency.code] ? changePercent : 0
          }
        }))

        setPreviousRates(newRates)
        setLoading(false)
      } catch (error) {
        console.error('Döviz kurları çekilemedi:', error)
      }
    }

    fetchRates()
    const interval = setInterval(fetchRates, 30000) // Her 30 saniyede bir güncelle

    return () => clearInterval(interval)
  }, [previousRates])

  if (loading) {
    return (
      <div className="px-4">
        <h2 className="mb-2 text-sm font-medium text-gray-500">Favorites</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((_, index) => (
            <div key={index} className="animate-pulse flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-slate-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-12 rounded bg-slate-200" />
                <div className="h-3 w-20 rounded bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-3 md:p-4">
      <h2 className="mb-3 text-sm font-medium text-gray-500">Diğer Para Birimleri</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-3">
        {currencies.map((currency) => (
          <div
            key={currency.code}
            className="group flex items-center gap-3 rounded-lg border border-slate-100 p-2.5 transition-colors hover:bg-slate-50"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 font-bold text-gray-700">
              {currency.symbol}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{currency.code}</span>
                  <span className={`flex items-center text-xs font-medium px-1.5 py-0.5 rounded-full ${
                    currency.change > 0
                      ? 'text-green-600 bg-green-50'
                      : currency.change < 0
                        ? 'text-red-600 bg-red-50'
                        : 'text-gray-600 bg-gray-50'
                  }`}>
                    {currency.change > 0 ? (
                      <ArrowUpIcon className="mr-0.5 h-3 w-3" />
                    ) : currency.change < 0 ? (
                      <ArrowDownIcon className="mr-0.5 h-3 w-3" />
                    ) : null}
                    {Math.abs(currency.change).toFixed(2)}%
                  </span>
                </div>
              </div>
              <div className="mt-0.5 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  {currency.value.toLocaleString('tr-TR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 4
                  })} ₺
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 