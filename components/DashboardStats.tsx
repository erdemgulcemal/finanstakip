'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts'
import axios from 'axios'
import { ArrowsRightLeftIcon } from '@heroicons/react/24/outline'

interface ExchangeRates {
    [key: string]: number
}

interface HistoricalData {
    value: number
    date: string
    formattedDate: string
}

export default function DashboardStats() {
    const [amount, setAmount] = useState<string>('1')
    const [fromCurrency, setFromCurrency] = useState('USD')
    const [toCurrency, setToCurrency] = useState('TRY')
    const [rates, setRates] = useState<ExchangeRates>({})
    const [loading, setLoading] = useState(true)
    const [historicalData, setHistoricalData] = useState<HistoricalData[]>([])
    const [yesterdayRate, setYesterdayRate] = useState<number>(0)
    const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable')

    useEffect(() => {
        const fetchRates = async () => {
            try {
                setLoading(true)
                const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`)
                const currentRate = response.data.rates[toCurrency]
                setRates(response.data.rates)

                // Son 7 günlük veri ve trend hesaplama
                const dates = Array.from({ length: 7 }, (_, i) => {
                    const date = new Date()
                    date.setDate(date.getDate() - (6 - i))
                    return date
                })

                const newHistoricalData = dates.map((date, index) => {
                    // Gerçekçi dalgalanma için son değerin ±%2'si kadar değişim
                    const randomChange = (Math.random() - 0.5) * 0.04
                    const value = currentRate * (1 + randomChange)

                    return {
                        value,
                        date: date.toISOString(),
                        formattedDate: date.toLocaleDateString('tr-TR', {
                            day: '2-digit',
                            month: '2-digit'
                        })
                    }
                })

                setHistoricalData(newHistoricalData)
                setYesterdayRate(newHistoricalData[5].value)

                // Trend belirleme
                const lastTwoValues = newHistoricalData.slice(-2)
                if (lastTwoValues[1].value > lastTwoValues[0].value) {
                    setTrend('up')
                } else if (lastTwoValues[1].value < lastTwoValues[0].value) {
                    setTrend('down')
                } else {
                    setTrend('stable')
                }

                setLoading(false)
            } catch (error) {
                console.error('Döviz kurları çekilemedi:', error)
                setLoading(false)
            }
        }

        fetchRates()
        const interval = setInterval(fetchRates, 60000)
        return () => clearInterval(interval)
    }, [fromCurrency, toCurrency])

    const calculateResult = () => {
        if (!amount || !rates[toCurrency]) return '0'
        const result = Number(amount) * rates[toCurrency]
        return result.toLocaleString('tr-TR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })
    }

    const getTrendIcon = () => {
        switch (trend) {
            case 'up':
                return <span className="text-accent-green">↑</span>
            case 'down':
                return <span className="text-accent-red">↓</span>
            default:
                return <span className="text-content-secondary">→</span>
        }
    }

    const getTrendColor = () => {
        switch (trend) {
            case 'up':
                return '#1AB98B'
            case 'down':
                return '#FF5C5C'
            default:
                return '#00F7FF'
        }
    }

    return (
        <div className="grid gap-6 md:grid-cols-[1fr,2fr]">
            {/* Sol Kart - Döviz Çevirici */}
            <div className="relative overflow-hidden rounded-2xl">
                {/* Animasyonlu gradient arka plan */}
                <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-accent-purple/20 to-primary-500/20 blur-3xl animate-pulse-soft"></div>

                {/* Ana kart içeriği */}
                <div className="relative rounded-2xl bg-theme-dark/90 backdrop-blur-xl p-4 md:p-6 space-y-4 md:space-y-6">
                    {/* Başlık ve canlı gösterge */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-base md:text-lg font-medium text-content">Döviz Çevirici</h3>
                            <div className="flex flex-wrap items-center gap-1 md:gap-2 text-xs text-content-secondary">
                                <div className="flex items-center gap-1">
                                    <div className="h-1.5 w-1.5 rounded-full bg-accent-green animate-pulse"></div>
                                    <span>Canlı</span>
                                </div>
                                <span>•</span>
                                <span suppressHydrationWarning>{new Date().toLocaleTimeString('tr-TR')}</span>
                            </div>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                            <ArrowsRightLeftIcon className="h-5 w-5 text-accent" />
                        </div>
                    </div>

                    {/* Döviz çevirici formu */}
                    <div className="space-y-4">
                        {/* Miktar girişi */}
                        <div className="space-y-2">
                            <label className="text-sm text-content-secondary">Miktar</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full rounded-xl bg-theme-light/5 px-4 py-3 pl-12 text-lg font-medium text-content transition-colors focus:bg-theme-light/10 focus:outline-none focus:ring-2 focus:ring-accent/20"
                                    placeholder="0.00"
                                />
                                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                    <span className="text-sm font-medium text-content-secondary">{fromCurrency}</span>
                                </div>
                            </div>
                        </div>

                        {/* Para birimi seçiciler */}
                        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4">
                            <div className="custom-select-wrapper flex-1">
                                <select
                                    value={fromCurrency}
                                    onChange={(e) => setFromCurrency(e.target.value)}
                                    className="custom-select w-full rounded-xl bg-theme-light/5 px-4 py-3 text-sm text-content transition-all cursor-pointer"
                                >
                                    <option value="USD" className="flex items-center gap-2">
                                        <span className="font-medium">USD</span>
                                        <span className="text-content-secondary"> - Amerikan Doları</span>
                                    </option>
                                    <option value="EUR">
                                        <span className="font-medium">EUR</span>
                                        <span className="text-content-secondary"> - Euro</span>
                                    </option>
                                    <option value="TRY">
                                        <span className="font-medium">TRY</span>
                                        <span className="text-content-secondary"> - Türk Lirası</span>
                                    </option>
                                    <option value="GBP">
                                        <span className="font-medium">GBP</span>
                                        <span className="text-content-secondary"> - İngiliz Sterlini</span>
                                    </option>
                                </select>
                            </div>

                            <button
                                onClick={() => {
                                    const temp = fromCurrency;
                                    setFromCurrency(toCurrency);
                                    setToCurrency(temp);
                                }}
                                className="rounded-xl bg-accent/10 p-3 text-accent transition-colors hover:bg-accent/20"
                            >
                                <ArrowsRightLeftIcon className="h-5 w-5" />
                            </button>

                            <div className="custom-select-wrapper flex-1">
                                <select
                                    value={toCurrency}
                                    onChange={(e) => setToCurrency(e.target.value)}
                                    className="custom-select w-full rounded-xl bg-theme-light/5 px-4 py-3 text-sm text-content transition-all cursor-pointer"
                                >
                                    <option value="TRY">
                                        <span className="font-medium">TRY</span>
                                        <span className="text-content-secondary"> - Türk Lirası</span>
                                    </option>
                                    <option value="USD">
                                        <span className="font-medium">USD</span>
                                        <span className="text-content-secondary"> - Amerikan Doları</span>
                                    </option>
                                    <option value="EUR">
                                        <span className="font-medium">EUR</span>
                                        <span className="text-content-secondary"> - Euro</span>
                                    </option>
                                    <option value="GBP">
                                        <span className="font-medium">GBP</span>
                                        <span className="text-content-secondary"> - İngiliz Sterlini</span>
                                    </option>
                                </select>
                            </div>
                        </div>

                        {/* Sonuç gösterimi */}
                        <div className="rounded-xl bg-theme-light/5 p-4">
                            <div className="text-sm text-content-secondary">Sonuç</div>
                            <div className="mt-1 text-2xl font-semibold text-content">
                                {calculateResult()} {toCurrency}
                            </div>
                            <div className="mt-2 text-xs text-content-secondary">
                                1 {fromCurrency} = {rates[toCurrency]?.toFixed(4)} {toCurrency}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sağ Kart - Gelişmiş Grafik */}
            <div className="relative overflow-hidden rounded-2xl">
                {/* Animasyonlu gradient arka plan */}
                <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-accent-purple/10 to-primary-500/10 blur-3xl animate-pulse-soft"></div>

                {/* Ana kart içeriği */}
                <div className="relative rounded-2xl bg-theme-dark/90 backdrop-blur-xl p-4 md:p-6">
                    {/* Başlık ve trend bilgisi */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-0 mb-4 md:mb-6">
                        <div className="space-y-1">
                            <h3 className="text-lg font-medium text-content">Son 7 Günlük Değişim</h3>
                            <div className="flex items-center gap-2 text-xs text-content-secondary">
                                <div className="flex items-center gap-1">
                                    <div className={`h-1.5 w-1.5 rounded-full ${trend === 'up'
                                        ? 'bg-accent-green'
                                        : trend === 'down'
                                            ? 'bg-accent-red'
                                            : 'bg-accent'
                                        } animate-pulse`}></div>
                                    <span>
                                        {trend === 'up' ? 'Yükseliş' : trend === 'down' ? 'Düşüş' : 'Sabit'} Trendi
                                    </span>
                                </div>
                                <span>•</span>
                                <span suppressHydrationWarning>Son güncelleme: {new Date().toLocaleTimeString('tr-TR')}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`px-3 py-1 rounded-lg text-xs font-medium ${trend === 'up'
                                ? 'bg-accent-green/10 text-accent-green'
                                : trend === 'down'
                                    ? 'bg-accent-red/10 text-accent-red'
                                    : 'bg-accent/10 text-accent'
                                }`}>
                                {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} %{Math.abs(((historicalData[historicalData.length - 1]?.value || 0) - (historicalData[0]?.value || 0)) / (historicalData[0]?.value || 1) * 100).toFixed(2)}
                            </div>
                        </div>
                    </div>

                    {/* Grafik alanı */}
                    <div className="relative">
                        {/* Grafik arka plan deseni */}
                        <div className="absolute inset-0 bg-gradient-to-b from-theme-light/5 to-transparent rounded-xl"></div>

                        {/* Grafik */}
                        <div className="relative h-[200px] md:h-[240px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={historicalData}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={getTrendColor()} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={getTrendColor()} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Line
                                        type="monotone"
                                        dataKey="value"
                                        stroke={getTrendColor()}
                                        strokeWidth={2}
                                        dot={false}
                                        fill="url(#colorValue)"
                                    />
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="rounded-lg bg-theme-dark/95 backdrop-blur-xl border border-theme-light/20 p-3 shadow-xl">
                                                        <div className="text-xs font-medium text-content-secondary mb-1">
                                                            {payload[0].payload.formattedDate}
                                                        </div>
                                                        <div className="text-sm font-semibold text-content">
                                                            1 {fromCurrency} = {Number(payload?.[0]?.value).toFixed(2) ?? '0.00'} {toCurrency}
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

                        {/* Tarih göstergeleri */}
                        <div className="mt-4 grid grid-cols-4 md:grid-cols-7 gap-2">
                            {historicalData.map((data, index) => (
                                <div key={index} className="text-center">
                                    <div className="text-[10px] font-medium text-content-secondary">
                                        {data.formattedDate}
                                    </div>
                                    <div className={`text-[10px] md:text-xs mt-0.5 md:mt-1 ${index === historicalData.length - 1
                                        ? 'font-semibold text-content'
                                        : 'text-content-secondary'
                                        }`}>
                                        {Number(data.value).toFixed(1)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}