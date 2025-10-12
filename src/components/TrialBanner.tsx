import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Sparkles, Crown, Calendar } from "lucide-react";

interface TrialBannerProps {
  trialStartDate: string | null;
  subscriptionTier: string;
  onUpgrade?: () => void;
}

export const TrialBanner = ({ trialStartDate, subscriptionTier, onUpgrade }: TrialBannerProps) => {
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [isLastDay, setIsLastDay] = useState(false);

  useEffect(() => {
    if (!trialStartDate || subscriptionTier !== 'trial') return;

    const start = new Date(trialStartDate);
    const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days later
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    setDaysLeft(diffDays);
    setIsLastDay(diffDays === 1);
  }, [trialStartDate, subscriptionTier]);

  if (subscriptionTier === 'vip') {
    return (
      <Card className="p-4 mb-4 bg-gradient-to-r from-amber-50 to-pink-50 border-amber-200">
        <div className="flex items-center gap-3">
          <Crown className="w-5 h-5 text-amber-500" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">VIP Access ✨</p>
            <p className="text-xs text-muted-foreground">You have unlimited access to all features!</p>
          </div>
        </div>
      </Card>
    );
  }

  if (subscriptionTier === 'trial' && daysLeft !== null) {
    if (isLastDay) {
      return (
        <Card className="p-4 mb-4 bg-gradient-to-r from-rose-50 to-pink-50 border-rose-200 animate-pulse">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-rose-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Trial ends tomorrow - save your progress! 💖</p>
              <p className="text-xs text-muted-foreground">Upgrade to VIP to keep unlimited access</p>
            </div>
            {onUpgrade && (
              <Button onClick={onUpgrade} size="sm" className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">
                Upgrade ✨
              </Button>
            )}
          </div>
        </Card>
      );
    }

    return (
      <Card className="p-4 mb-4 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              Free Trial - {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left! 🎉
            </p>
            <p className="text-xs text-muted-foreground">Enjoying unlimited access to all VIP features</p>
          </div>
        </div>
      </Card>
    );
  }

  if (subscriptionTier === 'free') {
    return (
      <Card className="p-4 mb-4 bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200">
        <div className="flex items-center gap-3">
          <Crown className="w-5 h-5 text-gray-400" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Free Tier (20 messages/day) 💝</p>
            <p className="text-xs text-muted-foreground">Upgrade to continue unlimited support!</p>
          </div>
          {onUpgrade && (
            <Button onClick={onUpgrade} size="sm" variant="outline" className="border-pink-300 text-pink-600 hover:bg-pink-50">
              Upgrade ✨
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return null;
};
