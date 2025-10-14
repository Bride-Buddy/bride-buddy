// Test Mode Configuration
// Set TEST_MODE to 0 for production, or 1/2/3 for different test scenarios
//
// TEST_MODE = 0 (Production): Full email verification, 7-day trial, Stripe checkout
// TEST_MODE = 1: No email verification, 30-second trial, instant VIP upgrade (no Stripe)
// TEST_MODE = 2: No email verification, 30-minute trial, Stripe checkout at trial end
// TEST_MODE = 3: Full email verification, complete onboarding flow, production-ready testing

type TestModeValue = 0 | 1 | 2 | 3;
export const TEST_MODE: TestModeValue = 1; // Change to 0 for production, 1/2/3 for testing

// Test mode settings
export const TEST_MODE_CONFIG = {
  mode1: {
    skipEmailVerification: false, // CHANGED: Show email verification step
    useMockEmailVerification: true, // NEW: Mock verification (instant)
    skipDatabaseCreation: true,
    landingPage: "auth",
    autoRedirectToOnboarding: false, // CHANGED: Don't auto-redirect from auth
    requireEmailVerificationFirst: true, // NEW: Force email verification flow
    showAuthRedirect: true, // Show AuthRedirect.tsx after verification
    trialDurationSeconds: 30,
    showTierSelectionModal: true,
    instantVIPUpgrade: false,
    hasBasicTier: true,
    showStripeCheckout: false,
    allowBothTierSelection: true,
  },

  mode2: {
    skipEmailVerification: false, // Show mock email verification
    useMockEmailVerification: true, // Mock/instant verification
    skipDatabaseCreation: true, // No real profile (always new user)
    alwaysNewUser: true, // Always treat as new user
    landingPage: "auth",
    showAuthRedirect: true, // MATCHED: AuthRedirect.tsx
    autoRedirectToOnboarding: false, // Don't skip verification steps
    requireEmailVerificationFirst: true, // Force email verification flow
    redirectToOnboardingChat: true, // MATCHED: OnboardingChat.tsx
    trialDurationMinutes: 5, // CHANGED: 5 minutes (not 30)
    autoRedirectToModalAfterTrial: true, // NEW: Auto-redirect to Modal when trial expires
    redirectToDashboard: true, // Dashboard.tsx
    showPricingModalsAfterTrial: true, // Modal.tsx appears after 5 min trial
    instantVIPUpgrade: false,
    hasBasicTier: true,
    showStripeCheckout: true, // Stripe for VIP
    showBasicDowngrade: true, // Basic option available
    allowBothTierSelection: true,
  },

  mode3: {
    skipEmailVerification: false, // CHANGED: Real email verification
    useMockEmailVerification: false, // NEW: Send real email with magic link
    skipDatabaseCreation: false, // CHANGED: Create real user profile in DB
    alwaysNewUser: false, // Check if user exists
    landingPage: "auth",
    showAuthRedirect: true, // MATCHED: AuthRedirect.tsx (magic link destination)
    autoRedirectToOnboarding: false, // Proper flow through verification
    requireEmailVerificationFirst: true, // Must verify email first
    redirectToOnboardingChat: true, // MATCHED: OnboardingChat.tsx
    createUserProfileAfterOnboarding: true, // NEW: Create DB profile after onboarding
    trialDurationMinutes: 5, // 5 minute free trial
    autoRedirectToModalAfterTrial: true, // Auto-redirect to Modal when trial expires
    redirectToDashboard: true, // MATCHED: Dashboard.tsx
    autoPopulateUserInfo: true, // NEW: Auto-populate user data in dashboard
    showPricingModalsAfterTrial: true, // Modal.tsx after 5 min
    instantVIPUpgrade: false,
    hasBasicTier: true,
    showStripeCheckout: true, // Stripe for VIP selection
    showBasicFreeTier: true, // NEW: Basic is free tier (not downgrade)
    allowBothTierSelection: true,
  },

  // Production Mode
  production: {
    skipEmailVerification: false,
    landingPage: "auth",
    trialDurationDays: 7,
    instantVIPUpgrade: false,
    hasBasicTier: true,
    showStripeCheckout: true,
  },
};

// Get current mode configuration
export const getCurrentModeConfig = () => {
  switch (TEST_MODE as TestModeValue) {
    case 1:
      return TEST_MODE_CONFIG.mode1;
    case 2:
      return TEST_MODE_CONFIG.mode2;
    case 3:
      return TEST_MODE_CONFIG.mode3;
    case 0:
    default:
      return TEST_MODE_CONFIG.production;
  }
};

// Show test mode indicator
export const showTestModeIndicator = TEST_MODE > 0;

// Helper to get trial end date
export const getTrialEndDate = (startDate: Date): Date => {
  const endDate = new Date(startDate);
  const config = getCurrentModeConfig();

  if ("trialDurationSeconds" in config) {
    // Test Mode 1: 30 seconds
    endDate.setSeconds(endDate.getSeconds() + config.trialDurationSeconds);
  } else if ("trialDurationMinutes" in config) {
    // Test Modes 2 & 3: 30 minutes
    endDate.setMinutes(endDate.getMinutes() + config.trialDurationMinutes);
  } else if ("trialDurationDays" in config) {
    // Production: 7 days
    endDate.setDate(endDate.getDate() + config.trialDurationDays);
  }

  return endDate;
};

// Helper to check if trial is expired
export const isTrialExpired = (trialStartDate: string): boolean => {
  const startDate = new Date(trialStartDate);
  const endDate = getTrialEndDate(startDate);
  return new Date() > endDate;
};

// Helper to get days/minutes/seconds remaining in trial
export const getDaysRemainingInTrial = (trialStartDate: string): number => {
  const startDate = new Date(trialStartDate);
  const endDate = getTrialEndDate(startDate);
  const diffTime = endDate.getTime() - new Date().getTime();
  const config = getCurrentModeConfig();

  if ("trialDurationSeconds" in config) {
    // Test Mode 1: Return seconds remaining
    return Math.max(Math.ceil(diffTime / 1000), 0);
  } else if ("trialDurationMinutes" in config) {
    // Test Modes 2 & 3: Return minutes remaining
    return Math.max(Math.ceil(diffTime / (1000 * 60)), 0);
  } else {
    // Production: Return days remaining
    return Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 0);
  }
};

// Helper to get unit label for trial duration
export const getTrialUnitLabel = (): string => {
  const config = getCurrentModeConfig();

  if ("trialDurationSeconds" in config) {
    return "second";
  } else if ("trialDurationMinutes" in config) {
    return "minute";
  } else {
    return "day";
  }
};
