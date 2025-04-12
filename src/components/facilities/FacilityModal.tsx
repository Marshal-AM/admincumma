'use client'

import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { X } from 'lucide-react'
import Image from 'next/image'

interface RentalPlan {
  name: string;
  price: number;
  duration: string;
}

interface Timing {
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
}

interface Timings {
  monday: Timing;
  tuesday: Timing;
  wednesday: Timing;
  thursday: Timing;
  friday: Timing;
  saturday: Timing;
  sunday: Timing;
}

interface FacilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  facility: {
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
    facilityType: string;
    features?: string[];
    address: string;
    city: string;
    pincode: string;
    state: string;
    country: string;
    isFeatured: boolean;
    timings: Timings;
  };
}

function formatFacilityType(type: string): string {
  return type
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
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

export default function FacilityModal({ isOpen, onClose, facility }: FacilityModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-xl bg-white p-6 shadow-xl transition-all">
                <div className="flex items-start justify-between">
                  <Dialog.Title className="text-lg font-medium text-gray-900">
                    {facility?.details?.name || 'Facility Details'}
                  </Dialog.Title>
                  <button
                    type="button"
                    className="ml-3 flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-4 space-y-6">
                  {/* Images */}
                  <div className="aspect-video overflow-hidden rounded-lg">
                    {facility?.details?.images?.[0] ? (
                      <Image
                        src={facility.details.images[0]}
                        alt={facility.details.name}
                        width={800}
                        height={450}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
                        No Image Available
                      </div>
                    )}
                  </div>

                  {/* Basic Info */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Facility Type</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {formatFacilityType(facility.facilityType)}
                    </p>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Description</h3>
                    <p className="mt-1 text-sm text-gray-500 whitespace-pre-line">
                      {facility?.details?.description || 'No description available'}
                    </p>
                  </div>

                  {/* Location */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Location</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {facility.address}, {facility.city}, {facility.state}, {facility.country} - {facility.pincode}
                    </p>
                  </div>

                  {/* Rental Plans */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Rental Plans</h3>
                    <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {facility?.details?.rentalPlans?.map((plan) => (
                        <div
                          key={plan.name}
                          className="rounded-lg border border-gray-200 p-4"
                        >
                          <h4 className="font-medium text-gray-900">{plan.name}</h4>
                          <p className="mt-1 text-sm text-gray-500">
                            ₹{plan.price.toLocaleString('en-IN')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Features - Only show if available */}
                  {facility.features && facility.features.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Features</h3>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {facility.features.map((feature) => (
                          <span
                            key={feature}
                            className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timings */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Operating Hours</h3>
                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {facility.timings && (
                        <>
                          <div className="flex justify-between rounded-lg border border-gray-200 p-3">
                            <span className="font-medium">Monday</span>
                            {facility.timings.monday.isOpen ? (
                              <span className="text-sm text-gray-600">
                                {formatTime(facility.timings.monday.openTime)} - {formatTime(facility.timings.monday.closeTime)}
                              </span>
                            ) : (
                              <span className="text-sm text-red-600">Closed</span>
                            )}
                          </div>
                          <div className="flex justify-between rounded-lg border border-gray-200 p-3">
                            <span className="font-medium">Tuesday</span>
                            {facility.timings.tuesday.isOpen ? (
                              <span className="text-sm text-gray-600">
                                {formatTime(facility.timings.tuesday.openTime)} - {formatTime(facility.timings.tuesday.closeTime)}
                              </span>
                            ) : (
                              <span className="text-sm text-red-600">Closed</span>
                            )}
                          </div>
                          <div className="flex justify-between rounded-lg border border-gray-200 p-3">
                            <span className="font-medium">Wednesday</span>
                            {facility.timings.wednesday.isOpen ? (
                              <span className="text-sm text-gray-600">
                                {formatTime(facility.timings.wednesday.openTime)} - {formatTime(facility.timings.wednesday.closeTime)}
                              </span>
                            ) : (
                              <span className="text-sm text-red-600">Closed</span>
                            )}
                          </div>
                          <div className="flex justify-between rounded-lg border border-gray-200 p-3">
                            <span className="font-medium">Thursday</span>
                            {facility.timings.thursday.isOpen ? (
                              <span className="text-sm text-gray-600">
                                {formatTime(facility.timings.thursday.openTime)} - {formatTime(facility.timings.thursday.closeTime)}
                              </span>
                            ) : (
                              <span className="text-sm text-red-600">Closed</span>
                            )}
                          </div>
                          <div className="flex justify-between rounded-lg border border-gray-200 p-3">
                            <span className="font-medium">Friday</span>
                            {facility.timings.friday.isOpen ? (
                              <span className="text-sm text-gray-600">
                                {formatTime(facility.timings.friday.openTime)} - {formatTime(facility.timings.friday.closeTime)}
                              </span>
                            ) : (
                              <span className="text-sm text-red-600">Closed</span>
                            )}
                          </div>
                          <div className="flex justify-between rounded-lg border border-gray-200 p-3">
                            <span className="font-medium">Saturday</span>
                            {facility.timings.saturday.isOpen ? (
                              <span className="text-sm text-gray-600">
                                {formatTime(facility.timings.saturday.openTime)} - {formatTime(facility.timings.saturday.closeTime)}
                              </span>
                            ) : (
                              <span className="text-sm text-red-600">Closed</span>
                            )}
                          </div>
                          <div className="flex justify-between rounded-lg border border-gray-200 p-3">
                            <span className="font-medium">Sunday</span>
                            {facility.timings.sunday.isOpen ? (
                              <span className="text-sm text-gray-600">
                                {formatTime(facility.timings.sunday.openTime)} - {formatTime(facility.timings.sunday.closeTime)}
                              </span>
                            ) : (
                              <span className="text-sm text-red-600">Closed</span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Capacity Information */}
                  {(facility?.details?.totalCabins || 
                    facility?.details?.totalSeats || 
                    facility?.details?.totalRooms || 
                    facility?.details?.seatingCapacity) && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Capacity Information</h3>
                      <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {facility?.details?.totalCabins && (
                          <div className="rounded-lg border border-gray-200 p-4">
                            <h4 className="font-medium text-gray-900">Cabins</h4>
                            <p className="mt-1 text-sm text-gray-500">
                              Available: {facility.details.availableCabins} / {facility.details.totalCabins}
                            </p>
                          </div>
                        )}
                        {facility?.details?.totalSeats && (
                          <div className="rounded-lg border border-gray-200 p-4">
                            <h4 className="font-medium text-gray-900">Seats</h4>
                            <p className="mt-1 text-sm text-gray-500">
                              Available: {facility.details.availableSeats} / {facility.details.totalSeats}
                            </p>
                          </div>
                        )}
                        {facility?.details?.totalRooms && (
                          <div className="rounded-lg border border-gray-200 p-4">
                            <h4 className="font-medium text-gray-900">Rooms</h4>
                            <p className="mt-1 text-sm text-gray-500">
                              Total: {facility.details.totalRooms}
                            </p>
                          </div>
                        )}
                        {facility?.details?.seatingCapacity && (
                          <div className="rounded-lg border border-gray-200 p-4">
                            <h4 className="font-medium text-gray-900">Seating Capacity</h4>
                            <p className="mt-1 text-sm text-gray-500">
                              {facility.details.seatingCapacity} persons
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
} 