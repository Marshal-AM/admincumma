import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/mongodb'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const providerId = params.id;

    // Validate MongoDB ObjectId
    if (!ObjectId.isValid(providerId)) {
      return NextResponse.json(
        { error: 'Invalid service provider ID format' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('Cumma');
    
    // First, get the service provider to get its userId
    const serviceProvider = await db
      .collection('Service Provider')
      .findOne({ _id: new ObjectId(providerId) });
      
    if (!serviceProvider) {
      return NextResponse.json(
        { error: 'Service provider not found' },
        { status: 404 }
      );
    }
    
    // Find all facilities associated with this service provider's userId
    const facilities = await db
      .collection('Facilities')
      .find({ serviceProviderId: serviceProvider.userId })
      .sort({ updatedAt: -1 })
      .toArray();
      
    // Transform facility objects to match the format expected by the frontend
    const formattedFacilities = facilities.map(facility => {
      return {
        _id: facility._id,
        userId: facility.serviceProviderId,
        serviceProviderId: facility.serviceProviderId,
        facilityName: facility.details?.facilityName || facility.details?.name || 'Unnamed Facility',
        facilityType: facility.facilityType || 'Unknown',
        capacity: facility.details?.studioDetails?.capacity || 0,
        amenities: facility.details?.studioDetails?.suitableFor || [],
        price: {
          amount: facility.details?.rentalPlans?.[0]?.price || 0,
          currency: 'INR',
          unit: facility.details?.rentalPlans?.[0]?.duration || 'hour'
        },
        images: facility.details?.images || [],
        description: facility.details?.description || '',
        status: facility.status || 'unknown',
        createdAt: facility.createdAt,
        updatedAt: facility.updatedAt
      };
    });
    
    console.log(`Found ${facilities.length} facilities for provider ${providerId} with userId ${serviceProvider.userId}`);
    
    // Return formatted facilities
    return NextResponse.json(formattedFacilities);
    
  } catch (error) {
    console.error('Error fetching facilities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch facilities' },
      { status: 500 }
    );
  }
} 