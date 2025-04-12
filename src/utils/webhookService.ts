import crypto from 'crypto';

interface WebhookOptions {
  url: string;
  payload: any;
  secret: string;
  maxRetries?: number;
}

/**
 * Sends a signed webhook to the main application
 */
export async function sendSignedWebhook({
  url,
  payload,
  secret,
  maxRetries = 3
}: WebhookOptions): Promise<boolean> {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      // Convert payload to JSON string
      const payloadString = JSON.stringify(payload);
      
      // Generate timestamp
      const timestamp = Date.now().toString();
      
      // Create signature using HMAC-SHA256
      const signature = crypto
        .createHmac('sha256', secret)
        .update(timestamp + '.' + payloadString)
        .digest('hex');
      
      // Send the webhook
      console.log(`[Webhook] Sending webhook to ${url} (attempt ${retries + 1}/${maxRetries})`);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Timestamp': timestamp
        },
        body: payloadString
      });
      
      // Check if request was successful
      if (response.ok) {
        const responseData = await response.json();
        console.log('[Webhook] Delivered successfully:', responseData);
        return true;
      }
      
      // If not successful, log error and retry
      const errorText = await response.text();
      console.error(`[Webhook] Delivery failed (attempt ${retries + 1}):`, {
        status: response.status,
        error: errorText
      });
      
      // Increment retry counter
      retries++;
      
      // Wait before retrying with exponential backoff
      if (retries < maxRetries) {
        const backoffTime = 1000 * Math.pow(2, retries);
        console.log(`[Webhook] Retrying in ${backoffTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
      }
    } catch (error) {
      console.error(`[Webhook] Attempt ${retries + 1} failed with error:`, error);
      retries++;
      
      if (retries < maxRetries) {
        const backoffTime = 1000 * Math.pow(2, retries);
        console.log(`[Webhook] Retrying in ${backoffTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
      }
    }
  }
  
  console.error(`[Webhook] Failed to deliver webhook after ${maxRetries} attempts`);
  return false;
}

/**
 * Log webhook deliveries for debugging
 */
export async function logWebhookDelivery(type: string, payload: any, success: boolean, error?: any) {
  try {
    // Log to console for now
    console.log('[Webhook Log]', {
      type,
      payload,
      success,
      error: error ? String(error) : null,
      timestamp: new Date().toISOString()
    });
    
    // In the future, you could log to database as well
    // const client = await clientPromise;
    // const db = client.db('Cumma');
    // await db.collection('webhookLogs').insertOne({
    //   type,
    //   payload,
    //   success,
    //   error: error ? String(error) : null,
    //   timestamp: new Date()
    // });
  } catch (logError) {
    console.error('[Webhook] Failed to log webhook delivery:', logError);
  }
} 