import { createClient } from '@/lib/supabase/server';

export async function handlePayPalWebhook(
  body: Record<string, any>
): Promise<{ received: boolean; error?: string }> {
  const supabase = await createClient();

  switch (body.event_type) {
    case 'PAYMENT.CAPTURE.COMPLETED': {
      const capture = body.resource;
      const orderId = capture?.supplementary_data?.related_ids?.order_id;

      if (orderId) {
        await supabase
          .from('orders')
          .update({ status: 'confirmed' })
          .eq('paypal_payment_id', orderId);
      }
      break;
    }
    case 'PAYMENT.CAPTURE.REFUNDED': {
      const refund = body.resource;
      const orderId = refund?.supplementary_data?.related_ids?.order_id;
      if (orderId) {
        await supabase
          .from('orders')
          .update({ status: 'refunded' })
          .eq('paypal_payment_id', orderId);
      }
      break;
    }
  }

  return { received: true };
}
