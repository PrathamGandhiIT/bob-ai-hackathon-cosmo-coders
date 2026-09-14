import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import TopHeader from '../components/TopHeader'
import FloatingDock from '../components/FloatingDock'
import CommandPalette from '../components/CommandPalette'

export default function DashboardLayout() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header with Breadcrumbs, Search, Theme Toggle & Profile */}
      <TopHeader onOpenSearch={() => setIsSearchOpen(true)} />

      {/* Main Page Content Container */}
      <main
        style={{
          flex: 1,
          maxWidth: '1360px',
          width: '100%',
          margin: '0 auto',
          padding: '24px 24px 40px',
        }}
      >
        <Outlet />
      </main>

      {/* Vidur-style Floating Bottom Dock Navigation */}
      <FloatingDock />

      {/* Quick Search & Command Palette Modal */}
      <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  )
}
