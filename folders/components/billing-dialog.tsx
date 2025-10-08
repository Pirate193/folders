'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Loader2, CreditCard, Calendar, AlertCircle, CheckCircle2, Crown } from 'lucide-react';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { useProfileStore } from '@/stores/profileStore';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface BillingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BillingDialog = ({ open, onOpenChange }: BillingDialogProps) => {
  const { subscription, transactions, fetchSubscription, fetchTransactions, cancelSubscription, isLoading } = useSubscriptionStore();
  const { currentProfile } = useProfileStore();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (open) {
      fetchSubscription();
      fetchTransactions();
    }
  }, [open, fetchSubscription, fetchTransactions]);

  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    try {
      await cancelSubscription();
      toast.success('Subscription cancelled successfully');
      setShowCancelDialog(false);
    } catch (error) {
      toast.error('Failed to cancel subscription');
    } finally {
      setIsCancelling(false);
    }
  };

  const isPro = currentProfile?.subscription_tier === 'pro' && currentProfile?.subscription_status === 'active';

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[calc(100vh-2rem)] overflow-y-auto scrollbar-hidden ">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Billing & Subscription
            </DialogTitle>
            <DialogDescription>
              Manage your subscription and view payment history
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Current Plan */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  {isPro ? (
                    <>
                      <Crown className="h-5 w-5 text-yellow-500" />
                      Pro Plan
                    </>
                  ) : (
                    'Free Plan'
                  )}
                </CardTitle>
                <CardDescription>
                  {isPro ? 'You have access to all premium features' : 'Upgrade to unlock unlimited AI features'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isPro && subscription ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Amount</span>
                      <span className="font-medium">${subscription.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Billing Cycle</span>
                      <span className="font-medium">
                        {subscription.amount === 3 ? 'Monthly' : 'Yearly'}
                      </span>
                    </div>
                    {subscription.end_date && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Next Billing Date</span>
                        <span className="font-medium flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(subscription.end_date), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    )}
                    {subscription.auto_renew && (
                      <div className="pt-4 border-t">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setShowCancelDialog(true)}
                          disabled={isLoading}
                        >
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Cancel Subscription
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      You're currently on the free plan
                    </p>
                    <Button className="w-full" onClick={() => onOpenChange(false)}>
                      Upgrade to Pro
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment History */}
            {transactions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Payment History</CardTitle>
                  <CardDescription>Your recent transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {transactions.slice(0, 5).map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">${transaction.amount.toFixed(2)}</span>
                            <Badge
                              variant={
                                transaction.status === 'success'
                                  ? 'default'
                                  : transaction.status === 'pending'
                                  ? 'secondary'
                                  : 'destructive'
                              }
                            >
                              {transaction.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(transaction.created_at), 'MMM dd, yyyy • hh:mm a')}
                          </p>
                        </div>
                        {transaction.payment_method && (
                          <span className="text-xs text-muted-foreground capitalize">
                            {transaction.payment_method}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pro Features Reminder */}
            {!isPro && (
              <Card className="border-primary/50 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Crown className="h-5 w-5 text-primary" />
                    Unlock Pro Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      Unlimited AI Flashcard Generation
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      Unlimited AI Chat Assistant
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      Priority Support
                    </li>
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your Pro subscription? You'll lose access to all premium features at the end of your billing period.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Keep Subscription</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSubscription}
              disabled={isCancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Cancel Subscription'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BillingDialog;
