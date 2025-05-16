'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { CalculatorIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'
import Sidebar from './Sidebar'

interface SimulationResult {
  buyPrice: number
  currentPrice: number
  buyValueTRY: number    // Alış tarihindeki TL değeri
  currentValueTRY: number // Güncel TL değeri
  profitLoss: number
  profitLossPercentage: number
}

export default function ProfitLossCalculator() {
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [buyDate, setBuyDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SimulationResult | null>(null)

  const currencies = {
    USD: { name: 'Amerikan Doları', symbol: '$' },
    EUR: { name: 'Euro', symbol: '€' },
    GBP: { name: 'İngiliz Sterlini', symbol: '£' },
    TRY: { name: 'Türk Lirası', symbol: '₺' },
    JPY: { name: 'Japon Yeni', symbol: '¥' },
    CHF: { name: 'İsviçre Frangı', symbol: 'Fr' }
  }

  // Bugünün ve minimum tarihin hesaplanması
  const today = new Date().toISOString().split('T')[0]
  const minDate = new Date()
  minDate.setFullYear(minDate.getFullYear() - 1) // 1 yıl öncesi
  const minDateStr = minDate.toISOString().split('T')[0]

  // Component yüklendiğinde bugünün tarihini set et
  useEffect(() => {
    setBuyDate(today)
  }, [])

  // API Yapılandırması
  const API_KEY = '86b44e5edd0b977a56e783c4de8cd957'
  const BASE_URL = 'http://api.exchangeratesapi.io/v1'

  const calculateSimulation = async () => {
    if (!amount || !buyDate || !currency) return

    try {
      setLoading(true)

      // Tarih kontrolü
      const selectedDate = new Date(buyDate)
      const currentDate = new Date()
      const oneYearAgo = new Date()
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

      if (selectedDate > currentDate) {
        alert('Gelecek bir tarih seçemezsiniz!')
        return
      }

      if (selectedDate < oneYearAgo) {
        alert('Son 1 yıl içindeki bir tarih seçebilirsiniz!')
        return
      }

      // Geçmiş tarih için kur bilgisi
      const buyDateResponse = await axios.get(
        `${BASE_URL}/${buyDate}?access_key=${API_KEY}&base=EUR&symbols=TRY,${currency}`
      )

      // Güncel kur bilgisi
      const currentResponse = await axios.get(
        `${BASE_URL}/latest?access_key=${API_KEY}&base=EUR&symbols=TRY,${currency}`
      )

      if (!buyDateResponse.data.rates || !currentResponse.data.rates) {
        throw new Error('Kur verileri alınamadı')
      }

      // EUR bazlı kurları TRY'ye çevirme
      const buyPrice = buyDateResponse.data.rates.TRY / buyDateResponse.data.rates[currency]
      const currentPrice = currentResponse.data.rates.TRY / currentResponse.data.rates[currency]

      // TL değerlerini hesapla
      const buyValueTRY = Number(amount) * buyPrice
      const currentValueTRY = Number(amount) * currentPrice

      // Kar/Zarar hesaplamaları
      const profitLoss = currentValueTRY - buyValueTRY
      const profitLossPercentage = ((currentValueTRY - buyValueTRY) / buyValueTRY) * 100

      setResult({
        buyPrice,
        currentPrice,
        buyValueTRY,
        currentValueTRY,
        profitLoss,
        profitLossPercentage
      })

    } catch (error) {
      console.error('Hesaplama hatası:', error)
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          alert('API anahtarı geçersiz veya eksik. Lütfen geçerli bir API anahtarı ekleyin.')
        } else if (error.response?.status === 429) {
          alert('API kullanım limiti aşıldı. Lütfen daha sonra tekrar deneyin.')
        } else if (error.response?.status === 404) {
          alert('Seçili tarih için kur verisi bulunamadı. Lütfen başka bir tarih seçin.')
        } else {
          alert('Kur verileri alınırken bir hata oluştu. Lütfen tekrar deneyin.')
        }
      } else if (error instanceof Error) {
        alert(error.message)
      } else {
        alert('Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-theme">
      {/* Sidebar */}
      <div className="w-64 border-r border-theme-light">
        <Sidebar />
      </div>

      {/* Ana İçerik */}
      <div className="flex-1 bg-theme-dark p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Başlık - Yeni Tasarım */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
              <CalculatorIcon className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-content">Kar/Zarar Hesaplayıcı</h1>
              <p className="text-sm text-content-secondary">Geçmiş yatırımlarınızın performansını analiz edin</p>
            </div>
          </div>

          {/* Bilgi Notu - API Key Uyarısı */}
          <div className="relative overflow-hidden rounded-xl bg-theme-light/5 p-4">
            <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-accent-purple/5 to-primary-500/5 blur-3xl"></div>
            <div className="relative flex items-start gap-3">
              <ExclamationCircleIcon className="h-5 w-5 flex-shrink-0 text-accent" />
              <div className="space-y-2">
                <p className="text-sm text-content-secondary">
                  Bu özelliği kullanmak için ExchangeRates API anahtarı gereklidir.
                  API anahtarını şu adımları izleyerek alabilirsiniz:
                </p>
                <ol className="ml-4 list-decimal text-sm text-content-secondary">
                  <li>https://exchangeratesapi.io/ adresine gidin</li>
                  <li>Ücretsiz hesap oluşturun</li>
                  <li>API anahtarınızı kopyalayın</li>
                  <li>Kodda API_KEY değişkenini güncelleyin</li>
                </ol>
                <p className="text-sm text-content-secondary mt-2">
                  Son 12 aya ait kur verilerine erişebilirsiniz.
                  ({new Date(minDateStr).toLocaleDateString('tr-TR')} - {new Date(today).toLocaleDateString('tr-TR')})
                </p>
              </div>
            </div>
          </div>

          {/* Hesaplama Formu - Yeni Tasarım */}
          <div className="relative overflow-hidden rounded-2xl bg-theme-dark/90 backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-r from-accent/20 via-accent-purple/20 to-primary-500/20 blur-3xl animate-pulse-soft"></div>
            <div className="relative space-y-6 p-6">
              <div className="space-y-2">
                <h2 className="text-lg font-medium text-content">Geçmiş Tarih Simülasyonu</h2>
                <p className="text-sm text-content-secondary">
                  Geçmişte yatırım yapsaydınız bugün ne kadar kazanç/kayıp yaşardınız?
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <div className="group relative">
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-accent to-accent-purple opacity-0 blur transition-opacity group-hover:opacity-20"></div>
                  <div className="relative space-y-1.5">
                    <label className="text-sm font-medium text-content-secondary">Para Birimi</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full rounded-lg border-none bg-theme-light/10 px-3 py-2 text-sm text-content transition-colors hover:bg-theme-light/20 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/20"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 0.5rem center',
                        backgroundSize: '1.2em 1.2em',
                        paddingRight: '2rem'
                      }}
                    >
                      {Object.entries(currencies).map(([code, { name }]) => (
                        <option key={code} value={code} className="bg-theme-dark text-content">
                          {code} - {name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="group relative">
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-accent to-accent-purple opacity-0 blur transition-opacity group-hover:opacity-20"></div>
                  <div className="relative space-y-1.5">
                    <label className="text-sm font-medium text-content-secondary">Miktar</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full rounded-lg border-none bg-theme-light/10 px-3 py-2 text-sm text-content placeholder:text-content-secondary transition-colors hover:bg-theme-light/20 focus:outline-none focus:ring-2 focus:ring-accent/20"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="group relative">
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-accent to-accent-purple opacity-0 blur transition-opacity group-hover:opacity-20"></div>
                  <div className="relative space-y-1.5">
                    <label className="text-sm font-medium text-content-secondary">Alış Tarihi</label>
                    <input
                      type="date"
                      value={buyDate}
                      onChange={(e) => setBuyDate(e.target.value)}
                      className="w-full rounded-lg border-none bg-theme-light/10 px-3 py-2 text-sm text-content transition-colors hover:bg-theme-light/20 focus:outline-none focus:ring-2 focus:ring-accent/20"
                      min={minDateStr}
                      max={today}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={calculateSimulation}
                  disabled={loading || !amount || !buyDate}
                  className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-theme transition-all hover:bg-accent/90 focus:outline-none focus:ring-4 focus:ring-accent/20 disabled:opacity-50"
                >
                  {loading ? 'Hesaplanıyor...' : 'Hesapla'}
                </button>
              </div>
            </div>
          </div>

          {/* Sonuç - Yeni Tasarım */}
          {result && (
            <div className="relative overflow-hidden rounded-2xl bg-theme-dark/90 backdrop-blur-xl">
              <div className="absolute inset-0 bg-gradient-to-r from-accent/20 via-accent-purple/20 to-primary-500/20 blur-3xl animate-pulse-soft"></div>
              <div className="relative space-y-6 p-6">
                <h2 className="text-lg font-medium text-content">Sonuç</h2>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-lg bg-theme-light/5 p-4">
                    <div className="text-sm text-content-secondary">Alış Tarihi Kur Değeri</div>
                    <div className="mt-2 text-2xl font-semibold text-content">
                      1 {currency} = ₺{result.buyPrice.toLocaleString('tr-TR', { maximumFractionDigits: 4 })}
                    </div>
                    <div className="mt-1 text-sm text-content-secondary">
                      {amount} {currency} = ₺{result.buyValueTRY.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div className="rounded-lg bg-theme-light/5 p-4">
                    <div className="text-sm text-content-secondary">Güncel Kur Değeri</div>
                    <div className="mt-2 text-2xl font-semibold text-content">
                      1 {currency} = ₺{result.currentPrice.toLocaleString('tr-TR', { maximumFractionDigits: 4 })}
                    </div>
                    <div className="mt-1 text-sm text-content-secondary">
                      {amount} {currency} = ₺{result.currentValueTRY.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <div className="rounded-lg bg-theme-light/5 p-4">
                      <div className="text-sm text-content-secondary">Kar/Zarar</div>
                      <div className={`mt-2 text-2xl font-semibold ${result.profitLoss >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                        {result.profitLoss >= 0 ? '+' : ''}
                        ₺{result.profitLoss.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}
                        <span className="ml-2 text-base">
                          ({result.profitLossPercentage >= 0 ? '+' : ''}
                          {result.profitLossPercentage.toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 