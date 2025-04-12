'use client'

import { ObjectId } from 'mongodb'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import ProviderModal from '@/components/facility-partners/ProviderModal'

interface ServiceProvider {
  _id: ObjectId;
  userId: ObjectId;
  serviceName: string | null;
  logoUrl: string | null;
  serviceProviderType: 'Incubator' | 'Accelerator' | 'Institution/University' | 'Private Coworking Space' | 'Community Space' | 'Cafe' | null;
  address: string | null;
  city: string | null;
  stateProvince: string | null;
  zipPostalCode: string | null;
  primaryContact1Name: string | null;
  primaryContact1Designation: string | null;
  contact2Name: string | null;
  contact2Designation: string | null;
  primaryContactNumber: string | null;
  alternateContactNumber: string | null;
  primaryEmailId: string | null;
  alternateEmailId: string | null;
  websiteUrl: string | null;
  features: string[];
  createdAt: Date;
  updatedAt: Date;
}

async function getServiceProviders(): Promise<ServiceProvider[]> {
  try {
    const response = await fetch('/api/facility-partners')
    if (!response.ok) throw new Error('Failed to fetch')
    const data = await response.json()
    console.log('Fetched partners:', data.length)
    return data
  } catch (error) {
    console.error('Error fetching facility partners:', error)
    return []
  }
}

function formatProviderType(type: string): string {
  return type ? type.replace(/([A-Z])/g, ' $1').trim() : 'Not Specified'
}

export default function FacilityPartnersPage() {
  const [providers, setProviders] = useState<ServiceProvider[]>([])
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    getServiceProviders().then(data => {
      console.log('Setting partners:', data.length)
      setProviders(data)
    })
  }, [])

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Facility Partner Details</h1>
        <p className="text-sm text-gray-500">Total Partners: {providers.length}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {providers.map((provider) => (
          <div 
            key={provider._id.toString()} 
            className="flex items-start gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="h-24 w-32 flex-shrink-0 overflow-hidden rounded-lg border border-gray-100">
              {provider.logoUrl ? (
                <Image
                  src={provider.logoUrl}
                  alt={`${provider.serviceName || 'Partner'} logo`}
                  width={128}
                  height={96}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-50 text-gray-400">
                  {provider.serviceName?.charAt(0)?.toUpperCase() || 'P'}
                </div>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <h3 className="font-medium text-gray-900 truncate" title={provider.serviceName || 'Unnamed Partner'}>
                {provider.serviceName || 'Unnamed Partner'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {formatProviderType(provider.serviceProviderType || '')}
              </p>
              <p className="mt-1 text-xs text-gray-500 truncate" title={`${provider.city || 'N/A'}, ${provider.stateProvince || 'N/A'}`}>
                {provider.city || 'N/A'}, {provider.stateProvince || 'N/A'}
              </p>
              <button 
                className="mt-3 inline-flex items-center justify-center rounded-md bg-green-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-green-600"
                onClick={() => {
                  setSelectedProvider(provider)
                  setIsModalOpen(true)
                }}
              >
                Contact now
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedProvider && (
        <ProviderModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedProvider(null)
          }}
          provider={selectedProvider}
        />
      )}
    </div>
  )
} 