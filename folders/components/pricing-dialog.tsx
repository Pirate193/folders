'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Check, Loader2, Sparkles, Zap } from 'lucide-react';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { toast } from 'sonner';
import { Badge } from './ui/badge';

interface PricingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PricingDialog = ({ open, onOpenChange }: PricingDialogProps) => {
  const { initializePayment, isLoading } = useSubscriptionStore();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');

  const handleUpgrade = async (plan: 'monthly' | 'yearly') => {
    setSelectedPlan(plan);
    const result = await initializePayment(plan);

    if (result) {
      // Redirect to Paystack payment page
      window.location.href = result.authorization_url;
    } else {
      toast.error('Failed to initialize payment. Please try again.');
    }
  };

  const monthlyPrice = parseInt(process.env.NEXT_PUBLIC_PRO_MONTHLY_PRICE || '300') / 129;
  const yearlyPrice = parseInt(process.env.NEXT_PUBLIC_PRO_YEARLY_PRICE || '3000') / 129.15;
  const yearlyMonthlyEquivalent = yearlyPrice / 12;
  const savings = ((monthlyPrice - yearlyMonthlyEquivalent) / monthlyPrice * 100).toFixed(0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[calc(100vh-2rem)] overflow-y-auto scrollbar-hidden ">
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-center gap-2">
            <div className="p-2 rounded-full bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-3xl font-bold">
            Upgrade to Pro
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Unlock unlimited AI features and supercharge your studying
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 py-8">
          {/* Monthly Plan */}
          <div className="relative border-2 rounded-xl p-6 hover:border-primary/50 transition-all hover:shadow-lg bg-card">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-1 text-muted-foreground">Monthly</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold">${monthlyPrice.toFixed(2)}</span>
                <span className="text-muted-foreground text-sm">/month</span>
              </div>
              <p className="text-xs text-muted-foreground">Perfect for trying out Pro</p>
            </div>

            <Button
              className="w-full mb-6 h-11"
              variant="outline"
              onClick={() => handleUpgrade('monthly')}
              disabled={isLoading}
            >
              {isLoading && selectedPlan === 'monthly' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Get Started'
              )}
            </Button>

            <ul className="space-y-3">
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-sm">Unlimited AI Flashcard Generation</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-sm">AI Chat Assistant</span>
            </div>
           
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-sm">Advanced Analytics</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-sm">Unlimited File Uploads</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-sm">Priority Support</span>
            </div>
            
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">Billed monthly</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">Cancel anytime</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">Flexible billing</span>
              </li>
              
            </ul>
          </div>

          {/* Yearly Plan */}
          <div className="relative border-2 border-primary rounded-xl p-6 bg-gradient-to-br from-primary/5 to-primary/10 shadow-lg">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
              <Zap className="h-3 w-3 mr-1" />
              Save {savings}% • Best Value
            </Badge>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-1">Yearly</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold">${yearlyPrice.toFixed(2)}</span>
                <span className="text-muted-foreground text-sm">/year</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Only ${yearlyMonthlyEquivalent.toFixed(2)}/month • Save ${(monthlyPrice * 12 - yearlyPrice).toFixed(2)}
              </p>
            </div>

            <Button
              className="w-full mb-6 h-11"
              onClick={() => handleUpgrade('yearly')}
              disabled={isLoading}
            >
              {isLoading && selectedPlan === 'yearly' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Get Pro Yearly
                </>
              )}
            </Button>

            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm font-medium">Billed annually</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm font-medium">Best value for money</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm font-medium">2 months free</span>
              </li>
            </ul>
          </div>
        </div>

       
      </DialogContent>
    </Dialog>
  );
};

export default PricingDialog;