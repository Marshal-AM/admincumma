'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Calendar, 
  CirclePlus,
  Building2, 
  FileText,
  Key
} from 'lucide-react'

const Sidebar = () => {
  const pathname = usePathname()

  const mainNavItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'All Bookings', href: '/bookings', icon: Calendar },
    { label: 'Facility Partner Details', href: '/facility-partners', icon: CirclePlus },
    { label: 'Manage Facilities', href: '/facilities', icon: Building2 },
    { label: 'Startup Details', href: '/startups', icon: FileText },
    { label: 'Backdoor', href: '/backdoor', icon: Key },
  ]

  const NavItem = ({ item }: { item: typeof mainNavItems[0] }) => {
    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
    const Icon = item.icon

    return (
      <Link
        href={item.href}
        className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-colors ${
          isActive 
            ? 'bg-sidebar-active-bg text-sidebar-active font-medium' 
            : 'text-muted hover:bg-sidebar-hover hover:text-foreground'
        }`}
      >
        <Icon className="h-5 w-5" />
        {item.label}
      </Link>
    )
  }

  return (
    <aside className="fixed top-[80px] left-0 bottom-0 w-64 border-r bg-sidebar-bg px-4 py-6">
      <div className="px-4 pb-2 text-xs font-semibold uppercase text-muted">
        MAIN
      </div>
      <nav className="flex flex-col gap-1">
        {mainNavItems.map((item) => (
          <NavItem key={item.href} item={item} />
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar 