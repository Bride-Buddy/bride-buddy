# 🧪 Test Mode Configuration

## Overview

This app includes a **Test Mode** feature that allows you to quickly test the end-to-end user experience without waiting for email verification or the full 7-day trial period.

## How to Toggle Test Mode

### Enable Test Mode (Default)

Open `src/config/testMode.ts` and set:

```typescript
export const TEST_MODE = true;
```

### Disable Test Mode (Production)

Open `src/config/testMode.ts` and set:

```typescript
export const TEST_MODE = false;
```

## Test Mode Features

When `TEST_MODE = true`:

### ✅ Auto Email Verification

- **No email clicking required** - Supabase auto-confirms emails
- Users are immediately logged in after signup
- Skip the EmailVerification.tsx page entirely

### ⚡ Accelerated Trial Period

- **1-day trial** instead of 7 days
- Perfect for testing trial expiration flow
- Modal appears immediately when trial expires

### 🔍 Visual Indicator

- Yellow "🧪 TEST MODE" badge in top-right corner
- Shows current trial duration (1-day vs 7-day)
- Easy to see which mode you're in

## Production Mode

When `TEST_MODE = false`:

### 📧 Email Verification Required

- Users must click magic link in email
- Standard authentication flow
- EmailVerification.tsx page shown

### 📅 7-Day Trial Period

- Full 7-day free trial
- Trial warnings at Day 6, 5, 3, and 1
- Production-ready timing

### 🎨 Clean UI

- No test mode indicators
- Production-ready appearance

## Testing Checklist

### Test Mode Testing (Quick)

1. Set `TEST_MODE = true`
2. Sign up with any email (no verification needed)
3. Complete onboarding
4. **Wait 24 hours** to see trial expiration
5. Test VIP vs Basic tier selection

### Production Mode Testing (Full)

1. Set `TEST_MODE = false`
2. Sign up with real email
3. Click magic link in email
4. Complete onboarding
5. **Wait 7 days** to see trial expiration
6. Test VIP vs Basic tier selection

## Configuration Details

Located in `src/config/testMode.ts`:

```typescript
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
```

## Important Notes

### ⚠️ Before Deployment

1. **Set `TEST_MODE = false`** in `src/config/testMode.ts`
2. Verify no test indicators appear
3. Test with real email verification
4. Confirm 7-day trial period is active

### 🔧 Supabase Configuration

- Email auto-confirmation is **enabled** for both modes
- This allows seamless testing without email delays
- No need to change Supabase settings

### 📊 Database Behavior

- Test mode does NOT affect database operations
- All data is stored normally
- Trial start dates are real timestamps
- Only the duration calculation changes

## Workflow Summary

### New User Flow (Test Mode)

1. **Auth.tsx** - Sign up (email auto-confirmed) ✅
2. **AuthRedirect.tsx** - New user detected
3. **OnboardingChat.tsx** - Complete onboarding
4. **chat.tsx** - Trial user with 1-day countdown
5. **After 24 hours** - Trial expiration modal
6. **PricingModal.tsx** - Choose VIP or Basic

### Returning User Flow (Both Modes)

1. **Auth.tsx** - Login (magic link)
2. **AuthRedirect.tsx** - Returning user detected
3. **chat.tsx** - Resume planning
4. **PlannerWorkspace.tsx** - View progress

## Tips

- Use test mode for rapid development and testing
- Switch to production mode before showing demos
- Keep TEST_MODE committed as `true` for dev team
- Create a `.env` variable for production deployments

## Support

If you need to manually simulate trial expiration:

1. Use Supabase dashboard
2. Find your user in `profiles` table
3. Set `trial_start_date` to 2 days ago
4. Refresh the app to trigger expiration flow
