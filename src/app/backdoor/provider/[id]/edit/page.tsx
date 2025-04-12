'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ObjectId } from 'mongodb'
import { ArrowLeft, Save } from 'lucide-react'

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

const serviceProviderTypes = [
  'Incubator',
  'Accelerator',
  'Institution/University',
  'Private Coworking Space',
  'Community Space',
  'Studio'
];

export default function EditServiceProviderPage() {
  const params = useParams();
  const router = useRouter();
  const providerId = params.id as string;
  
  const [provider, setProvider] = useState<ServiceProvider | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    // Handle nested fields with dot notation (e.g., "timings.monday.isOpen")
    if (name.includes('.')) {
      const parts = name.split('.');
      if (provider) {
        setProvider(prev => {
          if (!prev) return prev;
          
          const newProvider = { ...prev };
          let current: any = newProvider;
          
          // Navigate to the second-to-last part
          for (let i = 0; i < parts.length - 1; i++) {
            if (!current[parts[i]]) {
              current[parts[i]] = {};
            }
            current = current[parts[i]];
          }
          
          // Set the value of the last part
          const lastPart = parts[parts.length - 1];
          current[lastPart] = value;
          
          return newProvider;
        });
      }
    } else {
      // Handle top-level fields
      setProvider(prev => {
        if (!prev) return prev;
        return { ...prev, [name]: value };
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    // Handle nested fields
    if (name.includes('.')) {
      const parts = name.split('.');
      if (provider) {
        setProvider(prev => {
          if (!prev) return prev;
          
          const newProvider = { ...prev };
          let current: any = newProvider;
          
          // Navigate to the second-to-last part
          for (let i = 0; i < parts.length - 1; i++) {
            if (!current[parts[i]]) {
              current[parts[i]] = {};
            }
            current = current[parts[i]];
          }
          
          // Set the value of the last part
          const lastPart = parts[parts.length - 1];
          current[lastPart] = checked;
          
          return newProvider;
        });
      }
    } else {
      // Handle top-level fields
      setProvider(prev => {
        if (!prev) return prev;
        return { ...prev, [name]: checked };
      });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!provider) return;
    
    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);
      
      const response = await fetch(`/api/backdoor/service-providers/${providerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(provider),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update service provider');
      }
      
      const data = await response.json();
      setSuccessMessage('Service provider updated successfully');
      
      // Optionally, redirect back to the provider details page after a delay
      setTimeout(() => {
        router.push(`/backdoor/provider/${providerId}`);
      }, 1500);
    } catch (error) {
      console.error('Error updating service provider:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-gray-500">Loading service provider details...</p>
      </div>
    );
  }

  if (error && !provider) {
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
            Edit {provider.serviceName || 'Service Provider'}
          </h1>
        </div>
        <div>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-blue-300"
          >
            <div className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </div>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="rounded-md bg-green-50 p-4 text-green-800">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-red-800">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="overflow-hidden rounded-xl bg-white shadow">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h2 className="text-lg font-medium text-gray-900">Basic Information</h2>
          </div>
          <div className="px-6 py-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="serviceName" className="block text-sm font-medium text-gray-700">Service Name</label>
                <input
                  type="text"
                  name="serviceName"
                  id="serviceName"
                  value={provider.serviceName || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="serviceProviderType" className="block text-sm font-medium text-gray-700">Provider Type</label>
                <select
                  name="serviceProviderType"
                  id="serviceProviderType"
                  value={provider.serviceProviderType || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select a type</option>
                  {serviceProviderTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700">Logo URL</label>
              <input
                type="text"
                name="logoUrl"
                id="logoUrl"
                value={provider.logoUrl || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700">Website URL</label>
              <input
                type="text"
                name="websiteUrl"
                id="websiteUrl"
                value={provider.websiteUrl || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
              <textarea
                name="address"
                id="address"
                rows={3}
                value={provider.address || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  name="city"
                  id="city"
                  value={provider.city || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="stateProvince" className="block text-sm font-medium text-gray-700">State/Province</label>
                <input
                  type="text"
                  name="stateProvince"
                  id="stateProvince"
                  value={provider.stateProvince || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="zipPostalCode" className="block text-sm font-medium text-gray-700">Postal Code</label>
                <input
                  type="text"
                  name="zipPostalCode"
                  id="zipPostalCode"
                  value={provider.zipPostalCode || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
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
            {/* Primary Contact */}
            <div className="px-6 py-4 space-y-4">
              <h3 className="text-md font-medium text-gray-700">Primary Contact</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="primaryContact1Name" className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="primaryContact1Name"
                    id="primaryContact1Name"
                    value={provider.primaryContact1Name || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="primaryContact1Designation" className="block text-sm font-medium text-gray-700">Designation</label>
                  <input
                    type="text"
                    name="primaryContact1Designation"
                    id="primaryContact1Designation"
                    value={provider.primaryContact1Designation || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="primaryContactNumber" className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="text"
                    name="primaryContactNumber"
                    id="primaryContactNumber"
                    value={provider.primaryContactNumber || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="primaryEmailId" className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="primaryEmailId"
                    id="primaryEmailId"
                    value={provider.primaryEmailId || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Secondary Contact */}
            <div className="px-6 py-4 space-y-4">
              <h3 className="text-md font-medium text-gray-700">Secondary Contact</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact2Name" className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="contact2Name"
                    id="contact2Name"
                    value={provider.contact2Name || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="contact2Designation" className="block text-sm font-medium text-gray-700">Designation</label>
                  <input
                    type="text"
                    name="contact2Designation"
                    id="contact2Designation"
                    value={provider.contact2Designation || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="alternateContactNumber" className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="text"
                    name="alternateContactNumber"
                    id="alternateContactNumber"
                    value={provider.alternateContactNumber || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="alternateEmailId" className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="alternateEmailId"
                    id="alternateEmailId"
                    value={provider.alternateEmailId || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="overflow-hidden rounded-xl bg-white shadow">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h2 className="text-lg font-medium text-gray-900">Operating Hours</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {provider.timings && (
              <>
                {/* Monday */}
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-md font-medium text-gray-700">Monday</h3>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="timings.monday.isOpen"
                        name="timings.monday.isOpen"
                        checked={provider.timings.monday.isOpen}
                        onChange={handleCheckboxChange}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="timings.monday.isOpen" className="ml-2 text-sm text-gray-700">
                        Open
                      </label>
                    </div>
                  </div>
                  {provider.timings.monday.isOpen && (
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="timings.monday.openTime" className="block text-sm font-medium text-gray-700">
                          Opening Time
                        </label>
                        <input
                          type="time"
                          id="timings.monday.openTime"
                          name="timings.monday.openTime"
                          value={provider.timings.monday.openTime || ''}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="timings.monday.closeTime" className="block text-sm font-medium text-gray-700">
                          Closing Time
                        </label>
                        <input
                          type="time"
                          id="timings.monday.closeTime"
                          name="timings.monday.closeTime"
                          value={provider.timings.monday.closeTime || ''}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Tuesday */}
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-md font-medium text-gray-700">Tuesday</h3>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="timings.tuesday.isOpen"
                        name="timings.tuesday.isOpen"
                        checked={provider.timings.tuesday.isOpen}
                        onChange={handleCheckboxChange}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="timings.tuesday.isOpen" className="ml-2 text-sm text-gray-700">
                        Open
                      </label>
                    </div>
                  </div>
                  {provider.timings.tuesday.isOpen && (
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="timings.tuesday.openTime" className="block text-sm font-medium text-gray-700">
                          Opening Time
                        </label>
                        <input
                          type="time"
                          id="timings.tuesday.openTime"
                          name="timings.tuesday.openTime"
                          value={provider.timings.tuesday.openTime || ''}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="timings.tuesday.closeTime" className="block text-sm font-medium text-gray-700">
                          Closing Time
                        </label>
                        <input
                          type="time"
                          id="timings.tuesday.closeTime"
                          name="timings.tuesday.closeTime"
                          value={provider.timings.tuesday.closeTime || ''}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Similar sections for other days... */}
                {/* Wednesday */}
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-md font-medium text-gray-700">Wednesday</h3>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="timings.wednesday.isOpen"
                        name="timings.wednesday.isOpen"
                        checked={provider.timings.wednesday.isOpen}
                        onChange={handleCheckboxChange}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="timings.wednesday.isOpen" className="ml-2 text-sm text-gray-700">
                        Open
                      </label>
                    </div>
                  </div>
                  {provider.timings.wednesday.isOpen && (
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="timings.wednesday.openTime" className="block text-sm font-medium text-gray-700">
                          Opening Time
                        </label>
                        <input
                          type="time"
                          id="timings.wednesday.openTime"
                          name="timings.wednesday.openTime"
                          value={provider.timings.wednesday.openTime || ''}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="timings.wednesday.closeTime" className="block text-sm font-medium text-gray-700">
                          Closing Time
                        </label>
                        <input
                          type="time"
                          id="timings.wednesday.closeTime"
                          name="timings.wednesday.closeTime"
                          value={provider.timings.wednesday.closeTime || ''}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:bg-blue-300"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
} 