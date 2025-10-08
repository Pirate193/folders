'use client';

import React from 'react';
import { Badge } from './ui/badge';
import { Sparkles, MessageSquare } from 'lucide-react';
import { useAIUsageStore } from '@/stores/aiUsageStore';
import { useProFeature } from '@/hooks/use-pro-feature';

interface AIUsageBadgeProps {
  featureType: 'flashcard_generation' | 'chat';
}

const AIUsageBadge = ({ featureType }: AIUsageBadgeProps) => {
  const { usage } = useAIUsageStore();
  const { isPro } = useProFeature();

  const limits = {
    flashcard_generation: 5,
    chat: 10,
  };

  const icons = {
    flashcard_generation: Sparkles,
    chat: MessageSquare,
  };

  const labels = {
    flashcard_generation: 'AI Flashcards',
    chat: 'AI Chat',
  };

  const Icon = icons[featureType];
  const label = labels[featureType];
  const limit = limits[featureType];
  const used = usage[featureType];
  const remaining = isPro ? Infinity : Math.max(0, limit - used);

  if (isPro) {
    return (
      <Badge variant="secondary" className="gap-1">
        <Icon className="h-3 w-3" />
        {label}: Unlimited
      </Badge>
    );
  }

  const isLow = remaining <= 2 && remaining > 0;
  const isExhausted = remaining === 0;

  return (
    <Badge 
      variant={isExhausted ? "destructive" : isLow ? "outline" : "secondary"}
      className="gap-1"
    >
      <Icon className="h-3 w-3" />
      {label}: {used}/{limit}
    </Badge>
  );
};

export default AIUsageBadge;
