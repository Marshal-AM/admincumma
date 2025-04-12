import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/mongodb'

interface Params {
  params: {
    id: string
  }
}

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
  isFeatured: boolean;
  features: string[];
}

export async function GET(request: Request, { params }: Params) {
  const facilityId = params.id;

  // Validate MongoDB ObjectId
  if (!ObjectId.isValid(facilityId)) {
    return NextResponse.json(
      { error: 'Invalid facility ID format' },
      { status: 400 }
    );
  }

  try {
    const client = await clientPromise;
    const db = client.db('Cumma');
    
    console.log('Fetching facility with ID:', facilityId);
    
    // Find the facility by ID
    const facility = await db
      .collection('Facilities')
      .findOne({ _id: new ObjectId(facilityId) });
    
    if (!facility) {
      console.log('No facility found with ID:', facilityId);
      return NextResponse.json(
        { error: 'Facility not found' },
        { status: 404 }
      );
    }
    
    console.log('Original facility structure:', JSON.stringify(facility, null, 2).substring(0, 500) + '...');
    
    // Transform the facility document into the format expected by the edit page
    const formattedFacility = {
      _id: facility._id,
      serviceProviderId: facility.serviceProviderId,
      facilityType: facility.facilityType || '',
      status: facility.status || '',
      name: facility.details?.name || facility.details?.studioDetails?.facilityName || 'Unnamed Facility',
      description: facility.details?.description || facility.details?.studioDetails?.description || '',
      images: facility.details?.images || [],
      videoLink: facility.details?.videoLink || '',
      rentalPlans: facility.details?.rentalPlans || [],
      subscriptionPlans: facility.details?.subscriptionPlans || [],
      rentPerYear: facility.details?.rentPerYear || 0,
      rentPerMonth: facility.details?.rentPerMonth || 0,
      rentPerWeek: facility.details?.rentPerWeek || 0,
      dayPassRent: facility.details?.dayPassRent || 0,
      address: facility.address || '',
      city: facility.city || '',
      pincode: facility.pincode || '',
      state: facility.state || '',
      country: facility.country || '',
      timings: facility.timings || {
        monday: { isOpen: false },
        tuesday: { isOpen: false },
        wednesday: { isOpen: false },
        thursday: { isOpen: false },
        friday: { isOpen: false },
        saturday: { isOpen: false },
        sunday: { isOpen: false }
      },
      createdAt: facility.createdAt,
      updatedAt: facility.updatedAt,
      // Keep the original data structure for reference and update handling
      originalData: facility
    };
    
    console.log('Formatted facility summary:', {
      name: formattedFacility.name,
      facilityType: formattedFacility.facilityType,
      hasImages: formattedFacility.images.length > 0,
      hasRentalPlans: formattedFacility.rentalPlans.length > 0,
      hasTimings: !!formattedFacility.timings
    });
    
    // Return the formatted facility
    return NextResponse.json(formattedFacility);
    
  } catch (error) {
    console.error('Error fetching facility:', error);
    return NextResponse.json(
      { error: 'Failed to fetch facility' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: Params) {
  const facilityId = params.id;

  // Validate MongoDB ObjectId
  if (!ObjectId.isValid(facilityId)) {
    return NextResponse.json(
      { error: 'Invalid facility ID format' },
      { status: 400 }
    );
  }

  // Parse request body
  let updatedFacility: FacilityCommon;
  try {
    updatedFacility = await request.json();
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }

  try {
    const client = await clientPromise;
    const db = client.db('Cumma');
    
    // Find the facility first to make sure it exists
    const existingFacility = await db
      .collection('Facilities')
      .findOne({ _id: new ObjectId(facilityId) });
    
    if (!existingFacility) {
      return NextResponse.json(
        { error: 'Facility not found' },
        { status: 404 }
      );
    }
    
    console.log('Original facility to update:', existingFacility);
    console.log('Update data received:', updatedFacility);
    
    // Extract the fields that need to be updated, keeping the originalData for reference
    const { originalData, ...formData } = updatedFacility;
    
    // Create a copy of the existing details to update specific parts
    const details = {
      ...existingFacility.details,
      name: formData.name || existingFacility.details.name,
      description: formData.description || existingFacility.details.description,
      images: formData.images || existingFacility.details.images,
      videoLink: formData.videoLink || existingFacility.details.videoLink,
      rentalPlans: formData.rentalPlans || existingFacility.details.rentalPlans
    };
    
    // If the facility is a studio type, update the studioDetails if they exist
    if (existingFacility.facilityType === 'studio' && existingFacility.details.studioDetails) {
      details.studioDetails = {
        ...existingFacility.details.studioDetails,
        facilityName: formData.name || existingFacility.details.studioDetails.facilityName,
        description: formData.description || existingFacility.details.studioDetails.description
      };
    }
    
    // Create the update operations, only updating specific fields from the form
    const updateOperations = {
      $set: {
        // Only update specified fields
        address: formData.address || existingFacility.address,
        city: formData.city || existingFacility.city,
        pincode: formData.pincode || existingFacility.pincode,
        state: formData.state || existingFacility.state,
        country: formData.country || existingFacility.country,
        details: details,
        // Make sure to preserve the isFeatured field which is required by the schema
        isFeatured: existingFacility.isFeatured !== undefined ? existingFacility.isFeatured : false,
        // Preserve features array if it exists
        features: existingFacility.features || [],
        updatedAt: new Date()
      }
    };
    
    console.log('Update operations:', JSON.stringify(updateOperations, null, 2));
    
    // Instead of using updateOne with $set, let's use the same approach as in status updates:
    // Create a modified copy of the existing facility with the updated fields
    const updatedDocument = {
      ...existingFacility,
      address: formData.address || existingFacility.address,
      city: formData.city || existingFacility.city,
      pincode: formData.pincode || existingFacility.pincode,
      state: formData.state || existingFacility.state,
      country: formData.country || existingFacility.country,
      details: details,
      updatedAt: new Date()
    };
    
    console.log('Updated document:', JSON.stringify(updatedDocument, null, 2).substring(0, 500) + '...');
    
    // Replace the entire document to avoid validation errors
    const result = await db
      .collection('Facilities')
      .replaceOne(
        { _id: new ObjectId(facilityId) },
        updatedDocument
      );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Facility not found' },
        { status: 404 }
      );
    }
    
    console.log('Update result:', result);
    
    // Return the updated facility
    const updatedFacilityDoc = await db
      .collection('Facilities')
      .findOne({ _id: new ObjectId(facilityId) });
    
    if (!updatedFacilityDoc) {
      return NextResponse.json(
        { error: 'Could not retrieve updated facility' },
        { status: 500 }
      );
    }
    
    // Format the response
    const formattedResponse = {
      _id: updatedFacilityDoc._id,
      serviceProviderId: updatedFacilityDoc.serviceProviderId,
      facilityType: updatedFacilityDoc.facilityType || '',
      status: updatedFacilityDoc.status || '',
      name: updatedFacilityDoc.details?.name || updatedFacilityDoc.details?.studioDetails?.facilityName || 'Unnamed Facility',
      description: updatedFacilityDoc.details?.description || updatedFacilityDoc.details?.studioDetails?.description || '',
      images: updatedFacilityDoc.details?.images || [],
      videoLink: updatedFacilityDoc.details?.videoLink || '',
      rentalPlans: updatedFacilityDoc.details?.rentalPlans || [],
      subscriptionPlans: updatedFacilityDoc.details?.subscriptionPlans || [],
      rentPerYear: updatedFacilityDoc.details?.rentPerYear || 0,
      rentPerMonth: updatedFacilityDoc.details?.rentPerMonth || 0,
      rentPerWeek: updatedFacilityDoc.details?.rentPerWeek || 0,
      dayPassRent: updatedFacilityDoc.details?.dayPassRent || 0,
      address: updatedFacilityDoc.address || '',
      city: updatedFacilityDoc.city || '',
      pincode: updatedFacilityDoc.pincode || '',
      state: updatedFacilityDoc.state || '',
      country: updatedFacilityDoc.country || '',
      timings: updatedFacilityDoc.timings || {},
      createdAt: updatedFacilityDoc.createdAt,
      updatedAt: updatedFacilityDoc.updatedAt,
      originalData: updatedFacilityDoc
    };
    
    return NextResponse.json(formattedResponse);
    
  } catch (error) {
    console.error('Error updating facility:', error);
    return NextResponse.json(
      { error: 'Failed to update facility' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const facilityId = params.id;

  // Validate MongoDB ObjectId
  if (!ObjectId.isValid(facilityId)) {
    return NextResponse.json(
      { error: 'Invalid facility ID format' },
      { status: 400 }
    );
  }

  try {
    const client = await clientPromise;
    const db = client.db('Cumma');
    
    // Delete the facility
    const result = await db
      .collection('Facilities')
      .deleteOne({ _id: new ObjectId(facilityId) });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Facility not found' },
        { status: 404 }
      );
    }
    
    // Return success message
    return NextResponse.json({ success: true, message: 'Facility deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting facility:', error);
    return NextResponse.json(
      { error: 'Failed to delete facility' },
      { status: 500 }
    );
  }
} 