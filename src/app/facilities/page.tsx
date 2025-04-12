'use client'

import { ObjectId } from 'mongodb'
import Image from 'next/image'
import { useState, useEffect, useCallback } from 'react'
import StatusActions from '@/components/facilities/StatusActions'
import FacilityModal from '@/components/facilities/FacilityModal'

interface RentalPlan {
  name: string;
  price: number;
  duration: string;
}

interface Facility {
  _id: ObjectId;
  serviceProviderId: ObjectId;
  facilityType: string;
  status: 'active' | 'pending' | 'rejected';
  details: {
    name: string;
    description: string;
    images: string[];
    rentalPlans: RentalPlan[];
    totalCabins?: number;
    availableCabins?: number;
    totalSeats?: number;
    availableSeats?: number;
    totalRooms?: number;
    seatingCapacity?: number;
  };
  features: string[];
  address: string;
  city: string;
  pincode: string;
  state: string;
  country: string;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

async function getFacilities(): Promise<Facility[]> {
  try {
    const response = await fetch('/api/facilities')
    if (!response.ok) throw new Error('Failed to fetch')
    const data = await response.json()
    console.log('Fetched facilities:', data.length)
    return data
  } catch (error) {
    console.error('Error fetching facilities:', error)
    return []
  }
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).replace(/\//g, '.')
}

function formatPrice(plan: RentalPlan): string {
  return `₹${plan.price.toLocaleString('en-IN')} / ${plan.duration.toLowerCase()}`
}

export default function FacilitiesPage() {
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const loadFacilities = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getFacilities()
      // Filter to show only pending facilities
      const pendingFacilities = data.filter(facility => facility.status === 'pending')
      setFacilities(pendingFacilities)
    } catch (error) {
      console.error('Error loading facilities:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadFacilities()
  }, [loadFacilities])

  const handleStatusChange = useCallback(async () => {
    await loadFacilities()
  }, [loadFacilities])

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Add New Facilities</h1>
          <p className="text-sm text-gray-500">We are glad to see you again</p>
        </div>
        <button 
          className="rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600"
          onClick={loadFacilities}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50/50">
                <th className="whitespace-nowrap px-6 py-5 text-left text-sm font-medium text-gray-600">
                  Facility Title
                </th>
                <th className="whitespace-nowrap px-6 py-5 text-left text-sm font-medium text-gray-600">
                  Date Published
                </th>
                <th className="whitespace-nowrap px-6 py-5 text-left text-sm font-medium text-gray-600">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {facilities.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                    {isLoading ? 'Loading facilities...' : 'No pending facilities found'}
                  </td>
                </tr>
              ) : (
                facilities.map((facility) => (
                  <tr 
                    key={facility._id.toString()} 
                    className="hover:bg-gray-50/50 cursor-pointer"
                    onClick={() => {
                      setSelectedFacility(facility)
                      setIsModalOpen(true)
                    }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-24 w-32 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200">
                          {facility.details.images[0] && !imageErrors[facility._id.toString()] ? (
                            <Image
                              src={facility.details.images[0]}
                              alt={facility.details.name}
                              width={128}
                              height={96}
                              className="h-full w-full object-cover"
                              onError={() => {
                                setImageErrors(prev => ({
                                  ...prev,
                                  [facility._id.toString()]: true
                                }))
                              }}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gray-50 text-gray-400">
                              No Image
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {facility.details.name}
                          </div>
                          <div className="mt-1 text-sm text-gray-500">
                            {facility.address}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {facility.details.rentalPlans.map((plan) => (
                              <span
                                key={plan.name}
                                className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600"
                              >
                                {formatPrice(plan)}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {formatDate(facility.createdAt)}
                    </td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <StatusActions 
                        facilityId={facility._id.toString()}
                        status={facility.status}
                        onStatusChange={handleStatusChange}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedFacility && (
        <FacilityModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedFacility(null)
          }}
          facility={selectedFacility}
        />
      )}
    </div>
  )
} 