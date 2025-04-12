'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ObjectId } from 'mongodb'
import { ArrowLeft, Save, X, Plus, Clock } from 'lucide-react'
import Image from 'next/image'

interface RentalPlan {
  name: string;
  price: number;
  duration: string;
}

interface Timings {
  monday: { isOpen: boolean; openTime?: string; closeTime?: string };
  tuesday: { isOpen: boolean; openTime?: string; closeTime?: string };
  wednesday: { isOpen: boolean; openTime?: string; closeTime?: string };
  thursday: { isOpen: boolean; openTime?: string; closeTime?: string };
  friday: { isOpen: boolean; openTime?: string; closeTime?: string };
  saturday: { isOpen: boolean; openTime?: string; closeTime?: string };
  sunday: { isOpen: boolean; openTime?: string; closeTime?: string };
}

interface FacilityCommon {
  _id: ObjectId;
  serviceProviderId: ObjectId;
  facilityType: string;
  status: string;
  name: string;
  description: string;
  images: string[];
  videoLink?: string;
  rentalPlans: RentalPlan[];
  subscriptionPlans?: RentalPlan[];
  rentPerYear?: number;
  rentPerMonth?: number;
  rentPerWeek?: number;
  dayPassRent?: number;
  address: string;
  city: string;
  pincode: string;
  state: string;
  country: string;
  timings?: Timings;
  createdAt: Date;
  updatedAt: Date;
  originalData?: any; // To hold the original document structure
}

const facilityStatuses = [
  'Available',
  'Unavailable',
  'Under Maintenance',
  'pending',
  'Coming Soon'
];

const facilityTypes = [
  'studio',
  'coworking',
  'private-office',
  'raw-space-office',
  'event-space',
  'meeting-room',
  'Other'
];

const durationTypes = [
  'Hourly',
  'Daily',
  'Weekly',
  'Monthly',
  'Annual',
];

export default function EditFacilityPage() {
  const params = useParams();
  const router = useRouter();
  const facilityId = params.id as string;
  
  const [facility, setFacility] = useState<FacilityCommon | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newRentalPlan, setNewRentalPlan] = useState<RentalPlan>({
    name: '',
    price: 0,
    duration: ''
  });

  useEffect(() => {
    async function fetchFacility() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/backdoor/facilities/${facilityId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch facility');
        }
        
        const data = await response.json();
        console.log("Fetched facility data:", data);
        
        // Transform the data to match our common fields interface
        const commonData: FacilityCommon = {
          _id: data._id,
          serviceProviderId: data.serviceProviderId,
          facilityType: data.facilityType || '',
          status: data.status || '',
          name: data.name || '',
          description: data.description || '',
          images: data.images || [],
          videoLink: data.videoLink || '',
          rentalPlans: data.rentalPlans || [],
          subscriptionPlans: data.subscriptionPlans || [],
          rentPerYear: data.rentPerYear || 0,
          rentPerMonth: data.rentPerMonth || 0,
          rentPerWeek: data.rentPerWeek || 0,
          dayPassRent: data.dayPassRent || 0,
          address: data.address || '',
          city: data.city || '',
          pincode: data.pincode || '',
          state: data.state || '',
          country: data.country || '',
          timings: data.timings || {
            monday: { isOpen: false },
            tuesday: { isOpen: false },
            wednesday: { isOpen: false },
            thursday: { isOpen: false },
            friday: { isOpen: false },
            saturday: { isOpen: false },
            sunday: { isOpen: false }
          },
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          originalData: data.originalData || data // Store the original data structure
        };
        
        console.log("Transformed data for form:", commonData);
        setFacility(commonData);
      } catch (error) {
        console.error('Error fetching facility:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    if (facilityId) {
      fetchFacility();
    }
  }, [facilityId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    if (!facility) return;
    
    // Handle nested fields with dot notation (e.g., "timings.monday.isOpen")
    if (name.includes('.')) {
      const parts = name.split('.');
      
      setFacility(prev => {
        if (!prev) return prev;
        
        if (parts.length === 2) { // Simple nested field
          return {
            ...prev,
            [parts[0]]: {
              ...prev[parts[0] as keyof FacilityCommon],
              [parts[1]]: value
            }
          };
        } else if (parts.length === 3) { // Double nested field like timings.monday.isOpen
          const [parent, middle, child] = parts;
          
          return {
            ...prev,
            [parent]: {
              ...prev[parent as keyof FacilityCommon],
              [middle]: {
                ...((prev[parent as keyof FacilityCommon] as any)?.[middle] || {}),
                [child]: value === 'true' ? true : value === 'false' ? false : value
              }
            }
          };
        }
        
        return prev;
      });
    } else {
      // Handle top-level fields
      setFacility(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          [name]: value
        };
      });
    }
  };

  const addImage = () => {
    if (!newImageUrl.trim() || !facility) return;
    
    setFacility(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        images: [...(prev.images || []), newImageUrl.trim()]
      };
    });
    
    setNewImageUrl('');
  };

  const removeImage = (index: number) => {
    if (!facility) return;
    
    setFacility(prev => {
      if (!prev) return prev;
      
      const updatedImages = [...prev.images];
      updatedImages.splice(index, 1);
      
      return {
        ...prev,
        images: updatedImages
      };
    });
  };

  const handleRentalPlanChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setNewRentalPlan(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) : value
    }));
  };

  const addRentalPlan = () => {
    if (!newRentalPlan.name.trim() || !newRentalPlan.duration || !facility) return;
    
    setFacility(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        rentalPlans: [...(prev.rentalPlans || []), newRentalPlan]
      };
    });
    
    setNewRentalPlan({
      name: '',
      price: 0,
      duration: ''
    });
  };

  const removeRentalPlan = (index: number) => {
    if (!facility) return;
    
    setFacility(prev => {
      if (!prev) return prev;
      
      const updatedPlans = [...prev.rentalPlans];
      updatedPlans.splice(index, 1);
      
      return {
        ...prev,
        rentalPlans: updatedPlans
      };
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!facility) return;
    
    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);
      
      // Prepare data for submission
      // Preserve the original facilityType, status, and timings values
      const submissionData = {
        ...facility,
        facilityType: facility.originalData?.facilityType || facility.facilityType,
        status: facility.originalData?.status || facility.status,
        timings: facility.originalData?.timings || facility.timings
      };
      
      console.log("Submitting facility data:", submissionData);
      
      // Prepare data for submission, making sure to include the original structure
      const response = await fetch(`/api/backdoor/facilities/${facilityId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update facility');
      }
      
      const data = await response.json();
      console.log("Update response:", data);
      setSuccessMessage('Facility updated successfully');
      
      // Optionally, redirect back to the facility details page after a delay
      setTimeout(() => {
        router.push(`/backdoor/facilities/${facilityId}`);
      }, 1500);
    } catch (error) {
      console.error('Error updating facility:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-gray-500">Loading facility details...</p>
      </div>
    );
  }

  if (error && !facility) {
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

  if (!facility) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
        <p className="text-gray-500">Facility not found</p>
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
            Edit {facility.name}
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
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Facility Name</label>
              <input
                type="text"
                name="name"
                id="name"
                value={facility.name || ''}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                id="description"
                rows={4}
                value={facility.description || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="videoLink" className="block text-sm font-medium text-gray-700">Video Link</label>
              <input
                type="text"
                name="videoLink"
                id="videoLink"
                value={facility.videoLink || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Location & Address */}
        <div className="overflow-hidden rounded-xl bg-white shadow">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h2 className="text-lg font-medium text-gray-900">Location & Address</h2>
          </div>
          <div className="px-6 py-4 space-y-4">
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">Street Address</label>
              <input
                type="text"
                name="address"
                id="address"
                value={facility.address || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  name="city"
                  id="city"
                  value={facility.city || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
                <input
                  type="text"
                  name="state"
                  id="state"
                  value={facility.state || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="pincode" className="block text-sm font-medium text-gray-700">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  id="pincode"
                  value={facility.pincode || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                <input
                  type="text"
                  name="country"
                  id="country"
                  value={facility.country || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Rental Plans */}
        <div className="overflow-hidden rounded-xl bg-white shadow">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h2 className="text-lg font-medium text-gray-900">Rental Plans</h2>
          </div>
          <div className="px-6 py-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="rentalPlanName" className="block text-sm font-medium text-gray-700">Plan Name</label>
                <input
                  type="text"
                  name="name"
                  id="rentalPlanName"
                  value={newRentalPlan.name}
                  onChange={handleRentalPlanChange}
                  placeholder="e.g., Basic, Premium"
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="rentalPlanPrice" className="block text-sm font-medium text-gray-700">Price</label>
                <input
                  type="number"
                  name="price"
                  id="rentalPlanPrice"
                  value={newRentalPlan.price || ''}
                  onChange={handleRentalPlanChange}
                  min="0"
                  placeholder="0.00"
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="rentalPlanDuration" className="block text-sm font-medium text-gray-700">Duration</label>
                <select
                  name="duration"
                  id="rentalPlanDuration"
                  value={newRentalPlan.duration}
                  onChange={handleRentalPlanChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select duration</option>
                  {durationTypes.map(duration => (
                    <option key={duration} value={duration}>{duration}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={addRentalPlan}
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Add Plan
              </button>
            </div>

            <div className="mt-4">
              <h3 className="text-md font-medium text-gray-700 mb-2">Current Rental Plans</h3>
              {facility.rentalPlans && facility.rentalPlans.length > 0 ? (
                <div className="overflow-hidden rounded-md border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {facility.rentalPlans.map((plan, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{plan.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{plan.price}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{plan.duration}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button
                              type="button"
                              onClick={() => removeRentalPlan(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No rental plans added yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="overflow-hidden rounded-xl bg-white shadow">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h2 className="text-lg font-medium text-gray-900">Images</h2>
          </div>
          <div className="px-6 py-4 space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Image URL"
                className="block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={addImage}
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {facility.images && facility.images.map((image, index) => (
                <div key={index} className="relative rounded-md border border-gray-200 overflow-hidden">
                  <div className="relative h-40 w-full">
                    <Image
                      src={image}
                      alt={`Facility image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {(!facility.images || facility.images.length === 0) && (
                <p className="text-gray-500">No images added yet</p>
              )}
            </div>
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