import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { sendSignedWebhook, logWebhookDelivery } from '@/utils/webhookService';

/**
 * Updates a facility's status in the database and triggers webhook if needed
 */
export async function updateFacilityStatus(
  facilityId: string, 
  newStatus: string, 
  previousStatus: string
) {
  try {
    console.log(`[FacilityService] Updating facility ${facilityId} status from ${previousStatus} to ${newStatus}`);
    
    const client = await clientPromise;
    const db = client.db('Cumma');
    
    // First, find the existing facility document
    const facility = await db.collection('Facilities').findOne({ 
      _id: new ObjectId(facilityId) 
    });
    
    if (!facility) {
      console.error(`[FacilityService] No facility found with ID ${facilityId}`);
      return { success: false, message: 'Facility not found' };
    }
    
    // Update status in the document
    facility.status = newStatus;
    facility.updatedAt = new Date();
    facility.processedAt = new Date();
    
    // Replace the entire document to avoid validation errors
    const result = await db.collection('Facilities').replaceOne(
      { _id: new ObjectId(facilityId) },
      facility
    );
    
    if (result.matchedCount === 0) {
      console.error(`[FacilityService] No facility found with ID ${facilityId}`);
      return { success: false, message: 'Facility not found' };
    }
    
    if (result.modifiedCount === 0) {
      console.log(`[FacilityService] Facility ${facilityId} status was already ${newStatus}`);
      return { success: true, message: 'No changes were necessary' };
    }
    
    console.log(`[FacilityService] Successfully updated facility status in database`);
    
    // After successful database update, check if we need to send a webhook
    if (newStatus.toLowerCase() === 'active' && previousStatus.toLowerCase() === 'pending') {
      console.log(`[FacilityService] Status changed from pending to approved, preparing webhook`);

      try {
        // Also create a notification in the database
        await createFacilityApprovalNotification(facilityId, facility);
      } catch (notificationError) {
        console.error(`[FacilityService] Error creating notification:`, notificationError);
        // Continue even if notification creation fails
      }
      
      // Fetch complete facility details for the webhook
      const facilityDetails = await fetchFacilityDetails(facilityId);
      
      // Prepare webhook payload
      const webhookPayload = {
        facilityId,
        status: newStatus,
        previousStatus,
        serviceProviderId: facilityDetails.serviceProviderId,
        facilityName: facilityDetails.name,
        facilityType: facilityDetails.facilityType
      };
      
      // Get webhook URL and secret from environment
      const webhookUrl = process.env.FACILITY_WEBHOOK_URL || 'https://your-main-app-url.com/api/webhooks/facility-status';
      const webhookSecret = process.env.WEBHOOK_SECRET;
      
      if (!webhookSecret) {
        console.error('[FacilityService] WEBHOOK_SECRET is not configured in environment variables');
        return { 
          success: true, 
          webhookSent: false, 
          message: 'Facility status updated but webhook not sent - missing secret' 
        };
      }
      
      // Send webhook
      const webhookSent = await sendSignedWebhook({
        url: webhookUrl,
        payload: webhookPayload,
        secret: webhookSecret
      });
      
      // Log webhook delivery attempt
      await logWebhookDelivery(
        'facility-status-change',
        webhookPayload,
        webhookSent,
        webhookSent ? null : 'Failed to send webhook'
      );
      
      return { 
        success: true, 
        webhookSent, 
        message: webhookSent 
          ? 'Facility status updated and notification sent' 
          : 'Facility status updated but failed to send notification'
      };
    }
    
    // If no webhook needed, just return success
    return { success: true, webhookSent: false, message: 'Facility status updated' };
  } catch (error) {
    console.error('[FacilityService] Error updating facility status:', error);
    return { success: false, message: 'Failed to update facility status', error };
  }
}

/**
 * Creates a notification for facility approval
 */
async function createFacilityApprovalNotification(facilityId: string, facility: any) {
  try {
    const client = await clientPromise;
    const db = client.db('Cumma');
    
    // Create notification in database based on the schema
    const notification = {
      userId: facility.serviceProviderId?.toString() || 'unknown',
      type: 'facility-approved',
      title: 'Facility Approved',
      message: `Your facility "${facility.details?.name || 'Unknown'}" has been approved.`,
      relatedId: facilityId,
      relatedType: 'facility',
      isRead: false,
      createdAt: new Date(),
      metadata: {
        facilityName: facility.details?.name || 'Unknown Facility',
        facilityType: facility.facilityType || 'unknown'
      }
    };
    
    console.log(`[FacilityService] Creating notification:`, notification);
    
    await db.collection('notifications').insertOne(notification);
    console.log(`[FacilityService] Notification created successfully`);
  } catch (error) {
    console.error(`[FacilityService] Error creating notification:`, error);
    throw error;
  }
}

/**
 * Fetches detailed facility information needed for the webhook
 */
async function fetchFacilityDetails(facilityId: string) {
  try {
    console.log(`[FacilityService] Fetching details for facility ${facilityId}`);
    const client = await clientPromise;
    const db = client.db('Cumma');
    
    const facility = await db.collection('Facilities').findOne({ 
      _id: new ObjectId(facilityId) 
    });
    
    if (!facility) {
      throw new Error(`Facility not found with ID ${facilityId}`);
    }
    
    return {
      serviceProviderId: facility.serviceProviderId,
      name: facility.details?.name || 'Unknown Facility',
      facilityType: facility.facilityType || 'unknown'
    };
  } catch (error) {
    console.error('[FacilityService] Error fetching facility details:', error);
    throw error;
  }
} 