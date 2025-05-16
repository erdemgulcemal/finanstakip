'use client'

import { XMarkIcon } from '@heroicons/react/24/outline'

interface Notification {
    id: string
    message: string
    timestamp: Date
    read: boolean
    permanent?: boolean
}

interface NotificationDropdownProps {
    notifications: Notification[]
    onClose: () => void
    onMarkAsRead?: (id: string) => void // Opsiyonel: Bildirimi okundu olarak işaretleme fonksiyonu
    onClearAll?: () => void // Opsiyonel: Tüm bildirimleri temizleme fonksiyonu
}

export default function NotificationDropdown({
    notifications,
    onClose,
    onMarkAsRead,
    onClearAll
}: NotificationDropdownProps) {
    return (
        <div className="fixed md:absolute inset-x-0 md:inset-x-auto top-16 md:top-full md:right-0 md:mt-2 md:w-80 h-[calc(100vh-4rem)] md:h-auto bg-theme-card shadow-lg border-t md:border md:rounded-lg border-theme-light/10 z-50">
            <div className="sticky top-0 flex items-center justify-between border-b border-theme-light/10 p-3 bg-theme-card">
                <h3 className="text-sm font-medium text-content">Bildirimler</h3>
                <button
                    onClick={onClose}
                    className="rounded-md p-1 text-content-secondary hover:bg-theme-light hover:text-accent"
                >
                    <XMarkIcon className="h-4 w-4" />
                </button>
            </div>
            <div className="max-h-[calc(100vh-12rem)] md:max-h-96 overflow-y-auto p-2">
                {notifications.length === 0 ? (
                    <p className="text-center text-xs text-content-secondary py-4">Yeni bildirim yok.</p>
                ) : (
                    notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`mb-1 rounded-md p-2 text-sm ${
                                notification.permanent ? 'bg-yellow-500/10 border border-yellow-500/20' :
                                notification.read ? 'bg-theme-card' : 'bg-theme-light/5'
                            }`}
                        >
                            <p className={`${
                                notification.permanent ? 'text-yellow-500' :
                                notification.read ? 'text-content-secondary' : 'text-content'
                            }`}>
                                {notification.message}
                            </p>
                            {!notification.permanent && (
                                <p className="text-xs text-content-secondary mt-1">
                                    {notification.timestamp.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            )}
                            {/* Okundu olarak işaretleme butonu (kalıcı bildirimler için gösterilmez) */}
                            {!notification.read && !notification.permanent && onMarkAsRead && (
                                <button
                                    onClick={() => onMarkAsRead(notification.id)}
                                    className="text-xs text-blue-500 hover:underline mt-1"
                                >
                                    Okundu olarak işaretle
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
            {notifications.length > 0 && onClearAll && (
                <div className="border-t border-theme-light/10 p-2 text-center">
                    <button
                        onClick={onClearAll}
                        className="text-xs text-red-500 hover:underline"
                    >
                        Tümünü Temizle
                    </button>
                </div>
            )}
        </div>
    )
}