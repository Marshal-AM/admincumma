'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ObjectId } from 'mongodb'
import { ArrowLeft, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface RentalPlan {
  name: string;
  price: number;
  duration: string;
}

interface Facility {
  _id: ObjectId;
  serviceProviderId: ObjectId;
  facilityType: string;
  status: string;
  facilityName?: string;
  userId?: ObjectId;
  capacity?: number;
  amenities?: string[];
  price?: {
    amount: number;
    currency: string;
    unit: string;
  };
  name?: string;
  description: string;
  images: string[];
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  details?: {
    name?: string;
    description?: string;
    images?: string[];
    rentalPlans: RentalPlan[];
    studioDetails?: {
      facilityName?: string;
      description?: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
  isFeatured?: boolean;
  features?: string[];
}

interface ServiceProvider {
  _id: ObjectId;
  serviceName: string | null;
}

export default function FacilityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const facilityId = params.id as string;
  
  const [facility, setFacility] = useState<Facility | null>(null);
  const [provider, setProvider] = useState<ServiceProvider | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        
        // Fetch facility details
        const facilityResponse = await fetch(`/api/backdoor/facilities/${facilityId}`);
        
        if (!facilityResponse.ok) {
          const errorData = await facilityResponse.json();
          throw new Error(errorData.error || 'Failed to fetch facility');
        }
        
        const facilityData = await facilityResponse.json();
        setFacility(facilityData);
        
        // Fetch provider details
        if (facilityData.serviceProviderId) {
          const providerResponse = await fetch(`/api/backdoor/service-providers/${facilityData.serviceProviderId}`);
          
          if (providerResponse.ok) {
            const providerData = await providerResponse.json();
            setProvider(providerData);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    if (facilityId) {
      fetchData();
    }
  }, [facilityId]);

  const handleDeleteFacility = async () => {
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
      
      // Navigate back to the provider's facilities list
      if (provider) {
        router.push(`/backdoor/provider/${provider._id}/facilities`);
      } else {
        router.push('/backdoor/facilities');
      }
      
    } catch (error) {
      console.error('Error deleting facility:', error);
      alert(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-gray-500">Loading facility details...</p>
      </div>
    );
  }

  if (error || !facility) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
        <p className="text-red-500">{error || 'Facility not found'}</p>
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
            {facility.facilityName || facility.name || facility.details?.name || "Unnamed Facility"}
          </h1>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/backdoor/facilities/${facilityId}/edit`}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <div className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </div>
          </Link>
          <button
            onClick={handleDeleteFacility}
            className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            <div className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column with images */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-xl bg-white shadow">
            {(facility.images && facility.images.length > 0) || (facility.details?.images && facility.details.images.length > 0) ? (
              <div className="relative h-96 w-full">
                <Image
                  src={(facility.images && facility.images.length > 0) ? facility.images[0] : facility.details!.images![0]}
                  alt={facility.facilityName || facility.name || facility.details?.name || "Facility Image"}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex h-96 w-full items-center justify-center bg-gray-200">
                <p className="text-gray-500">No image available</p>
              </div>
            )}
            
            {((facility.images && facility.images.length > 1) || (facility.details?.images && facility.details.images.length > 1)) && (
              <div className="flex gap-2 overflow-x-auto p-4">
                {(facility.images && facility.images.length > 1 
                  ? facility.images.slice(1) 
                  : facility.details!.images!.slice(1)).map((image, index) => (
                  <div key={index} className="relative h-20 w-20 flex-shrink-0">
                    <Image
                      src={image}
                      alt={`${facility.facilityName || facility.name || facility.details?.name || "Facility"} - Image ${index + 2}`}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column with details */}
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="overflow-hidden rounded-xl bg-white shadow">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900">Basic Information</h2>
            </div>
            <div className="p-6 space-y-4">
              {provider && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Service Provider</p>
                  <Link 
                    href={`/backdoor/provider/${provider._id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {provider.serviceName}
                  </Link>
                </div>
              )}
              
              <div>
                <p className="text-sm font-medium text-gray-500">Type</p>
                <p className="text-gray-900">{facility.facilityType}</p>
              </div>
              
              {facility.capacity && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Capacity</p>
                  <p className="text-gray-900">{facility.capacity} people</p>
                </div>
              )}
              
              <div>
                <p className="text-sm font-medium text-gray-500">Price</p>
                <p className="text-gray-900">
                  {facility.price && facility.price.amount ? (
                    `${facility.price.amount} ${facility.price.currency || '₹'}/${facility.price.unit || 'month'}`
                  ) : (
                    facility.details?.rentalPlans && facility.details.rentalPlans.length > 0 ? (
                      `₹${facility.details.rentalPlans[0].price} / ${facility.details.rentalPlans[0].duration.toLowerCase()}`
                    ) : (
                      "Price not available"
                    )
                  )}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <span className="inline-block rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                  {facility.status}
                </span>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Created</p>
                <p className="text-gray-900">
                  {new Date(facility.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Last Updated</p>
                <p className="text-gray-900">
                  {new Date(facility.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="overflow-hidden rounded-xl bg-white shadow">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900">Description</h2>
            </div>
            <div className="p-6">
              <p className="whitespace-pre-wrap text-gray-700">
                {facility.description || facility.details?.description || "No description available"}
              </p>
            </div>
          </div>

          {/* Amenities/Features */}
          {(facility.amenities && facility.amenities.length > 0) || (facility.features && facility.features.length > 0) ? (
            <div className="overflow-hidden rounded-xl bg-white shadow">
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                <h2 className="text-lg font-medium text-gray-900">
                  {facility.amenities ? "Amenities" : "Features"}
                </h2>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-2">
                  {(facility.amenities || facility.features || []).map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
} 