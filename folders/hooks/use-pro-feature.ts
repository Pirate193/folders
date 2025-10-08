'use client';

import { useEffect, useState } from 'react';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { useProfileStore } from '@/stores/profileStore';

export function useProFeature(featureName?: string) {
  const { subscription, fetchSubscription, isPro, canUseFeature } = useSubscriptionStore();
  const { currentProfile } = useProfileStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkSubscription = async () => {
      if (!subscription && currentProfile) {
        await fetchSubscription();
      }
      setIsChecking(false);
    };

    checkSubscription();
  }, [currentProfile, subscription, fetchSubscription]);

  const isProUser = isPro();
  const canUse = featureName ? canUseFeature(featureName) : isProUser;

  return {
    isPro: isProUser,
    canUseFeature: canUse,
    subscription,
    isChecking,
    subscriptionTier: currentProfile?.subscription_tier || 'free',
    subscriptionStatus: currentProfile?.subscription_status || 'inactive',
  };
}