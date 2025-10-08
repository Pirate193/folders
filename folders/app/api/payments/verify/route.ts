import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;

export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json();

    if (!reference) {
      return NextResponse.json(
        { error: 'Payment reference is required' },
        { status: 400 }
      );
    }

    const supabase = createClient();
    const { data: { user }, error: authError } = await (await supabase).auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify payment with Paystack
    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const paystackData = await paystackResponse.json();

    if (!paystackData.status || paystackData.data.status !== 'success') {
      // Update transaction as failed
      await (await supabase)
        .from('payment_transactions')
        .update({ status: 'failed' })
        .eq('paystack_reference', reference);

      return NextResponse.json(
        { error: 'Payment verification failed', success: false },
        { status: 400 }
      );
    }

    // First, get the existing transaction
    const { data: existingTransaction, error: fetchError } = await (await supabase)
      .from('payment_transactions')
      .select('*')
      .eq('paystack_reference', reference)
      .single();

    if (fetchError || !existingTransaction) {
      console.error('Transaction fetch error:', fetchError);
      throw new Error('Transaction not found in database');
    }

    // Payment successful - update transaction (without .single() to avoid error)
    const { error: updateError } = await (await supabase)
      .from('payment_transactions')
      .update({
        status: 'success',
        payment_method: paystackData.data.channel,
        updated_at: new Date().toISOString(),
      })
      .eq('paystack_reference', reference);

    if (updateError) {
      console.error('Transaction update error:', updateError);
      throw new Error('Failed to update transaction');
    }

    // Use the existing transaction data with updated status
    const transaction = {
      ...existingTransaction,
      status: 'success',
      payment_method: paystackData.data.channel,
    };

    // Calculate subscription dates
    const plan = transaction.metadata?.plan || 'monthly';
    const startDate = new Date();
    const endDate = new Date();
    
    if (plan === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    // Create or update subscription
    const { data: existingSubscription } = await (await supabase)
      .from('subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (existingSubscription) {
      // Update existing subscription
      await (await supabase)
        .from('subscriptions')
        .update({
          tier: 'pro',
          status: 'active',
          amount: transaction.amount,
          currency: transaction.currency,
          paystack_reference: reference,
          paystack_customer_code: paystackData.data.customer?.customer_code,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          auto_renew: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingSubscription.id);
    } else {
      // Create new subscription
      await (await supabase).from('subscriptions').insert({
        user_id: user.id,
        tier: 'pro',
        status: 'active',
        amount: transaction.amount,
        currency: transaction.currency,
        paystack_reference: reference,
        paystack_customer_code: paystackData.data.customer?.customer_code,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        auto_renew: true,
      });
    }

    // Update transaction with subscription_id
    await (await supabase)
      .from('payment_transactions')
      .update({ subscription_id: existingSubscription?.id })
      .eq('paystack_reference', reference);

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
    });

  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify payment', success: false },
      { status: 500 }
    );
  }
}