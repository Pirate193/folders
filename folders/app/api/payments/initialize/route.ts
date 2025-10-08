import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const MONTHLY_PRICE = parseInt(process.env.NEXT_PUBLIC_PRO_MONTHLY_PRICE || '300');
const YEARLY_PRICE = parseInt(process.env.NEXT_PUBLIC_PRO_YEARLY_PRICE || '3000');

export async function POST(request: NextRequest) {
  try {
    const { plan } = await request.json();

    if (!plan || !['monthly', 'yearly'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
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

    // Get user profile
    const { data: profile } = await (await supabase)
      .from('profiles')
      .select('email, username')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    const amount = plan === 'monthly' ? MONTHLY_PRICE : YEARLY_PRICE;
    const reference = `PAY_${user.id}_${Date.now()}`;

    // Initialize Paystack transaction
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: profile.email,
        amount: amount*100, 
        reference: reference,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/callback`,
        metadata: {
          user_id: user.id,
          plan: plan,
          username: profile.username,
        },
      }),
    });

    const paystackData = await paystackResponse.json();

    if (!paystackData.status) {
      throw new Error(paystackData.message || 'Failed to initialize payment');
    }

    // Save transaction to database
    await (await supabase).from('payment_transactions').insert({
      user_id: user.id,
      amount: amount,
      currency: 'USD',
      status: 'pending',
      paystack_reference: reference,
      paystack_access_code: paystackData.data.access_code,
      metadata: { plan },
    });

    return NextResponse.json({
      authorization_url: paystackData.data.authorization_url,
      access_code: paystackData.data.access_code,
      reference: reference,
    });

  } catch (error) {
    console.error('Payment initialization error:', error);
    return NextResponse.json(
      { error:  'Failed to initialize payment' },
      { status: 500 }
    );
  }
}