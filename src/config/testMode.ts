// Test Mode Configuration
// Set to true for testing without email verification and accelerated trial
// Set to false for production
export const TEST_MODE = true;

// Test mode settings
export const TEST_MODE_CONFIG = {
  // Skip email verification in test mode
  skipEmailVerification: TEST_MODE,
  
  // Trial duration in days (7 for production)
  trialDurationDays: 7,
  
  // Trial duration in minutes for test mode (30 minutes for testing)
  trialDurationMinutes: 30,
  
  // Auto-login after signup in test mode
  autoLoginAfterSignup: TEST_MODE,
  
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
