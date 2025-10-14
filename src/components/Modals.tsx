import React from "react";

interface TrialExpirationModalProps {
  daysRemaining: number;
  trialEndDate: string;
  onUpgradeClick: () => void;
  onBasicClick: () => void;
  onClose: () => void;
}

export const TrialExpirationModal: React.FC<TrialExpirationModalProps> = ({
  daysRemaining,
  trialEndDate,
  onUpgradeClick,
  onBasicClick,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">⏰</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your VIP Trial is Ending</h2>
          <p className="text-gray-600">
            Your trial ends in{" "}
            <span className="font-bold text-purple-400">
              {daysRemaining} day{daysRemaining !== 1 ? "s" : ""}
            </span>
          </p>
        </div>

        <div className="bg-purple-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-700 text-center">
            <span className="font-semibold">Upgrade now to keep the progress going!</span>
          </p>
          <p className="text-sm text-gray-600 text-center mt-2">
            Not interested? Downgrade to Basic Chat to continue access to wedding planning chatbot.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={onUpgradeClick}
            className="w-full bg-gradient-to-r from-purple-400 to-blue-400 text-white py-5 px-6 rounded-xl font-bold hover:shadow-lg transition-all text-left"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-lg mb-1">Upgrade to Bride Buddy VIP</div>
                <div className="text-sm font-normal opacity-90">Unlimited chat • Dashboard • Finance tracker</div>
              </div>
              <div className="text-xl">💎</div>
            </div>
          </button>

          <button
            onClick={onBasicClick}
            className="w-full bg-gray-100 text-gray-700 py-5 px-6 rounded-xl font-bold hover:bg-gray-200 transition-all text-left border-2 border-gray-200"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-lg mb-1">Bride Buddy Basic</div>
                <div className="text-sm font-normal text-gray-600">20 messages/day</div>
              </div>
              <div className="text-xl">💬</div>
            </div>
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center mt-4">
          Your account will downgrade automatically on {trialEndDate} at 00:00
        </p>
      </div>
    </div>
  );
};

interface PricingModalProps {
  isEarlyBird?: boolean;
  onMonthlySelect: () => void;
  onUntilIDoSelect: () => void;
  onClose: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isEarlyBird = true,
  onMonthlySelect,
  onUntilIDoSelect,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl">
          ✕
        </button>

        <div className="text-center mb-6">
          <div className="text-5xl mb-4">💎</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Choose Your Plan</h2>
          <p className="text-gray-600 text-sm">Unlock your complete wedding planning assistant</p>
        </div>

        {isEarlyBird && (
          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-3 mb-6 text-center">
            <p className="text-sm font-bold text-orange-700">🎉 Early Adopters Special - First 100 Customers Only!</p>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={onUntilIDoSelect}
            className="w-full bg-gradient-to-r from-purple-400 to-blue-400 text-white py-6 px-6 rounded-xl hover:shadow-lg transition-all text-left border-4 border-purple-300"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="text-xl font-bold">"Until I Do" Plan</div>
              <div className="text-sm bg-white bg-opacity-20 px-3 py-1 rounded-full font-semibold">BEST VALUE</div>
            </div>
            <div className="text-3xl font-bold mb-2">
              {isEarlyBird ? (
                <>
                  <span className="line-through text-white text-opacity-60 text-xl mr-2">$299</span>
                  $249
                </>
              ) : (
                "$299"
              )}
            </div>
            <div className="text-sm opacity-90">One-time payment • Access until your wedding day</div>
          </button>

          <button
            onClick={onMonthlySelect}
            className="w-full bg-white text-gray-700 py-6 px-6 rounded-xl hover:shadow-lg transition-all text-left border-2 border-gray-200"
          >
            <div className="text-xl font-bold mb-2">Monthly Plan</div>
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {isEarlyBird ? (
                <>
                  <span className="line-through text-gray-400 text-xl mr-2">$29.99</span>
                  $19.99
                </>
              ) : (
                "$29.99"
              )}
              <span className="text-base font-normal text-gray-600">/month</span>
            </div>
            <div className="text-sm text-gray-600">Billed monthly • Cancel anytime</div>
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center mt-6">
          All plans include: Unlimited chat • Dashboard • Budget tracker • Timeline • Task manager
        </p>
      </div>
    </div>
  );
};
