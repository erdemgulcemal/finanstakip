import './globals.css'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Finans Takip',
  description: 'Modern finansal takip platformu',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body>
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
