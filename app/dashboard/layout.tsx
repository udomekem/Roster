'use client'

import { useCallback, useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { MobileNav } from '@/components/layout/mobile-nav'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const closeMobileNav = useCallback(() => setMobileNavOpen(false), [])

  return (
    <div>
      <MobileNav open={mobileNavOpen} onClose={closeMobileNav} />
      <Sidebar />

      <div className="lg:pl-64">
        <Header onMenuClick={() => setMobileNavOpen(true)} />

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}
