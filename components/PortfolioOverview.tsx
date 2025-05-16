'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import axios from 'axios'

interface CurrencyData {
    code: string
    symbol: string
    name: string
    amount: number
    rate: number
    change: number
    value: number
    chartData: { value: number }[]
}

interface GoldData {
    code: string
    name: string
    amount: number
    buying: number
    selling: number
    value: number
    multiplier: number
    change: number // Değişim oranı eklendi
    chartData: { value: number }[]
}

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
    Ata: { key: 'ata-altin', type: 'Ata Altın' },
    Cumhuriyet: { key: 'cumhuriyet-altin', type: 'Cumhuriyet Altını' }
}

const API_CONFIG = {
    baseURL: 'https://api.collectapi.com/economy/goldPrice',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'apikey 5B98TSB5yby4Si1t6unQ1k:2In7VKlQTRrgkWPaQ4e5FF'
    }
}

export default function PortfolioOverview() {
    const [activeTab, setActiveTab] = useState('tümü')
    const [goldTab, setGoldTab] = useState('tümü')
    const [currencies, setCurrencies] = useState<CurrencyData[]>([])
    const [golds, setGolds] = useState<GoldData[]>([])
    const [loading, setLoading] = useState(true)
    const [goldLoading, setGoldLoading] = useState(true)

    // Desteklenen para birimleri listesi
    const availableCurrencies = [
        { code: 'USD', symbol: '$', name: 'Amerikan Doları' },
        { code: 'EUR', symbol: '€', name: 'Euro' },
        { code: 'GBP', symbol: '£', name: 'İngiliz Sterlini' },
        { code: 'JPY', symbol: '¥', name: 'Japon Yeni' },
        { code: 'CHF', symbol: 'Fr', name: 'İsviçre Frangı' },
        { code: 'AUD', symbol: 'A$', name: 'Avustralya Doları' },
        { code: 'CAD', symbol: 'C$', name: 'Kanada Doları' },
        { code: 'CNY', symbol: '¥', name: 'Çin Yuanı' },
        { code: 'INR', symbol: '₹', name: 'Hindistan Rupisi' },
        { code: 'NZD', symbol: 'NZ$', name: 'Yeni Zelanda Doları' },
        { code: 'SEK', symbol: 'kr', name: 'İsveç Kronu' },
        { code: 'SGD', symbol: 'S$', name: 'Singapur Doları' },
        { code: 'NOK', symbol: 'kr', name: 'Norveç Kronu' },
        { code: 'MXN', symbol: '$', name: 'Meksika Pesosu' },
        { code: 'KRW', symbol: '₩', name: 'Güney Kore Wonu' }
    ]

    // Kullanıcının portföyündeki para birimleri
    const [userCurrencies, setUserCurrencies] = useState<CurrencyData[]>([
        { code: 'USD', symbol: '$', name: 'Amerikan Doları', amount: 0, rate: 0, change: 0, value: 0, chartData: [] },
        { code: 'EUR', symbol: '€', name: 'Euro', amount: 0, rate: 0, change: 0, value: 0, chartData: [] }
    ])

    const [userGolds, setUserGolds] = useState<GoldData[]>([
        { code: 'Gram', name: 'Gram Altın', amount: 0, buying: 0, selling: 0, value: 0, multiplier: 1, change: 0, chartData: [] },
        { code: 'Cumhuriyet', name: 'Cumhuriyet Altını', amount: 0, buying: 0, selling: 0, value: 0, multiplier: 1, change: 0, chartData: [] },
        { code: 'Yarım', name: 'Yarım Altın', amount: 0, buying: 0, selling: 0, value: 0, multiplier: 1, change: 0, chartData: [] },
        { code: 'Çeyrek', name: 'Çeyrek Altın', amount: 0, buying: 0, selling: 0, value: 0, multiplier: 1, change: 0, chartData: [] }
    ])

    // Seçilen para birimi
    const [selectedCurrency, setSelectedCurrency] = useState('')

    useEffect(() => {
        const fetchExchangeRates = async () => {
            try {
                setLoading(true)
                const response = await axios.get('https://api.exchangerate-api.com/v4/latest/TRY')

                const currenciesData = await Promise.all(
                    userCurrencies.map(async (currency) => {
                        const currentRate = 1 / response.data.rates[currency.code]

                        // Son 7 günlük veri simülasyonu
                        const historicalData = Array.from({ length: 7 }, () => ({
                            value: currentRate * (1 + (Math.random() - 0.5) * 0.02)
                        }))

                        // 24 saatlik değişim simülasyonu
                        const changePercent = (Math.random() - 0.5) * 4

                        return {
                            ...currency,
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
        const interval = setInterval(fetchExchangeRates, 60000)
        return () => clearInterval(interval)
    }, [userCurrencies])

    // Altın fiyatlarını çek
    useEffect(() => {
        const fetchGoldPrices = async () => {
            try {
                setGoldLoading(true)
                const response = await axios.get(API_CONFIG.baseURL, {
                    headers: API_CONFIG.headers
                })

                if (response.data.success) {
                    const goldsData = userGolds.map(gold => {
                        const goldData = response.data.result.find(
                            (item: any) => {
                                const normalizedItemName = normalizeGoldName(item.name)
                                const matchingType = Object.entries(goldTypes).find(([key, value]) =>
                                    key === gold.code && (
                                        normalizedItemName === normalizeGoldName(value.key) ||
                                        normalizedItemName.includes(normalizeGoldName(value.key))
                                    )
                                )
                                return !!matchingType
                            }
                        )

                        if (goldData) {
                            const buying = Number(goldData.buying)
                            const selling = Number(goldData.selling)
                            const value = gold.amount * selling

                            // 24 saatlik değişim simülasyonu (%-2 ile %2 arasında)
                            const changePercent = (Math.random() - 0.5) * 4

                            // Son 7 günlük veri simülasyonu
                            const historicalData = Array.from({ length: 7 }, (_, i) => {
                                const dayVariation = (Math.random() - 0.5) * 0.02 // Her gün için farklı varyasyon
                                return {
                                    value: selling * (1 + dayVariation + (changePercent / 100) * (i / 6))
                                }
                            }).sort((a, b) => a.value - b.value) // Değerleri sırala

                            return {
                                ...gold,
                                buying,
                                selling,
                                value: gold.amount * selling * gold.multiplier,
                                change: changePercent,
                                chartData: historicalData
                            }
                        }
                        return gold
                    })

                    setGolds(goldsData)
                }
            } catch (error) {
                console.error('Altın fiyatları alınamadı:', error)
            } finally {
                setGoldLoading(false)
            }
        }

        fetchGoldPrices()
        const interval = setInterval(fetchGoldPrices, 30000) // Her 30 saniyede bir güncelle, GoldTracker ile aynı
        return () => clearInterval(interval)
    }, [userGolds])

    // API yanıtındaki altın isimlerini normalize etme fonksiyonu
    const normalizeGoldName = (name: string): string => {
        return name.toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[ıİ]/g, 'i')
            .replace(/[ğĞ]/g, 'g')
            .replace(/[üÜ]/g, 'u')
            .replace(/[şŞ]/g, 's')
            .replace(/[öÖ]/g, 'o')
            .replace(/[çÇ]/g, 'c')
    }

    const filteredCurrencies = currencies.filter(currency => {
        switch (activeTab) {
            case 'yükselenler':
                return currency.change > 0
            case 'düşenler':
                return currency.change < 0
            default:
                return true
        }
    }).sort((a, b) => {
        if (activeTab === 'yükselenler') {
            return b.change - a.change
        }
        if (activeTab === 'düşenler') {
            return a.change - b.change
        }
        return a.code.localeCompare(b.code)
    })

    // Para birimleri için toplam değerler
    const totalCurrencyValue = currencies.reduce((sum, currency) => sum + currency.value, 0)
    const totalCurrencyChange = currencies.reduce((sum, currency) => sum + currency.change, 0) / currencies.length

    // Altın portföyü için toplam değer
    const totalGoldValue = golds.reduce((sum, gold) => sum + gold.value, 0)

    // Genel toplam
    const totalPortfolioValue = totalCurrencyValue + totalGoldValue

    const tabs = [
        { id: 'tümü', label: 'Tümü' },
        { id: 'yükselenler', label: 'Yükselenler' },
        { id: 'düşenler', label: 'Düşenler' }
    ]

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="grid gap-3 md:gap-4 md:grid-cols-3">
                <div className="card p-4">
                    <div className="text-sm text-content-secondary">Toplam Portföy Değeri</div>
                    <div className="text-xl md:text-2xl font-bold text-content mt-1">
                        ₺{totalPortfolioValue.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}
                    </div>
                </div>

                <div className="card p-4">
                    <div className="text-sm text-content-secondary">Döviz Portföyü</div>
                    <div className="text-xl md:text-2xl font-bold text-content mt-1">
                        ₺{totalCurrencyValue.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}
                    </div>
                </div>

                <div className="card p-4">
                    <div className="text-sm text-content-secondary">Altın Portföyü</div>
                    <div className="text-xl md:text-2xl font-bold text-content mt-1">
                        ₺{totalGoldValue.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}
                    </div>
                </div>
            </div>

            <div className="card p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 md:mb-6">
                    <h2 className="text-base md:text-lg font-medium text-content">Para Birimleri</h2>
                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4">
                        <div className="flex gap-2 md:gap-4 overflow-x-auto scrollbar-hide">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 py-2 text-sm rounded-lg transition-colors ${activeTab === tab.id
                                        ? 'bg-theme-light text-accent'
                                        : 'text-content-secondary hover:text-content'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        <select
                            value={selectedCurrency}
                            onChange={(e) => setSelectedCurrency(e.target.value)}
                            className="px-4 py-2 rounded-lg bg-theme-light/5 text-content border border-theme-light/10 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
                        >
                            {/* Apply text color suitable for a light background for options */}
                            <option value="" className="text-gray-800 bg-white">Para Birimi Seç</option>
                            {availableCurrencies
                                .filter(ac => !userCurrencies.some(uc => uc.code === ac.code))
                                .map((currency) => (
                                    <option
                                        key={currency.code}
                                        value={currency.code}
                                        className="text-gray-800 bg-white hover:bg-gray-100" // Style options for light background
                                    >
                                        {currency.name} ({currency.code})
                                    </option>
                                ))}
                        </select>
                        <button
                            onClick={() => {
                                if (selectedCurrency) {
                                    const newCurrency = availableCurrencies.find(c => c.code === selectedCurrency)
                                    if (newCurrency) {
                                        setUserCurrencies([...userCurrencies, {
                                            ...newCurrency,
                                            amount: 0,
                                            rate: 0,
                                            change: 0,
                                            value: 0,
                                            chartData: []
                                        }])
                                        setSelectedCurrency('')
                                    }
                                }
                            }}
                            disabled={!selectedCurrency}
                            className="px-4 py-2 rounded-lg bg-accent text-white disabled:opacity-50"
                        >
                            Para Birimi Ekle
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center text-content-secondary">Yükleniyor...</div>
                    ) : filteredCurrencies.length === 0 ? (
                        <div className="text-center text-content-secondary">
                            {activeTab === 'yükselenler'
                                ? 'Yükselen para birimi bulunamadı'
                                : activeTab === 'düşenler'
                                    ? 'Düşen para birimi bulunamadı'
                                    : 'Para birimi bulunamadı'}
                        </div>
                    ) : (
                        filteredCurrencies.map((currency) => (
                            <div
                                key={currency.code}
                                className="flex items-center gap-6 rounded-lg bg-theme-light/5 p-4 hover:bg-theme-light/10 transition-colors"
                            >
                                <div className="min-w-[140px]">
                                    <div className="font-medium text-content">{currency.code}</div>
                                    <div className="text-sm text-content-secondary">{currency.name}</div>
                                </div>

                                <div className="min-w-[120px]">
                                    <div className="text-sm text-content-secondary">Miktar</div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={currency.amount}
                                            onChange={(e) => {
                                                const newAmount = parseFloat(e.target.value)
                                                setUserCurrencies(currencies =>
                                                    currencies.map(c =>
                                                        c.code === currency.code
                                                            ? { ...c, amount: newAmount || 0 }
                                                            : c
                                                    )
                                                )
                                            }}
                                            className="w-24 px-2 py-1 rounded bg-theme-light/5 text-content"
                                        />
                                        <span className="font-medium text-content">{currency.symbol}</span>
                                    </div>
                                </div>

                                <div className="min-w-[140px]">
                                    <div className="text-sm text-content-secondary">Güncel Kur</div>
                                    <div className="font-medium text-content">
                                        ₺{currency.rate.toLocaleString('tr-TR', { maximumFractionDigits: 4 })}
                                    </div>
                                </div>

                                <div className="min-w-[100px]">
                                    <div className="text-sm text-content-secondary">Değişim</div>
                                    <div className={currency.change >= 0 ? 'text-accent-green' : 'text-accent-red'}>
                                        {currency.change >= 0 ? '+' : ''}{currency.change.toFixed(2)}%
                                    </div>
                                </div>

                                <div className="min-w-[140px]">
                                    <div className="text-sm text-content-secondary">TL Değeri</div>
                                    <div className="font-medium text-content">
                                        ₺{currency.value.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-32">
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
                                    <button
                                        onClick={() => {
                                            setUserCurrencies(prevCurrencies =>
                                                prevCurrencies.filter(c => c.code !== currency.code)
                                            )
                                        }}
                                        className="p-2 rounded-lg hover:bg-theme-light/10 text-accent-red"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M3 6h18"></path>
                                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {!loading && filteredCurrencies.length > 0 && (
                    <div className="mt-4 text-sm text-content-secondary">
                        Toplam {filteredCurrencies.length} para birimi gösteriliyor
                    </div>
                )}
            </div>

            {/* Altın Birimleri Kartı */}
            <div className="card mt-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-medium text-content">Altın Birimleri</h2>
                    <div className="flex items-center gap-4">
                        <div className="flex gap-4">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setGoldTab(tab.id)}
                                    className={`px-4 py-2 text-sm rounded-lg transition-colors ${goldTab === tab.id
                                        ? 'bg-theme-light text-accent'
                                        : 'text-content-secondary hover:text-content'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {goldLoading ? (
                        <div className="text-center text-content-secondary">Yükleniyor...</div>
                    ) : golds.length === 0 ? (
                        <div className="text-center text-content-secondary">Altın birimi bulunamadı</div>
                    ) : (
                        golds
                            .filter(gold => {
                                switch (goldTab) {
                                    case 'yükselenler':
                                        return gold.change > 0
                                    case 'düşenler':
                                        return gold.change < 0
                                    default:
                                        return true
                                }
                            })
                            .sort((a, b) => {
                                if (goldTab === 'yükselenler') {
                                    return b.change - a.change
                                }
                                if (goldTab === 'düşenler') {
                                    return a.change - b.change
                                }
                                return a.code.localeCompare(b.code)
                            })
                            .map((gold) => (
                                <div
                                    key={gold.code}
                                    className="flex items-center gap-6 rounded-lg bg-theme-light/5 p-4 hover:bg-theme-light/10 transition-colors"
                                >
                                    <div className="min-w-[140px]">
                                        <div className="font-medium text-content">{gold.code}</div>
                                        <div className="text-sm text-content-secondary">{gold.name}</div>
                                    </div>

                                    <div className="min-w-[120px]">
                                        <div className="text-sm text-content-secondary">Miktar</div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={gold.amount}
                                                onChange={(e) => {
                                                    const newAmount = parseFloat(e.target.value)
                                                    setUserGolds(golds =>
                                                        golds.map(g =>
                                                            g.code === gold.code
                                                                ? { ...g, amount: newAmount || 0 }
                                                                : g
                                                        )
                                                    )
                                                }}
                                                className="w-24 px-2 py-1 rounded bg-theme-light/5 text-content"
                                            />
                                            <span className="font-medium text-content">Adet</span>
                                        </div>
                                    </div>

                                    <div className="min-w-[140px]">
                                        <div className="text-sm text-content-secondary">Alış</div>
                                        <div className="font-medium text-content">
                                            ₺{gold.buying.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="min-w-[140px]">
                                            <div className="text-sm text-content-secondary">Satış</div>
                                            <div className="font-medium text-content">
                                                ₺{gold.selling.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}
                                            </div>
                                        </div>
                                        <div className="min-w-[100px]">
                                            <div className="text-sm text-content-secondary">Değişim</div>
                                            <div className={gold.change >= 0 ? 'text-accent-green' : 'text-accent-red'}>
                                                {gold.change >= 0 ? '+' : ''}{gold.change.toFixed(2)}%
                                            </div>
                                        </div>
                                    </div>

                                    <div className="min-w-[140px]">
                                        <div className="text-sm text-content-secondary">TL Değeri</div>
                                        <div className="font-medium text-content">
                                            ₺{gold.value.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-32">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={gold.chartData}>
                                                    <Line
                                                        type="monotone"
                                                        dataKey="value"
                                                        stroke={gold.change >= 0 ? '#1AB98B' : '#FF5C5C'}
                                                        strokeWidth={2}
                                                        dot={false}
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            ))
                    )}
                </div>

                {!goldLoading && golds.length > 0 && (
                    <div className="mt-4 text-sm text-content-secondary">
                        Toplam {golds.length} altın birimi gösteriliyor
                    </div>
                )}
            </div>
        </div>
    )
}
