'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ObjectId } from 'mongodb'
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface ServiceProvider {
  _id: ObjectId;
  serviceName: string | null;
  logoUrl: string | null;
}

interface Facility {
  _id: ObjectId;
  userId: ObjectId;
  serviceProviderId: ObjectId;
  facilityName: string;
  facilityType: string;
  capacity: number;
  amenities: string[];
  price: {
    amount: number;
    currency: string;
    unit: string;
  };
  images: string[];
  description: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function ProviderFacilitiesPage() {
  const params = useParams();
  const router = useRouter();
  const providerId = params.id as string;
  
  const [provider, setProvider] = useState<ServiceProvider | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        
        // Fetch provider details
        const providerResponse = await fetch(`/api/backdoor/service-providers/${providerId}`);
        
        if (!providerResponse.ok) {
          const errorData = await providerResponse.json();
          throw new Error(errorData.error || 'Failed to fetch service provider');
        }
        
        const providerData = await providerResponse.json();
        setProvider(providerData);
        
        // Fetch facilities for this provider
        const facilitiesResponse = await fetch(`/api/backdoor/service-providers/${providerId}/facilities`);
        
        if (!facilitiesResponse.ok) {
          const errorData = await facilitiesResponse.json();
          throw new Error(errorData.error || 'Failed to fetch facilities');
        }
        
        const facilitiesData = await facilitiesResponse.json();
        setFacilities(facilitiesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    if (providerId) {
      fetchData();
    }
  }, [providerId]);

  const handleDeleteFacility = async (facilityId: string) => {
    if (!confirm('Are you sure you want to delete this facility?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/backdoor/facilities/${facilityId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete facility');
      }
      
      // Remove the deleted facility from the list
      setFacilities(prev => prev.filter(facility => facility._id.toString() !== facilityId));
      
    } catch (error) {
      console.error('Error deleting facility:', error);
      alert(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-gray-500">Loading facilities...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => router.back()}
          className="rounded-md bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-semibold text-gray-800">
            {provider?.serviceName || 'Provider'} Facilities
          </h1>
        </div>
      </div>

      {facilities.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-xl bg-white p-6 shadow">
          <p className="mb-4 text-gray-500">No facilities found for this service provider.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {facilities.map((facility) => (
            <div key={facility._id.toString()} className="overflow-hidden rounded-xl bg-white shadow">
              <div className="relative h-48 w-full">
                {facility.images && facility.images.length > 0 ? (
                  <Image
                    src={facility.images[0]}
                    alt={facility.facilityName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-200">
                    <p className="text-gray-500">No image available</p>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-800">{facility.facilityName}</h2>
                <p className="text-sm text-gray-500">{facility.facilityType}</p>
                <div className="mt-2 flex items-center">
                  <span className="text-md font-semibold text-gray-900">
                    {facility.price.amount} {facility.price.currency}/{facility.price.unit}
                  </span>
                  <span className="ml-2 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                    {facility.status}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {facility.amenities.slice(0, 3).map((amenity, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
                    >
                      {amenity}
                    </span>
                  ))}
                  {facility.amenities.length > 3 && (
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                      +{facility.amenities.length - 3} more
                    </span>
                  )}
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <Link
                    href={`/backdoor/facilities/${facility._id}/edit`}
                    className="rounded-md p-2 text-gray-500 hover:bg-gray-100"
                  >
                    <Edit className="h-5 w-5" />
                  </Link>
                  <button
                    onClick={() => handleDeleteFacility(facility._id.toString())}
                    className="rounded-md p-2 text-red-500 hover:bg-red-100"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 