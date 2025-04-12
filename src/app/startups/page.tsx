'use client'

import { ObjectId } from 'mongodb'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import StartupModal from '@/components/startups/StartupModal'
import Link from 'next/link'

interface Startup {
  _id: ObjectId;
  userId: ObjectId;
  startupName: string | null;
  contactName: string | null;
  contactNumber: string | null;
  founderName: string | null;
  founderDesignation: string | null;
  entityType: string | null;
  teamSize: number | null;
  dpiitNumber: string | null;
  industry: string | null;
  sector: string | null;
  stagecompleted: string | null;
  startupMailId: string | null;
  website: string | null;
  linkedinStartupUrl: string | null;
  linkedinFounderUrl: string | null;
  lookingFor: string[];
  address: string | null;
  logoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

async function getStartups(): Promise<Startup[]> {
  try {
    const response = await fetch('/api/startups')
    if (!response.ok) throw new Error('Failed to fetch')
    const data = await response.json()
    console.log('Fetched startups:', data.length)
    return data
  } catch (error) {
    console.error('Error fetching startups:', error)
    return []
  }
}

function isValidImageUrl(url: string | null): boolean {
  if (!url) return false
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export default function StartupsPage() {
  const [startups, setStartups] = useState<Startup[]>([])
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    setError(null)
    
    getStartups()
      .then(data => {
        setStartups(data)
        setIsLoading(false)
      })
      .catch(err => {
        console.error('Error loading startups:', err)
        setError('Failed to load startups. Please try again.')
        setIsLoading(false)
      })
  }, [])

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Startup Details</h1>
        <p className="text-sm text-gray-500">View all registered startups</p>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {!isLoading && !error && startups.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
          No startups found.
        </div>
      )}

      {!isLoading && !error && startups.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {startups.map((startup) => (
            <div 
              key={startup._id.toString()} 
              className="flex items-start gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="h-24 w-32 flex-shrink-0 overflow-hidden rounded-lg border border-gray-100">
                {isValidImageUrl(startup.logoUrl) && !imageErrors[startup._id.toString()] ? (
                  <Image
                    src={startup.logoUrl!}
                    alt={`${startup.startupName || 'Startup'} logo`}
                    width={128}
                    height={96}
                    className="h-full w-full object-cover"
                    onError={() => {
                      setImageErrors(prev => ({
                        ...prev,
                        [startup._id.toString()]: true
                      }))
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-50 text-gray-400">
                    {startup.startupName ? startup.startupName.charAt(0).toUpperCase() : 'S'}
                  </div>
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <h3 className="font-medium text-gray-900 truncate" title={startup.startupName || 'Unnamed Startup'}>
                  {startup.startupName || 'Unnamed Startup'}
                </h3>
                {startup.address && (
                  <p className="mt-1 text-sm text-gray-500 truncate" title={startup.address}>
                    {startup.address}
                  </p>
                )}
                <button 
                  className="mt-3 inline-flex items-center justify-center rounded-md bg-green-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-green-600"
                  onClick={() => {
                    setSelectedStartup(startup)
                    setIsModalOpen(true)
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedStartup && (
        <StartupModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedStartup(null)
          }}
          startup={selectedStartup}
        />
      )}
    </div>
  )
} 