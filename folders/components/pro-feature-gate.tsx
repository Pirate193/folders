'use client';

import React, { useState } from 'react';
import { useProFeature } from '@/hooks/use-pro-feature';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Lock, Sparkles } from 'lucide-react';
import PricingDialog from './pricing-dialog';

interface ProFeatureGateProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const ProFeatureGate = ({ feature, children, fallback }: ProFeatureGateProps) => {
  const { canUseFeature, isChecking } = useProFeature(feature);
  const [showPricing, setShowPricing] = useState(false);

  if (isChecking) {
    return null; // or a loading skeleton
  }

  if (!canUseFeature) {
    return (
      <>
        {fallback || (
          <Alert className="border-primary/50 bg-primary/5">
            <Lock className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>This is a Pro feature. Upgrade to unlock!</span>
              <Button
                size="sm"
                onClick={() => setShowPricing(true)}
                className="ml-4"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Upgrade to Pro
              </Button>
            </AlertDescription>
          </Alert>
        )}
        <PricingDialog open={showPricing} onOpenChange={setShowPricing} />
      </>
    );
  }

  return <>{children}</>;
};

export default ProFeatureGate;