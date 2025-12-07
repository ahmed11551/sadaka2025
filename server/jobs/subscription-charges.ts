// Cron job for processing recurring subscription charges
// Run this daily to charge active subscriptions

import { SubscriptionService } from '../services/subscription.service';

export async function processSubscriptionCharges() {
  console.log('[SubscriptionCharges] Starting subscription charge processing...');
  
  const subscriptionService = new SubscriptionService();
  
  try {
    const results = await subscriptionService.processDueSubscriptions();
    
    console.log('[SubscriptionCharges] Processing completed:', {
      total: results.total,
      succeeded: results.succeeded,
      failed: results.failed,
    });

    return results;
  } catch (error) {
    console.error('[SubscriptionCharges] Error processing subscriptions:', error);
    throw error;
  }
}

// For manual execution or cron scheduling
if (require.main === module) {
  processSubscriptionCharges()
    .then(() => {
      console.log('[SubscriptionCharges] Job completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('[SubscriptionCharges] Job failed:', error);
      process.exit(1);
    });
}

