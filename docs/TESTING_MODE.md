# RE-ENABLING AUTHENTICATION

Authentication has been temporarily disabled for testing. To re-enable it:

## 1. Update `lib/mockAuth.js`
Change `isMockAuthEnabled()` to return `false`:
```javascript
export function isMockAuthEnabled() {
  return false; // Changed from true
}
```

## 2. Update `middleware.js`
Uncomment the authentication code and remove the early return:
- Remove the `return NextResponse.next();` at the top
- Uncomment all the code in the `/* ORIGINAL AUTH CODE */` section

## 3. Update `components/layout/Navbar.js`
- Uncomment the `fetchUser()` function
- Uncomment the `handleLogout()` function  
- Uncomment the call to `fetchUser()` in `useEffect`
- Remove the mock user setup
- Uncomment the Logout button

## 4. Update `scripts/seed.js` (Optional)
If you want dynamic company IDs instead of the fixed mock ID:
- Remove the `MOCK_COMPANY_ID` constant
- Change `_id: MOCK_COMPANY_ID` back to auto-generated ID
- Change `findById(MOCK_COMPANY_ID)` back to `findOne({ domain: companyData.domain })`

## Files Modified for Testing:
- ✅ `middleware.js` - Bypasses all auth checks
- ✅ `lib/auth.js` - Returns mock user from `getUserFromRequest()`
- ✅ `lib/mockAuth.js` - NEW file with mock user data
- ✅ `components/layout/Navbar.js` - Uses mock user, logout disabled
- ✅ `scripts/seed.js` - Uses fixed company ID matching mock

## Testing Status:
All routes are now accessible without login. API routes receive a mock user with:
- User ID: `507f1f77bcf86cd799439011`
- Role: `admin`
- Company ID: `507f1f77bcf86cd799439012`

## After Testing:
Follow the 4 steps above to restore full authentication functionality.
