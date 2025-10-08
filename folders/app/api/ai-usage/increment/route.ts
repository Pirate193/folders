import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';

export async function POST(request: NextRequest) {
  try {
    const { featureType } = await request.json();

    if (!featureType || !['flashcard_generation', 'chat'].includes(featureType)) {
      return NextResponse.json(
        { error: 'Invalid feature type' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Call the database function to increment usage
    const { data, error } = await supabase.rpc('increment_ai_usage', {
      p_user_id: user.id,
      p_feature_type: featureType,
    });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      count: data,
    });

  } catch (error) {
    console.error('AI usage increment error:', error);
    return NextResponse.json(
      { error: 'Failed to increment usage' },
      { status: 500 }
    );
  }
}
