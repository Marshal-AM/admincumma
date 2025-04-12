'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ObjectId } from 'mongodb'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Building2, Edit, Package } from 'lucide-react'

interface ServiceProvider {
  _id: ObjectId;
  userId: ObjectId;
  serviceProviderType: string | null;
  serviceName: string | null;
  logoUrl: string | null;
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
  createdAt: Date;
  updatedAt: Date;
  timings: {
    monday: { isOpen: boolean; openTime?: string; closeTime?: string };
    tuesday: { isOpen: boolean; openTime?: string; closeTime?: string };
    wednesday: { isOpen: boolean; openTime?: string; closeTime?: string };
    thursday: { isOpen: boolean; openTime?: string; closeTime?: string };
    friday: { isOpen: boolean; openTime?: string; closeTime?: string };
    saturday: { isOpen: boolean; openTime?: string; closeTime?: string };
    sunday: { isOpen: boolean; openTime?: string; closeTime?: string };
  };
}

function formatTime(time?: string): string {
  if (!time) return 'Not specified';
  
  // Simple 24-hour to 12-hour format conversion
  try {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  } catch (error) {
    return time; // If format is unexpected, return as is
  }
}

export default function ServiceProviderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const providerId = params.id as string;
  
  const [provider, setProvider] = useState<ServiceProvider | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchServiceProvider() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/backdoor/service-providers/${providerId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch service provider');
        }
        
        const data = await response.json();
        setProvider(data);
      } catch (error) {
        console.error('Error fetching service provider:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    if (providerId) {
      fetchServiceProvider();
    }
  }, [providerId]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-gray-500">Loading service provider details...</p>
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

  if (!provider) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
        <p className="text-gray-500">Service provider not found</p>
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
            {provider.serviceName || 'Service Provider Details'}
          </h1>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/backdoor/provider/${providerId}/edit`}
            className="rounded-md bg-amber-100 px-4 py-2 text-amber-700 hover:bg-amber-200"
          >
            <div className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </div>
          </Link>
          <Link
            href={`/backdoor/provider/${providerId}/facilities`}
            className="rounded-md bg-blue-100 px-4 py-2 text-blue-700 hover:bg-blue-200"
          >
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span>View Facilities</span>
            </div>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Basic Information */}
        <div className="overflow-hidden rounded-xl bg-white shadow">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h2 className="text-lg font-medium text-gray-900">Basic Information</h2>
          </div>
          <div className="px-6 py-4">
            <div className="flex flex-col items-center gap-4 border-b border-gray-100 pb-6 sm:flex-row">
              <div className="h-24 w-24 overflow-hidden rounded-lg border border-gray-200">
                {provider.logoUrl ? (
                  <Image
                    src={provider.logoUrl}
                    alt={provider.serviceName || ''}
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-100">
                    <Building2 className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-900">
                  {provider.serviceName || 'Unnamed Provider'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {provider.serviceProviderType || 'No type specified'}
                </p>
                {provider.websiteUrl && (
                  <a
                    href={provider.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Visit Website
                  </a>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Address</h4>
                <p className="mt-1 text-sm text-gray-900">
                  {provider.address || 'No address provided'}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Location</h4>
                <p className="mt-1 text-sm text-gray-900">
                  {[provider.city, provider.stateProvince, provider.zipPostalCode]
                    .filter(Boolean)
                    .join(', ') || 'No location details'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="overflow-hidden rounded-xl bg-white shadow">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h2 className="text-lg font-medium text-gray-900">Contact Information</h2>
          </div>
          <div className="divide-y divide-gray-100">
            <div className="px-6 py-4">
              <h3 className="text-sm font-medium text-gray-500">Primary Contact</h3>
              <div className="mt-2 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-900">
                    {provider.primaryContact1Name || 'No name provided'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {provider.primaryContact1Designation || 'No designation'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-900">
                    {provider.primaryContactNumber || 'No phone provided'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {provider.primaryEmailId || 'No email provided'}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4">
              <h3 className="text-sm font-medium text-gray-500">Secondary Contact</h3>
              <div className="mt-2 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-900">
                    {provider.contact2Name || 'No name provided'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {provider.contact2Designation || 'No designation'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-900">
                    {provider.alternateContactNumber || 'No phone provided'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {provider.alternateEmailId || 'No email provided'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="overflow-hidden rounded-xl bg-white shadow lg:col-span-2">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h2 className="text-lg font-medium text-gray-900">Operating Hours</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {provider.timings && (
              <>
                <div className="rounded-lg border border-gray-200 p-4">
                  <h3 className="font-medium text-gray-900">Monday</h3>
                  <p className="mt-1 text-sm">
                    {provider.timings.monday.isOpen ? (
                      <span className="text-green-600">
                        {formatTime(provider.timings.monday.openTime)} - {formatTime(provider.timings.monday.closeTime)}
                      </span>
                    ) : (
                      <span className="text-red-600">Closed</span>
                    )}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 p-4">
                  <h3 className="font-medium text-gray-900">Tuesday</h3>
                  <p className="mt-1 text-sm">
                    {provider.timings.tuesday.isOpen ? (
                      <span className="text-green-600">
                        {formatTime(provider.timings.tuesday.openTime)} - {formatTime(provider.timings.tuesday.closeTime)}
                      </span>
                    ) : (
                      <span className="text-red-600">Closed</span>
                    )}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 p-4">
                  <h3 className="font-medium text-gray-900">Wednesday</h3>
                  <p className="mt-1 text-sm">
                    {provider.timings.wednesday.isOpen ? (
                      <span className="text-green-600">
                        {formatTime(provider.timings.wednesday.openTime)} - {formatTime(provider.timings.wednesday.closeTime)}
                      </span>
                    ) : (
                      <span className="text-red-600">Closed</span>
                    )}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 p-4">
                  <h3 className="font-medium text-gray-900">Thursday</h3>
                  <p className="mt-1 text-sm">
                    {provider.timings.thursday.isOpen ? (
                      <span className="text-green-600">
                        {formatTime(provider.timings.thursday.openTime)} - {formatTime(provider.timings.thursday.closeTime)}
                      </span>
                    ) : (
                      <span className="text-red-600">Closed</span>
                    )}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 p-4">
                  <h3 className="font-medium text-gray-900">Friday</h3>
                  <p className="mt-1 text-sm">
                    {provider.timings.friday.isOpen ? (
                      <span className="text-green-600">
                        {formatTime(provider.timings.friday.openTime)} - {formatTime(provider.timings.friday.closeTime)}
                      </span>
                    ) : (
                      <span className="text-red-600">Closed</span>
                    )}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 p-4">
                  <h3 className="font-medium text-gray-900">Saturday</h3>
                  <p className="mt-1 text-sm">
                    {provider.timings.saturday.isOpen ? (
                      <span className="text-green-600">
                        {formatTime(provider.timings.saturday.openTime)} - {formatTime(provider.timings.saturday.closeTime)}
                      </span>
                    ) : (
                      <span className="text-red-600">Closed</span>
                    )}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 p-4">
                  <h3 className="font-medium text-gray-900">Sunday</h3>
                  <p className="mt-1 text-sm">
                    {provider.timings.sunday.isOpen ? (
                      <span className="text-green-600">
                        {formatTime(provider.timings.sunday.openTime)} - {formatTime(provider.timings.sunday.closeTime)}
                      </span>
                    ) : (
                      <span className="text-red-600">Closed</span>
                    )}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 