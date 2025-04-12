'use client'

import { useState } from 'react'

export default function UpdateSchemaPage() {
  const [schemaStatus, setSchemaStatus] = useState<string | null>(null)
  const [documentsStatus, setDocumentsStatus] = useState<string | null>(null)
  const [isUpdatingSchema, setIsUpdatingSchema] = useState(false)
  const [isUpdatingDocuments, setIsUpdatingDocuments] = useState(false)

  const updateSchema = async () => {
    try {
      setIsUpdatingSchema(true)
      setSchemaStatus('Updating schema...')
      
      const response = await fetch('/api/startups/update-schema', {
        method: 'POST',
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setSchemaStatus(`Success: ${data.message}`)
      } else {
        setSchemaStatus(`Error: ${data.error}${data.details ? ` - ${data.details}` : ''}`)
      }
    } catch (error) {
      setSchemaStatus(`Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsUpdatingSchema(false)
    }
  }

  const updateDocuments = async () => {
    try {
      setIsUpdatingDocuments(true)
      setDocumentsStatus('Updating documents...')
      
      const response = await fetch('/api/startups/update-documents', {
        method: 'POST',
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setDocumentsStatus(`Success: ${data.message}`)
      } else {
        setDocumentsStatus(`Error: ${data.error}${data.details ? ` - ${data.details}` : ''}`)
      }
    } catch (error) {
      setDocumentsStatus(`Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsUpdatingDocuments(false)
    }
  }

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Update Startups Schema</h1>
        <p className="text-sm text-gray-500">Use this page to update the Startups collection schema and documents</p>
      </div>

      <div className="space-y-6">
        <div className="p-4 border rounded-lg bg-white shadow-sm">
          <h2 className="text-lg font-medium text-gray-800">Update Schema Validation</h2>
          <p className="mt-1 text-sm text-gray-500">
            This will update the schema validation for the Startups collection to match the new requirements.
          </p>
          <button
            onClick={updateSchema}
            disabled={isUpdatingSchema}
            className={`mt-4 px-4 py-2 rounded-md text-white ${
              isUpdatingSchema ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isUpdatingSchema ? 'Updating...' : 'Update Schema'}
          </button>
          {schemaStatus && (
            <div className={`mt-2 p-2 text-sm rounded ${
              schemaStatus.startsWith('Success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {schemaStatus}
            </div>
          )}
        </div>

        <div className="p-4 border rounded-lg bg-white shadow-sm">
          <h2 className="text-lg font-medium text-gray-800">Update Existing Documents</h2>
          <p className="mt-1 text-sm text-gray-500">
            This will update all existing startup documents to comply with the new schema validation.
          </p>
          <button
            onClick={updateDocuments}
            disabled={isUpdatingDocuments}
            className={`mt-4 px-4 py-2 rounded-md text-white ${
              isUpdatingDocuments ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isUpdatingDocuments ? 'Updating...' : 'Update Documents'}
          </button>
          {documentsStatus && (
            <div className={`mt-2 p-2 text-sm rounded ${
              documentsStatus.startsWith('Success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {documentsStatus}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 