// Test Mode Configuration
// Set to true for testing without email verification and accelerated trial
// Set to false for production
export const TEST_MODE = true;

// Test mode settings
export const TEST_MODE_CONFIG = {
  // Skip email verification in test mode
  skipEmailVerification: TEST_MODE,
  
  // Trial duration in days (7 for production, 1 for testing)
  trialDurationDays: TEST_MODE ? 1 : 7,
  
  // Auto-login after signup in test mode
  autoLoginAfterSignup: TEST_MODE,
  
  // Show test mode indicator
  showTestModeIndicator: TEST_MODE,
};

// Helper to get trial end date
export const getTrialEndDate = (startDate: Date): Date => {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + TEST_MODE_CONFIG.trialDurationDays);
  return endDate;
};

// Helper to check if trial is expired
export const isTrialExpired = (trialStartDate: string): boolean => {
  const startDate = new Date(trialStartDate);
  const endDate = getTrialEndDate(startDate);
  return new Date() > endDate;
};

// Helper to get days remaining in trial
export const getDaysRemainingInTrial = (trialStartDate: string): number => {
  const startDate = new Date(trialStartDate);
  const endDate = getTrialEndDate(startDate);
  const diffTime = endDate.getTime() - new Date().getTime();
  return Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 0);
};
