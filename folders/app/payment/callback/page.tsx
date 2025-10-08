'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PaymentCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyPayment } = useSubscriptionStore();
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');

  useEffect(() => {
    const reference = searchParams.get('reference');

    if (!reference) {
      setStatus('failed');
      return;
    }

    const verify = async () => {
      const success = await verifyPayment(reference);
      setStatus(success ? 'success' : 'failed');
    };

    verify();
  }, [searchParams, verifyPayment]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {status === 'verifying' && (
          <>
            <Loader2 className="h-16 w-16 animate-spin mx-auto text-primary" />
            <h1 className="text-2xl font-bold">Verifying Payment...</h1>
            <p className="text-muted-foreground">
              Please wait while we confirm your payment
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="h-16 w-16 mx-auto text-green-500" />
            <h1 className="text-2xl font-bold">Payment Successful!</h1>
            <p className="text-muted-foreground">
              Welcome to Pro! You now have access to all premium features.
            </p>
            <Button asChild className="w-full">
              <Link href="/home">Go to Dashboard</Link>
            </Button>
          </>
        )}

        {status === 'failed' && (
          <>
            <XCircle className="h-16 w-16 mx-auto text-red-500" />
            <h1 className="text-2xl font-bold">Payment Failed</h1>
            <p className="text-muted-foreground">
              We couldn't verify your payment. Please try again or contact support.
            </p>
            <div className="flex gap-4">
              <Button asChild variant="outline" className="flex-1">
                <Link href="/home">Go Back</Link>
              </Button>
              <Button asChild className="flex-1">
                <Link href="/home">Try Again</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}