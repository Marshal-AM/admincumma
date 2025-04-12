'use client'

import { useState, useEffect } from 'react'
import { ObjectId } from 'mongodb'
import Image from 'next/image'
import Link from 'next/link'
import { Building2, ExternalLink, Edit, Package } from 'lucide-react'
import { useRouter } from 'next/navigation'

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
  primaryContactNumber: string | null;
  primaryEmailId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export default function BackdoorPage() {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchServiceProviders() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/backdoor/service-providers');
        if (!response.ok) {
          throw new Error('Failed to fetch service providers');
        }
        const data = await response.json();
        setProviders(data);
      } catch (error) {
        console.error('Error fetching service providers:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchServiceProviders();
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Service Providers</h1>
          <p className="text-sm text-gray-500">View and manage service providers</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <p className="text-gray-500">Loading service providers...</p>
          </div>
        ) : providers.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <p className="text-gray-500">No service providers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50/50">
                  <th className="whitespace-nowrap px-6 py-5 text-left text-sm font-medium text-gray-600">
                    Provider Details
                  </th>
                  <th className="whitespace-nowrap px-6 py-5 text-left text-sm font-medium text-gray-600">
                    Location
                  </th>
                  <th className="whitespace-nowrap px-6 py-5 text-left text-sm font-medium text-gray-600">
                    Contact
                  </th>
                  <th className="whitespace-nowrap px-6 py-5 text-left text-sm font-medium text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {providers.map((provider) => (
                  <tr key={provider._id.toString()} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200">
                          {provider.logoUrl ? (
                            <Image
                              src={provider.logoUrl}
                              alt={provider.serviceName || 'Service Provider'}
                              width={48}
                              height={48}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
                              <Building2 className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {provider.serviceName || 'Unnamed Provider'}
                          </div>
                          <div className="mt-0.5 text-sm text-gray-500">
                            {provider.serviceProviderType || 'Unknown Type'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {provider.address || 'No address provided'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {[provider.city, provider.stateProvince, provider.zipPostalCode]
                          .filter(Boolean)
                          .join(', ') || 'No location details'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {provider.primaryContactNumber || 'No phone provided'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {provider.primaryEmailId || 'No email provided'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-3">
                        <Link
                          href={`/backdoor/provider/${provider._id.toString()}`}
                          className="rounded-md bg-blue-50 p-2 text-blue-600 hover:bg-blue-100"
                          title="View details"
                        >
                          <ExternalLink className="h-5 w-5" />
                        </Link>
                        <Link
                          href={`/backdoor/provider/${provider._id.toString()}/edit`}
                          className="rounded-md bg-amber-50 p-2 text-amber-600 hover:bg-amber-100"
                          title="Edit provider"
                        >
                          <Edit className="h-5 w-5" />
                        </Link>
                        <Link
                          href={`/backdoor/provider/${provider._id.toString()}/facilities`}
                          className="rounded-md bg-green-50 p-2 text-green-600 hover:bg-green-100"
                          title="View facilities"
                        >
                          <Package className="h-5 w-5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
} 