# AI Chatbot Testing Guide

## 🧪 Manual Testing Checklist

### 1. UI/UX Testing

#### Chat Button
- [ ] Button appears on dashboard after login
- [ ] Button is positioned in bottom-right corner
- [ ] Button has blue gradient background
- [ ] Button shows MessageCircle icon
- [ ] Hover effect scales button to 110%
- [ ] Button does NOT appear on login page
- [ ] Button does NOT appear on signup page

#### Chat Window
- [ ] Clicking button opens chat window
- [ ] Window appears with smooth animation
- [ ] Window size is 96px × 600px
- [ ] Header shows "AI Assistant" text
- [ ] Close button (X) works
- [ ] Window has rounded corners and shadow
- [ ] Initial greeting message displays

#### Message Input
- [ ] Input field accepts text
- [ ] Placeholder shows "Ask about your projects..."
- [ ] Send button is enabled when text is entered
- [ ] Send button is disabled when input is empty
- [ ] Pressing Enter sends message
- [ ] Shift+Enter creates new line (not implemented yet, but documented)
- [ ] Input field clears after sending

#### Message Display
- [ ] User messages appear right-aligned with blue background
- [ ] Bot messages appear left-aligned with white background
- [ ] Messages auto-scroll to bottom
- [ ] Loading indicator shows "Thinking..." during processing
- [ ] Loading indicator has spinning animation
- [ ] Bold text renders correctly (**text**)
- [ ] Headers render larger and bold (## text)
- [ ] Bullet points indent properly (• text)

### 2. Functional Testing

#### Authentication
```bash
Test 1: Unauthenticated Request
- Open browser incognito mode
- Go to http://localhost:3000
- Should redirect to login
- Chat button should NOT appear

Test 2: Authenticated Request
- Login with valid credentials
- Chat button should appear
- Click button to open chat
- Send a message
- Should receive response
```

#### Query Type: Phase Spending
```bash
Test Queries:
1. "What's the total spent on Phase 1?"
2. "How much did we spend on Foundation?"
3. "Phase 2 costs"

Expected Response:
✓ Phase name
✓ Budget amount
✓ Spent amount
✓ Remaining amount
✓ Purchase count
✓ Utilization percentage

Check:
- [ ] Correct phase data returned
- [ ] Numbers formatted with commas
- [ ] Bold text highlights key values
- [ ] All metrics present
```

#### Query Type: Item Purchases
```bash
Test Queries:
1. "Show me cement purchases this month"
2. "List steel purchases"
3. "Show brick purchases"

Expected Response:
✓ Number of purchases found
✓ Item name, quantity, unit
✓ Price per unit and total cost
✓ Vendor name
✓ Project name
✓ Date (for non-monthly queries)

Check:
- [ ] Correct items filtered
- [ ] Current month filter works
- [ ] List limited to 5 items (with "...and N more")
- [ ] Total cost calculated correctly
- [ ] Vendor and project names populated
```

#### Query Type: Project Comparison
```bash
Test Queries:
1. "Compare Project A to Project B"
2. "Show difference between Mall and Office projects"

Expected Response:
✓ Both project names
✓ Budget comparison
✓ Spending comparison
✓ Remaining budgets
✓ Phase counts
✓ Purchase counts
✓ Status for both
✓ Key differences section

Check:
- [ ] Both projects found and displayed
- [ ] Metrics calculated correctly
- [ ] Differences show which project spent more
- [ ] Efficiency comparison included
- [ ] "Not found" message if project doesn't exist
```

#### Query Type: Vendor Spending
```bash
Test Queries:
1. "Show me vendor spending"
2. "Which vendors did we use the most?"
3. "Vendor analysis"

Expected Response:
✓ List of vendors sorted by spending
✓ Total spent per vendor
✓ Purchase count per vendor
✓ Items purchased from vendor

Check:
- [ ] Vendors sorted by total spending (highest first)
- [ ] All purchases aggregated correctly
- [ ] Items list shows unique items only
- [ ] Limited to top 5 vendors (with "...and N more")
```

#### Query Type: Project Summary
```bash
Test Queries:
1. "Give me project summary"
2. "Show all projects"
3. "What's the status of Project A?"

Expected Response (All Projects):
✓ List of projects
✓ Budget and spent for each
✓ Utilization percentage
✓ Phase count
✓ Status

Expected Response (Single Project):
✓ Project name
✓ Budget and spent
✓ Remaining budget
✓ Phase count
✓ Status

Check:
- [ ] Correct project(s) returned
- [ ] Metrics accurate
- [ ] Limited to 10 projects for "all" query
```

#### Query Type: General/Unknown
```bash
Test Queries:
1. "Hello"
2. "Help me"
3. "What can you do?"

Expected Response:
✓ Help message with examples
✓ List of supported query types
✓ Example queries for each type

Check:
- [ ] Helpful message displayed
- [ ] No error thrown
- [ ] Examples are clear and actionable
```

### 3. Error Handling Testing

#### Network Errors
```bash
Test 1: API Down
- Stop the development server
- Send a message
- Expected: "Network error. Please check your connection..."

Test 2: Slow Response
- Use network throttling in DevTools
- Send a message
- Expected: Loading indicator shows for longer duration
```

#### Invalid Data
```bash
Test 1: Non-existent Phase
- Query: "Show me Phase 99 spending"
- Expected: "I couldn't find a phase matching..."

Test 2: Non-existent Project
- Query: "Compare Project X to Project Y"
- Expected: "Could not find one or both projects..."

Test 3: No Purchases Found
- Query: "Show me diamond purchases"
- Expected: "No purchases found for..."
```

#### Authentication Issues
```bash
Test 1: Expired Token
- Login
- Manually delete auth_token cookie
- Send message
- Expected: "Unauthorized" error (401)

Test 2: Invalid Token
- Modify auth_token cookie value
- Send message
- Expected: "Unauthorized" error (401)
```

### 4. Multi-Tenant Testing

```bash
Test 1: Company A User
- Login as user from Company A
- Query: "Show all projects"
- Expected: Only Company A projects shown

Test 2: Company B User
- Login as user from Company B
- Query: "Show all projects"
- Expected: Only Company B projects shown

Test 3: Data Isolation
- Company A user queries "Phase 1"
- Company B user queries "Phase 1"
- Expected: Different data returned for each
```

### 5. Performance Testing

```bash
Test 1: Response Time
- Send 10 different queries
- Measure response time for each
- Expected: All under 1 second

Test 2: Message History
- Send 50 messages
- Check UI performance
- Expected: No lag, smooth scrolling

Test 3: Large Result Sets
- Query projects with 100+ purchases
- Expected: Results limited and performant

Test 4: Concurrent Users (Manual)
- Open 5 browser tabs
- Login with different users
- Send queries simultaneously
- Expected: All get correct responses
```

### 6. Browser Compatibility

Test in the following browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

Check:
- [ ] Chat button renders correctly
- [ ] Chat window displays properly
- [ ] Messages format correctly
- [ ] Animations work smoothly
- [ ] Input and send work
- [ ] No console errors

### 7. Mobile Responsiveness

```bash
Test Devices:
- iPhone (375px width)
- iPad (768px width)
- Android phone (360px width)

Check:
- [ ] Chat button visible and clickable
- [ ] Chat window fits on screen
- [ ] Messages readable
- [ ] Input field accessible
- [ ] Touch interactions work
- [ ] No horizontal scroll
```

### 8. Accessibility Testing

```bash
Keyboard Navigation:
- [ ] Tab to chat button
- [ ] Enter to open chat
- [ ] Tab through input and send button
- [ ] Enter to send message
- [ ] Escape to close (if implemented)

Screen Reader:
- [ ] Chat button has aria-label
- [ ] Send button has aria-label
- [ ] Messages have proper roles
- [ ] Loading state announced

Visual:
- [ ] Sufficient color contrast
- [ ] Text readable at 200% zoom
- [ ] Focus indicators visible
```

## 🐛 Known Issues / Limitations

1. **Pattern Matching**: Currently uses regex patterns, not true AI
   - Solution: Phase 2 will integrate OpenAI API

2. **No Follow-up Questions**: Each query is independent
   - Solution: Implement conversation context in Phase 2

3. **Limited to 5 Results**: Large datasets truncated
   - This is intentional for performance
   - Full export available via UI

4. **No Voice Input**: Text only
   - Solution: Add Web Speech API in Phase 3

5. **English Only**: No i18n support yet
   - Solution: Add multi-language in Phase 3

## ✅ Test Pass Criteria

The AI Chatbot passes testing if:
- ✅ All UI elements render correctly across browsers
- ✅ All 5 query types return accurate data
- ✅ Error messages display gracefully
- ✅ Multi-tenant isolation is enforced
- ✅ Response times are under 1 second
- ✅ Mobile experience is usable
- ✅ No console errors or warnings
- ✅ Authentication is properly enforced

## 📊 Testing Report Template

```markdown
# AI Chatbot Test Report

**Date**: YYYY-MM-DD
**Tester**: [Name]
**Environment**: Development / Staging / Production
**Browser**: Chrome 120 / Firefox 121 / Safari 17

## Test Results

### UI/UX Tests
- Chat Button: ✅ PASS / ❌ FAIL
- Chat Window: ✅ PASS / ❌ FAIL
- Message Display: ✅ PASS / ❌ FAIL

### Functional Tests
- Phase Spending: ✅ PASS / ❌ FAIL
- Item Purchases: ✅ PASS / ❌ FAIL
- Project Comparison: ✅ PASS / ❌ FAIL
- Vendor Spending: ✅ PASS / ❌ FAIL
- Project Summary: ✅ PASS / ❌ FAIL

### Error Handling
- Network Errors: ✅ PASS / ❌ FAIL
- Invalid Data: ✅ PASS / ❌ FAIL
- Authentication: ✅ PASS / ❌ FAIL

### Performance
- Response Time: ✅ PASS / ❌ FAIL
- UI Performance: ✅ PASS / ❌ FAIL

### Multi-Tenant
- Data Isolation: ✅ PASS / ❌ FAIL

## Issues Found
1. [Issue description]
2. [Issue description]

## Recommendations
1. [Recommendation]
2. [Recommendation]

## Overall Status
✅ APPROVED FOR RELEASE
❌ REQUIRES FIXES
```

## 🚀 Quick Start Testing

**5-Minute Smoke Test:**

1. Login to the application
2. Check chat button appears (bottom-right)
3. Click button to open chat
4. Send: "What's the total spent on Phase 1?"
5. Verify response shows budget and spending
6. Send: "Show me cement purchases this month"
7. Verify list of purchases appears
8. Close chat window
9. Logout and verify chat button gone
10. ✅ If all work, basic functionality is good!

---

**Last Updated**: November 4, 2025
**Version**: 1.0.0
