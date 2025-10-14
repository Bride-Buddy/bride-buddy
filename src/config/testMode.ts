// Test Mode Configuration
// Set to true for testing with accelerated trial timing (30 minutes instead of 7 days)
// Set to false for production (7-day trial)
// NOTE: Test mode does NOT skip email verification or authentication flows
// It ONLY accelerates the trial period so you can test the complete user journey faster
export const TEST_MODE = true;

// Test mode settings
export const TEST_MODE_CONFIG = {
  // Always use real email verification (never skip in test or production)
  skipEmailVerification: false,
  
  // Trial duration in days for production
  trialDurationDays: 7,
  
  // Trial duration in minutes for test mode (30 minutes for testing)
  trialDurationMinutes: 30,
  
  // Always use real authentication flow (never auto-login)
  autoLoginAfterSignup: false,
  
  // Show test mode indicator
  showTestModeIndicator: TEST_MODE,
};

// Helper to get trial end date
export const getTrialEndDate = (startDate: Date): Date => {
  const endDate = new Date(startDate);
  if (TEST_MODE) {
    // Add minutes in test mode
    endDate.setMinutes(endDate.getMinutes() + TEST_MODE_CONFIG.trialDurationMinutes);
  } else {
    // Add days in production
    endDate.setDate(endDate.getDate() + TEST_MODE_CONFIG.trialDurationDays);
  }
  return endDate;
};

// Helper to check if trial is expired
export const isTrialExpired = (trialStartDate: string): boolean => {
  const startDate = new Date(trialStartDate);
  const endDate = getTrialEndDate(startDate);
  return new Date() > endDate;
};

// Helper to get days/minutes remaining in trial
export const getDaysRemainingInTrial = (trialStartDate: string): number => {
  const startDate = new Date(trialStartDate);
  const endDate = getTrialEndDate(startDate);
  const diffTime = endDate.getTime() - new Date().getTime();
  
  if (TEST_MODE) {
    // Return minutes remaining in test mode
    return Math.max(Math.ceil(diffTime / (1000 * 60)), 0);
  } else {
    // Return days remaining in production
    return Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 0);
  }
};
