# User Approval System Documentation

## Overview
This system implements a user approval workflow where managers and viewers joining existing companies require admin approval before accessing the system.

## Features

### 1. **Automatic Admin Promotion**
- When a **Manager** creates a new company, they are automatically promoted to **Admin**
- The first user of any company becomes **Admin** regardless of selected role
- Admins have full access to all features

### 2. **Pending User Requests**
- When Manager or Viewer joins an existing company with active Admin:
  - User status is set to `pending`
  - User cannot login until approved
  - Admin receives notification

### 3. **Admin Notification Bell**
- Bell icon appears in Navbar for Admin users only
- Shows count of pending requests
- Real-time updates every 30 seconds
- Click to view pending user list

### 4. **Approve/Reject Workflow**
Admin can:
- ✅ **Approve** - User status changes to `active`, can now login
- ❌ **Reject** - User status changes to `rejected`, cannot login

## User Flows

### Flow 1: Manager Creates New Company
```
1. Manager signs up with "Create new company"
2. System creates company
3. Manager role → automatically upgraded to Admin
4. Manager redirected to dashboard
5. Full access granted
```

### Flow 2: Manager Joins Existing Company
```
1. Manager signs up with "Join existing company"
2. System checks if Admin exists
3. IF Admin exists:
   - Status set to "pending"
   - Message: "Request sent to admin"
   - Redirect to login page
   - Cannot login until approved
4. IF no Admin exists:
   - Manager becomes Admin
   - Full access granted
```

### Flow 3: Admin Approves Request
```
1. Admin sees bell icon with count (e.g., "3")
2. Admin clicks bell
3. Dropdown shows pending users with details:
   - Name
   - Email
   - Role
   - Request date
4. Admin clicks "Approve"
5. User status → "active"
6. User can now login
```

### Flow 4: Admin Rejects Request
```
1. Admin clicks "Reject" on pending user
2. User status → "rejected"
3. User tries to login → Error: "Request rejected"
```

## Database Schema

### User Model Changes
```javascript
{
  name: String,
  email: String,
  password: String,
  role: 'admin' | 'manager' | 'viewer',
  status: 'pending' | 'active' | 'rejected',  // NEW
  companyId: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### GET /api/auth/pending-requests
**Description**: Get all pending user requests for admin's company

**Auth**: Required (Admin only)

**Response**:
```json
{
  "ok": true,
  "data": {
    "requests": [
      {
        "_id": "...",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "manager",
        "status": "pending",
        "createdAt": "2025-11-04T..."
      }
    ],
    "count": 1
  }
}
```

### POST /api/auth/pending-requests
**Description**: Approve or reject a pending user

**Auth**: Required (Admin only)

**Body**:
```json
{
  "userId": "user_id_here",
  "action": "approve" // or "reject"
}
```

**Response**:
```json
{
  "ok": true,
  "data": {
    "message": "User John Doe has been approved",
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "manager",
      "status": "active"
    }
  }
}
```

## UI Components

### Navbar Bell Icon
**Location**: `components/layout/Navbar.js`

**Features**:
- Only visible to Admins
- Badge shows pending count
- Click to toggle dropdown
- Auto-refresh every 30 seconds

**UI Elements**:
- 🔔 Bell icon
- Red badge with count
- Dropdown with user cards
- Approve/Reject buttons

### Signup Page Updates
**Location**: `app/signup/page.js`

**Changes**:
- Yellow info box for "Join existing company"
- Alert message after registration if pending
- Automatic redirect to login for pending users

## User Experience

### For Manager Creating Company
```
✓ Select "Create new company"
✓ Enter company name
✓ See message: "You will become Admin"
✓ Submit → Immediate access
✓ No approval needed
```

### For Manager Joining Company
```
✓ Select "Join existing company"
✓ Enter Company ID
✓ Select role: Manager
✓ See warning: "Requires admin approval"
✓ Submit → Success message
✓ Redirected to login
✗ Cannot login yet
⏳ Wait for admin approval
✓ After approval → Can login
```

### For Admin Managing Requests
```
✓ Login to dashboard
✓ See bell icon with count
✓ Click bell → Dropdown opens
✓ Review user details
✓ Click Approve → User activated
✓ Alert: "User approved successfully"
✓ Count updates automatically
```

## Error Messages

| Scenario | Message |
|----------|---------|
| Pending user tries to login | "Your account is pending approval from the company admin. Please wait for approval." |
| Rejected user tries to login | "Your account request has been rejected by the company admin." |
| Non-admin tries to view requests | "Only admins can view pending requests" |
| Non-admin tries to approve | "Only admins can approve or reject requests" |

## Security Features

1. **Role-Based Access Control**
   - Only admins can view pending requests
   - Only admins can approve/reject
   - Middleware enforces permissions

2. **Company Isolation**
   - Admins only see requests for their company
   - CompanyId validation on all queries
   - Multi-tenant data isolation

3. **Status Checks**
   - Login blocked for pending users
   - Login blocked for rejected users
   - Status changes logged with timestamps

## Testing Scenarios

### Test 1: Manager Creates Company
1. Sign up as Manager with new company
2. Verify role = "admin"
3. Verify status = "active"
4. Verify immediate dashboard access

### Test 2: Manager Joins with No Admin
1. Create company without admin
2. Sign up as Manager to join
3. Verify role = "admin"
4. Verify status = "active"

### Test 3: Manager Joins with Existing Admin
1. Company has active admin
2. Sign up as Manager to join
3. Verify role = "manager"
4. Verify status = "pending"
5. Verify cannot login
6. Verify admin sees notification

### Test 4: Admin Approves User
1. Login as admin
2. See pending count
3. Click bell icon
4. Click "Approve" on pending user
5. Verify user status = "active"
6. Verify pending count decrements
7. Pending user can now login

### Test 5: Admin Rejects User
1. Click "Reject" on pending user
2. Verify user status = "rejected"
3. Rejected user cannot login
4. Verify error message shown

## Known Limitations

1. **No Email Notifications**
   - Users not notified of approval/rejection
   - Future: Add email service

2. **No Bulk Actions**
   - Must approve/reject one at a time
   - Future: Add "Select all" feature

3. **No Request History**
   - Rejected users not tracked separately
   - Future: Add audit log

## Future Enhancements

1. ✨ Email notifications on approval/rejection
2. ✨ Bulk approve/reject multiple users
3. ✨ Request history and audit trail
4. ✨ Admin can edit user role before approving
5. ✨ Re-request feature for rejected users
6. ✨ Custom rejection messages
7. ✨ Auto-expire pending requests after X days

## Troubleshooting

### Bell Icon Not Showing
- Check user role is "admin"
- Check browser console for errors
- Verify API endpoint `/api/auth/pending-requests` accessible

### Pending Count Not Updating
- Check 30-second polling interval
- Verify no API errors in console
- Hard refresh page

### Cannot Approve User
- Verify logged in as admin
- Check user companyId matches
- Verify user status is "pending"

### Pending User Can Login
- Check user status in database
- Verify login route checks status
- Clear cookies and retry

## Migration Notes

For existing databases:
```javascript
// Add status field to existing users
db.users.updateMany(
  { status: { $exists: false } },
  { $set: { status: 'active' } }
);
```

## Support

For issues or questions:
1. Check user status in database
2. Verify role permissions
3. Check API logs for errors
4. Review Navbar component state
