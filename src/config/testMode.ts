// Test Mode Configuration
// Set TEST_MODE to 0 for production, or 1/2/3 for different test scenarios
//
// TEST_MODE = 0 (Production): Full email verification, 7-day trial, Stripe checkout
// TEST_MODE = 1: No email verification, 30-second trial, instant VIP upgrade (no Stripe)
// TEST_MODE = 2: No email verification, 30-minute trial, Stripe checkout at trial end
// TEST_MODE = 3: Full email verification, complete onboarding flow, production-ready testing
export const TEST_MODE = 2; // Change to 0 for production, 1/2/3 for testing

// Test mode settings
export const TEST_MODE_CONFIG = {
  // Test Mode 1: Quick testing (30 seconds, no email, instant VIP)
  mode1: {
    skipEmailVerification: true,
    landingPage: "chat",
    trialDurationSeconds: 30,
    instantVIPUpgrade: true,
    hasBasicTier: false,
    showStripeCheckout: false,
  },

  // Test Mode 2: Medium testing (30 minutes, no email, Stripe checkout)
  mode2: {
    skipEmailVerification: true,
    landingPage: "chat",
    trialDurationMinutes: 30,
    instantVIPUpgrade: false,
    hasBasicTier: true,
    showStripeCheckout: true,
  },

  // Test Mode 3: Full production testing (email verification, onboarding, Stripe)
  mode3: {
    skipEmailVerification: false,
    landingPage: "onboarding",
    trialDurationMinutes: 30,
    instantVIPUpgrade: false,
    hasBasicTier: true,
    showStripeCheckout: true,
  },

  // Production Mode
  production: {
    skipEmailVerification: false,
    landingPage: "onboarding",
    trialDurationDays: 7,
    instantVIPUpgrade: false,
    hasBasicTier: true,
    showStripeCheckout: true,
  },
};

// Get current mode configuration
export const getCurrentModeConfig = () => {
  if (TEST_MODE === 1) {
    return TEST_MODE_CONFIG.mode1;
  } else if (TEST_MODE === 2) {
    return TEST_MODE_CONFIG.mode2;
  } else if (TEST_MODE === 3) {
    return TEST_MODE_CONFIG.mode3;
  } else {
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
