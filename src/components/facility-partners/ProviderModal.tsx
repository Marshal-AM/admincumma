'use client'

import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { X } from 'lucide-react'
import { ObjectId } from 'mongodb'

interface ProviderModalProps {
  isOpen: boolean
  onClose: () => void
  provider: {
    _id: ObjectId;
    serviceName: string | null;
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
  }
}

export default function ProviderModal({ isOpen, onClose, provider }: ProviderModalProps) {
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
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-xl bg-white p-6 shadow-xl transition-all">
                <div className="flex items-start justify-between">
                  <Dialog.Title className="text-lg font-medium text-gray-900">
                    {provider.serviceName || 'Unnamed Partner'}
                  </Dialog.Title>
                  <button
                    type="button"
                    className="ml-3 flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-4 space-y-4">
                  {(provider.address || provider.city || provider.stateProvince) && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Address</h4>
                      <p className="mt-1 text-sm text-gray-500">
                        {[
                          provider.address,
                          provider.city,
                          provider.stateProvince,
                          provider.zipPostalCode
                        ].filter(Boolean).join(', ') || 'Not provided'}
                      </p>
                    </div>
                  )}

                  {(provider.primaryContact1Name || provider.primaryContact1Designation) && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Primary Contact</h4>
                      <div className="mt-1 text-sm text-gray-500">
                        <p>{provider.primaryContact1Name || 'Not provided'}</p>
                        {provider.primaryContact1Designation && (
                          <p>{provider.primaryContact1Designation}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {(provider.contact2Name || provider.contact2Designation) && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Secondary Contact</h4>
                      <div className="mt-1 text-sm text-gray-500">
                        <p>{provider.contact2Name || 'Not provided'}</p>
                        {provider.contact2Designation && (
                          <p>{provider.contact2Designation}</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Contact Information</h4>
                    <div className="mt-1 space-y-1 text-sm text-gray-500">
                      {provider.primaryContactNumber && (
                        <p>Phone: {provider.primaryContactNumber}</p>
                      )}
                      {provider.alternateContactNumber && (
                        <p>Alt. Phone: {provider.alternateContactNumber}</p>
                      )}
                      {provider.primaryEmailId && (
                        <p>Email: {provider.primaryEmailId}</p>
                      )}
                      {provider.alternateEmailId && (
                        <p>Alt. Email: {provider.alternateEmailId}</p>
                      )}
                      {provider.websiteUrl && (
                        <p>
                          Website:{' '}
                          <a 
                            href={provider.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-500"
                          >
                            {provider.websiteUrl}
                          </a>
                        </p>
                      )}
                    </div>
                  </div>

                  {provider.features && provider.features.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Features</h4>
                      <ul className="mt-1 list-disc pl-5 text-sm text-gray-500">
                        {provider.features.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
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