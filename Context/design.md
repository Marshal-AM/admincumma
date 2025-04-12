layout file 

'''

'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useSession, signOut } from 'next-auth/react'
import { LayoutDashboard, CalendarDays, PlusCircle, Building2, UserCircle, LogOut } from 'lucide-react'

export default function ServiceProviderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { data: session } = useSession()

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/sign-in' })
  }

  const navigation = {
    main: [
      {
        name: 'Dashboard',
        href: '/service-provider/dashboard',
        icon: LayoutDashboard,
      },
      {
        name: 'Bookings',
        href: '/service-provider/bookings',
        icon: CalendarDays,
      },
      {
        name: 'Add New Facilities',
        href: '/service-provider/add-facilities',
        icon: PlusCircle,
      },
      {
        name: 'My Services & facilities',
        href: '/service-provider/my-facilities',
        icon: Building2,
      },
    ],
    account: [
      {
        name: 'My Profile',
        href: '/service-provider/profile',
        icon: UserCircle,
      },
      {
        name: 'Logout',
        href: '#',
        icon: LogOut,
        onClick: handleLogout,
      },
    ],
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="w-[280px] bg-white h-full p-4 flex flex-col gap-8 border-r">
        {/* Main Navigation */}
        <div className="space-y-2">
          <h2 className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            MAIN
          </h2>
          <nav className="space-y-1">
            {navigation.main.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-2 py-3 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Account Management */}
        <div className="space-y-2">
          <h2 className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            MANAGE ACCOUNT
          </h2>
          <nav className="space-y-1">
            {navigation.account.map((item) => {
              const isActive = pathname === item.href
              if (item.onClick) {
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault()
                      item.onClick()
                    }}
                    className={cn(
                      'flex items-center gap-3 px-2 py-3 text-sm font-medium rounded-lg transition-colors',
                      'text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </a>
                )
              }
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-2 py-3 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto bg-[#F8F9FC]">
        {children}
      </main>
    </div>
  )
} 

'''

page.tsx file

'''
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { FacilityForm } from '@/components/forms/facility-form'
import { FacilityType } from '@/components/forms/types'
import { toast } from 'sonner'
import {
  Building2,
  Users,
  VideoIcon,
  Microscope,
  MonitorPlay,
  LayoutDashboard,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const facilityTypes = [
  {
    type: 'individual-cabin',
    title: 'Individual Cabin',
    description: 'Private office spaces for individuals or small teams',
    icon: Building2,
  },
  {
    type: 'coworking-spaces',
    title: 'Coworking Spaces',
    description: 'Shared workspace for professionals and teams',
    icon: Users,
  },
  {
    type: 'meeting-rooms',
    title: 'Meeting Rooms',
    description: 'Conference and meeting spaces for professional gatherings',
    icon: VideoIcon,
  },
  {
    type: 'bio-allied-labs',
    title: 'Bio Allied Labs',
    description: 'Laboratory spaces for biotechnology and life sciences',
    icon: Microscope,
  },
  {
    type: 'manufacturing-labs',
    title: 'Manufacturing Labs',
    description: 'Spaces for manufacturing and production',
    icon: Microscope,
  },
  {
    type: 'prototyping-labs',
    title: 'Prototyping Labs',
    description: 'Facilities for product development and prototyping',
    icon: Microscope,
  },
  {
    type: 'software',
    title: 'Software',
    description: 'Software tools and development environments',
    icon: MonitorPlay,
  },
  {
    type: 'saas-allied',
    title: 'SaaS Allied',
    description: 'Software as a Service and related tools',
    icon: MonitorPlay,
  },
  {
    type: 'raw-space-office',
    title: 'Raw Space (Office)',
    description: 'Unfurnished office spaces for customization',
    icon: LayoutDashboard,
  },
  {
    type: 'raw-space-lab',
    title: 'Raw Space (Lab)',
    description: 'Unfurnished laboratory spaces for customization',
    icon: LayoutDashboard,
  },
] as const

export default function AddFacilities() {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<FacilityType | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleTypeChange = (newType: FacilityType) => {
    setSelectedType(newType)
    setIsDialogOpen(true)
  }

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch('/api/facilities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          facilityType: selectedType,
          details: data,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create facility')
      }

      toast.success('Facility created successfully')
      setIsDialogOpen(false)
      setSelectedType(null)
      router.refresh()
    } catch (error) {
      console.error('Error creating facility:', error)
      toast.error('Failed to create facility')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Add New Facilities</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose a facility type to add to your services
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {facilityTypes.map((facility) => (
          <Card
            key={facility.type}
            className="p-6 cursor-pointer hover:border-primary transition-colors"
            onClick={() => handleTypeChange(facility.type as FacilityType)}
          >
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <facility.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">{facility.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {facility.description}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Add {facilityTypes.find(f => f.type === selectedType)?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedType && (
            <FacilityForm
              type={selectedType}
              onSubmit={handleSubmit}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 

'''

overall layout

'''

'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { ProfilePicture } from '@/components/ui/profile-picture'
import { useEffect, useState } from 'react'

interface StartupProfile {
  startupName: string
  logoUrl: string | null
}

interface ServiceProviderProfile {
  serviceName: string
  logoUrl: string | null
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<StartupProfile | ServiceProviderProfile | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!session?.user) return

        const response = await fetch(
          session.user.userType === 'startup' 
            ? '/api/startup/profile'
            : '/api/service-provider/profile'
        )
        
        if (response.ok) {
          const data = await response.json()
          // Transform the data to match our interface
          setProfile({
            startupName: data.startupName,
            serviceName: data.serviceName,
            logoUrl: data.logoUrl
          })
        } else {
          console.error('Failed to fetch profile:', await response.text())
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      }
    }

    fetchProfile()
  }, [session])

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
        <div className="flex h-20 items-center justify-between px-6 sm:px-8">
          <div className="flex items-center gap-8">
            <Link href={session?.user?.userType === 'startup' ? '/startup/dashboard' : '/service-provider/dashboard'}>
              <Image
                src="/logo.png"
                alt="Cumma Logo"
                width={150}
                height={32}
                priority
              />
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-sm font-medium">
              Welcome back, {
                session?.user?.userType === 'startup'
                  ? (profile as StartupProfile)?.startupName
                  : (profile as ServiceProviderProfile)?.serviceName
                || 'User'
              }!
            </span>
            <div className="h-12 w-12">
              <ProfilePicture
                imageUrl={profile?.logoUrl}
                size={48}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Page Content */}
      {children}
    </div>
  )
} 

'''