import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';
import crypto from 'crypto';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    // Verify webhook signature
    const hash = crypto
      .createHmac('sha512', PAYSTACK_SECRET_KEY)
      .update(body)
      .digest('hex');

    if (hash !== signature) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event = JSON.parse(body);
    const supabase = createClient();

    // Handle different webhook events
    switch (event.event) {
      case 'charge.success':
        // Payment successful - already handled in verify endpoint
        console.log('Payment successful:', event.data.reference);
        break;

      case 'subscription.create':
        // Subscription created
        console.log('Subscription created:', event.data);
        break;

      case 'subscription.disable':
        // Subscription disabled
        const { data: sub } = await (await supabase)
          .from('subscriptions')
          .select('user_id')
          .eq('paystack_subscription_code', event.data.subscription_code)
          .single();

        if (sub) {
          await (await supabase)
            .from('subscriptions')
            .update({ status: 'cancelled', auto_renew: false })
            .eq('paystack_subscription_code', event.data.subscription_code);
        }
        break;

      case 'invoice.payment_failed':
        // Payment failed
        console.log('Payment failed:', event.data);
        break;

      default:
        console.log('Unhandled event:', event.event);
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}