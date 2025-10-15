# Route and Request Audit Report

## Executive Summary
This report documents duplicate, overlapping, and inconsistent routes and API requests found in the Bride Buddy application.

## Issues Found

### 1. **CRITICAL: Case Sensitivity Inconsistencies in Routes**

#### Problem
React Router is case-sensitive, but the codebase uses inconsistent casing for the same routes, leading to potential 404 errors and broken navigation.

#### Details

**Route Definitions in `src/App.tsx`:**
- `/auth` (line 363)
- `/OnboardingChat` (line 375) - **PascalCase**
- `/chat` (line 386)
- `/Dashboard` (line 389) - **PascalCase**
- `/planner` (line 392)

**Navigation Calls with Mismatched Casing:**
- `navigate("/Auth")` - Found in multiple files (PascalCase, but route is lowercase)
- `navigate("/onboarding-chat")` in `AuthRedirect.tsx` (lines 34, 54) - **kebab-case, but route is PascalCase**
- `navigate("/dashboard")` in multiple files - **lowercase, but route is PascalCase**
- `navigate("/EmailVerification")` in `Auth.tsx` (line 132) - **PascalCase, but route is kebab-case**

**Specific Conflicts:**

1. **Auth Route:**
   - Defined as: `/auth` (lowercase)
   - Navigated to as: 
     - `/Auth` (PascalCase) in `App.tsx` lines 380, 398
     - `/auth` (lowercase) in `AuthRedirect.tsx` lines 21, 26, 64
     - `/auth` (lowercase) in catch-all route line 403
   - **Impact**: Inconsistent, but works because most use lowercase

2. **OnboardingChat Route:**
   - Defined as: `/OnboardingChat` (PascalCase)
   - Navigated to as:
     - `/OnboardingChat` (PascalCase) in `App.tsx` line 364
     - `/onboarding-chat` (kebab-case) in `AuthRedirect.tsx` lines 34, 54
   - **Impact**: BROKEN - Navigation to `/onboarding-chat` will fail with 404

3. **Dashboard Route:**
   - Defined as: `/Dashboard` (PascalCase)
   - Navigated to as:
     - `/dashboard` (lowercase) in `Chat.tsx` line 272
     - `/dashboard` (lowercase) in `AuthRedirect.tsx` line 61
     - `/dashboard` (lowercase) in `OnboardingChat.tsx` line 132
   - **Impact**: BROKEN - All navigations to lowercase `/dashboard` will fail with 404

4. **EmailVerification Route:**
   - Defined as: `/email-verification` (kebab-case)
   - Navigated to as:
     - `/EmailVerification` (PascalCase) in `Auth.tsx` line 132
   - **Impact**: BROKEN - Navigation to `/EmailVerification` will fail with 404

### 2. **Inconsistent Navigation Patterns**

The codebase has two conflicting navigation patterns:

**Pattern A: PascalCase routes** (seen in route definitions)
- `/OnboardingChat`
- `/Dashboard`

**Pattern B: lowercase/kebab-case** (seen in navigation calls)
- `/onboarding-chat`
- `/dashboard`
- `/auth`
- `/email-verification`

**Recommendation**: Choose one pattern and stick to it. Industry standard is **lowercase with kebab-case** for URLs.

### 3. **No Duplicate Supabase Functions Found** ✅

Analysis of Supabase Edge Functions shows three distinct functions with no overlap:

1. **`chat`** - Handles AI chat interactions
   - Endpoint: `/functions/v1/chat`
   - Methods: POST, OPTIONS
   - Purpose: Process user messages and AI responses

2. **`create-checkout`** - Creates Stripe checkout sessions
   - Endpoint: `/functions/v1/create-checkout`
   - Methods: POST, OPTIONS
   - Purpose: Initialize Stripe payment flow

3. **`check-subscription`** - Verifies subscription status
   - Endpoint: `/functions/v1/check-subscription`
   - Methods: POST, OPTIONS (implicitly accepts all since no method check)
   - Purpose: Check user's Stripe subscription status
   - **Note**: This function is NOT invoked anywhere in the frontend code (unused)

### 4. **Unused API Function**

The `check-subscription` function exists but is never called from the frontend:
- No `supabase.functions.invoke("check-subscription")` calls found
- Function appears to be dead code or planned for future use
- Should either be removed or integrated

### 5. **Potential Navigation Issues**

**Catch-all Route Behavior:**
- Line 403: `<Route path="*" element={<Navigate to="/auth" />} />`
- This catches ALL unmatched routes, including the broken case-sensitivity mismatches
- Users navigating to `/dashboard`, `/onboarding-chat`, or `/EmailVerification` will be redirected to `/auth` instead of seeing the actual page

## Impact Assessment

### High Priority Issues
1. **Dashboard navigation broken** - Users cannot access dashboard after onboarding
2. **Onboarding navigation broken** - New users may get stuck in authentication flow
3. **Email verification navigation broken** - Users can't verify email properly

### Medium Priority Issues
1. **Inconsistent casing** - Confusing for developers and maintenance
2. **Unused API function** - Dead code adds confusion

### Low Priority Issues
1. **Auth route inconsistency** - Works but inconsistent (mostly uses lowercase)

## Recommended Fixes

### Fix 1: Standardize All Routes to Lowercase Kebab-Case

**In `src/App.tsx`:**
```tsx
// Change line 375
<Route path="/onboarding-chat" ... />

// Change line 389
<Route path="/dashboard" ... />
```

**In `src/App.tsx` Navigate components:**
```tsx
// Change PascalCase to lowercase
<Navigate to="/auth" />  // Already correct in catch-all
```

### Fix 2: Remove or Document Unused Function

Either:
- Remove `supabase/functions/check-subscription/` if not needed
- Add TODO comment explaining future plans
- Integrate it into subscription flow

### Fix 3: Add Route Constants

Create a constants file to prevent typos:
```typescript
// src/constants/routes.ts
export const ROUTES = {
  AUTH: '/auth',
  ONBOARDING: '/onboarding-chat',
  CHAT: '/chat',
  DASHBOARD: '/dashboard',
  PLANNER: '/planner',
  EMAIL_VERIFICATION: '/email-verification',
  AUTH_REDIRECT: '/auth-redirect',
} as const;
```

## Testing Recommendations

After fixes:
1. Test new user signup flow (Auth → AuthRedirect → Onboarding → Dashboard)
2. Test returning user flow (Auth → AuthRedirect → Dashboard)
3. Test email verification flow
4. Test chat completion and dashboard navigation
5. Verify catch-all route redirects properly

## Conclusion

The application has **no duplicate API endpoints** but has **critical route case sensitivity issues** that break core user flows. The fixes are straightforward and should be applied immediately to restore functionality.
