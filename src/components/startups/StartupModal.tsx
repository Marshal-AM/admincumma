'use client'

import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { X } from 'lucide-react'

interface StartupModalProps {
  isOpen: boolean
  onClose: () => void
  startup: {
    startupName: string | null
    contactName: string | null
    contactNumber: string | null
    founderName: string | null
    founderDesignation: string | null
    entityType: string | null
    teamSize: number | null
    dpiitNumber: string | null
    industry: string | null
    sector: string | null
    stagecompleted: string | null
    startupMailId: string | null
    website: string | null
    linkedinStartupUrl: string | null
    linkedinFounderUrl: string | null
    lookingFor: string[]
    address: string | null
  }
}

export default function StartupModal({ isOpen, onClose, startup }: StartupModalProps) {
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
                    {startup.startupName || 'Unnamed Startup'}
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
                  {(startup.contactName || startup.contactNumber || startup.startupMailId || startup.address) && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Contact Details</h4>
                      <div className="mt-1 text-sm text-gray-500">
                        {startup.contactName && <p>Contact Person: {startup.contactName}</p>}
                        {startup.contactNumber && <p>Contact Number: {startup.contactNumber}</p>}
                        {startup.startupMailId && <p>Email: {startup.startupMailId}</p>}
                        {startup.address && <p>Address: {startup.address}</p>}
                      </div>
                    </div>
                  )}

                  {(startup.founderName || startup.founderDesignation || startup.linkedinFounderUrl) && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Founder Information</h4>
                      <div className="mt-1 text-sm text-gray-500">
                        {startup.founderName && <p>Name: {startup.founderName}</p>}
                        {startup.founderDesignation && <p>Designation: {startup.founderDesignation}</p>}
                        {startup.linkedinFounderUrl && (
                          <p>
                            <a 
                              href={startup.linkedinFounderUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-500"
                            >
                              LinkedIn Profile
                            </a>
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {(startup.entityType || startup.teamSize !== null || startup.dpiitNumber || 
                    startup.industry || startup.sector || startup.stagecompleted) && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Company Information</h4>
                      <div className="mt-1 text-sm text-gray-500">
                        {startup.entityType && <p>Entity Type: {startup.entityType}</p>}
                        {startup.teamSize !== null && <p>Team Size: {startup.teamSize} members</p>}
                        {startup.dpiitNumber && <p>DPIIT Number: {startup.dpiitNumber}</p>}
                        {startup.industry && <p>Industry: {startup.industry}</p>}
                        {startup.sector && <p>Sector: {startup.sector}</p>}
                        {startup.stagecompleted && <p>Stage: {startup.stagecompleted}</p>}
                      </div>
                    </div>
                  )}

                  {(startup.website || startup.linkedinStartupUrl) && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Links</h4>
                      <div className="mt-1 space-y-1 text-sm">
                        {startup.website && (
                          <p>
                            <a 
                              href={startup.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-500"
                            >
                              Website
                            </a>
                          </p>
                        )}
                        {startup.linkedinStartupUrl && (
                          <p>
                            <a 
                              href={startup.linkedinStartupUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-500"
                            >
                              Company LinkedIn
                            </a>
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {startup.lookingFor && startup.lookingFor.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Looking For</h4>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {startup.lookingFor.map((item, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
                          >
                            {item}
                          </span>
                        ))}
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