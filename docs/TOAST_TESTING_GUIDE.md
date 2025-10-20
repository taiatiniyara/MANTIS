# 🧪 Toast Testing Guide - Quick Reference

## 🚀 Server Running
✅ Development server: http://localhost:3000  
✅ All toast notifications active

---

## 📋 Test Scenarios

### 1️⃣ Test Login Success Toast
```
URL: http://localhost:3000/auth/login

Credentials:
Email: admin@mantis.gov.fj
Password: Password123!

Expected Result:
✅ Green success toast appears: "Login Successful!"
✅ Message: "Welcome back. Redirecting to your dashboard..."
✅ Auto-redirect to /protected after 1 second
```

---

### 2️⃣ Test Login Error Toast
```
URL: http://localhost:3000/auth/login

Invalid Credentials:
Email: wrong@email.com
Password: wrongpassword

Expected Result:
❌ Red error toast appears: "Login Failed"
❌ Message: "Invalid login credentials"
❌ No redirect
❌ Inline error message also shows
```

---

### 3️⃣ Test Sign Up Validation Toasts
```
URL: http://localhost:3000/auth/sign-up

Test A - Password Mismatch:
Email: test@example.com
Password: password123
Repeat Password: password456

Expected Result:
❌ Red validation toast: "Validation Error"
❌ Message: "Passwords do not match"

Test B - Weak Password:
Email: test@example.com
Password: 123
Repeat Password: 123

Expected Result:
❌ Red validation toast: "Validation Error"
❌ Message: "Password must be at least 6 characters long"
```

---

### 4️⃣ Test Sign Up Success Toast
```
URL: http://localhost:3000/auth/sign-up

Valid Data:
Email: newuser@test.com
Password: password123
Repeat Password: password123

Expected Result:
✅ Green success toast: "Account Created!"
✅ Message: "Please check your email to confirm your account."
✅ Auto-redirect to /auth/sign-up-success after 1 second
```

---

### 5️⃣ Test Forgot Password Success
```
URL: http://localhost:3000/auth/forgot-password

Enter Email:
Email: admin@mantis.gov.fj

Expected Result:
✅ Green success toast: "Reset Email Sent!"
✅ Message: "Password reset instructions have been sent to admin@mantis.gov.fj"
✅ Enhanced success card with:
   - Green checkmark icon
   - Blue email confirmation box
   - Mail icon
   - "Back to Login" link
```

---

### 6️⃣ Test Update Password Validation
```
URL: http://localhost:3000/auth/update-password

Note: You need a valid reset token. Use forgot password first.

Test A - Password Mismatch:
New Password: newpass123
Confirm Password: different123

Expected Result:
❌ Red validation toast: "Validation Error"
❌ Message: "Passwords do not match"

Test B - Valid Update:
New Password: newpass123
Confirm Password: newpass123

Expected Result:
✅ Green success toast: "Password Updated!"
✅ Message: "Your password has been successfully changed. Redirecting..."
✅ Auto-redirect to /protected after 1.5 seconds
```

---

## 🎨 Toast Appearance

### Success Toast (Green)
```
┌──────────────────────────────────────┐
│ ✅ Login Successful!             [X] │
│ Welcome back. Redirecting to your    │
│ dashboard...                          │
└──────────────────────────────────────┘
• Background: Light green (#f0fdf4)
• Border: Green (#bbf7d0)
• Duration: 5 seconds
• Position: Bottom right
• Auto-dismiss: Yes
```

### Error Toast (Red)
```
┌──────────────────────────────────────┐
│ ❌ Login Failed                  [X] │
│ Invalid login credentials             │
└──────────────────────────────────────┘
• Background: Red (destructive)
• Text: White
• Duration: 5 seconds
• Position: Bottom right
• Auto-dismiss: Yes
```

---

## ✅ Visual Checks

### Login Page
- [ ] Form displays correctly
- [ ] Toast appears on successful login
- [ ] Toast appears on failed login
- [ ] Redirect happens after success toast
- [ ] Inline error message also shows

### Sign Up Page
- [ ] Password mismatch shows toast
- [ ] Weak password shows toast
- [ ] Successful signup shows toast
- [ ] Redirect to success page

### Forgot Password Page
- [ ] Success toast appears
- [ ] Enhanced success card displays
- [ ] Email is shown in confirmation box
- [ ] Icons display correctly (checkmark, mail)
- [ ] "Back to Login" link works

### Update Password Page
- [ ] Two password fields present
- [ ] Mismatch validation works
- [ ] Weak password validation works
- [ ] Success toast appears
- [ ] Redirect after success

---

## 🐛 Common Issues & Solutions

### Toast Not Appearing
**Issue**: No toast shows up  
**Check**:
- Toaster component in layout.tsx
- useToast hook imported
- toast() function called correctly
- Browser console for errors

### Toast Disappears Too Fast
**Issue**: Can't read toast message  
**Solution**: Duration set to 5 seconds (configured in use-toast.ts)

### Multiple Toasts Overlap
**Issue**: Toasts stack incorrectly  
**Solution**: Max 3 toasts allowed (TOAST_LIMIT = 3)

### Redirect Happens Before Toast
**Issue**: Redirect too fast  
**Solution**: setTimeout delays added:
- Login: 1 second
- Sign up: 1 second  
- Update password: 1.5 seconds

---

## 📱 Mobile Testing

Test on different screen sizes:
- [ ] Desktop (1920x1080)
- [ ] Tablet (768px)
- [ ] Mobile (375px)

Toast should:
- Appear at bottom center on mobile
- Be readable on all screen sizes
- Not cover important content

---

## 🎯 Quick Test All Forms

### Fastest Test Path
```
1. Visit /auth/login
   - Try invalid login → See error toast
   - Login with admin@mantis.gov.fj → See success toast

2. Visit /auth/sign-up
   - Try mismatched passwords → See validation toast
   - Create valid account → See success toast

3. Visit /auth/forgot-password
   - Enter email → See success toast + enhanced card

4. Click reset link (from email)
   - Update password → See success toast
```

---

## 📊 Expected Toast Count

| Form | Success Toasts | Error Toasts | Validation Toasts | Total |
|------|---------------|--------------|-------------------|-------|
| Login | 1 | 1+ | 0 | 2+ |
| Sign Up | 1 | 1+ | 2 | 4+ |
| Forgot Password | 1 | 1+ | 0 | 2+ |
| Update Password | 1 | 1+ | 2 | 4+ |
| **Total** | **4** | **4+** | **4** | **12+** |

---

## ✨ Success Criteria

All tests pass if:
- ✅ Success toasts are green with appropriate icons
- ✅ Error toasts are red/destructive
- ✅ Validation toasts prevent form submission
- ✅ Auto-redirects work with appropriate delays
- ✅ Toasts auto-dismiss after 5 seconds
- ✅ Multiple toasts can appear (max 3)
- ✅ Inline errors still display
- ✅ Enhanced UI elements work (icons, cards)

---

## 🚀 Ready to Test!

**Current Status**: ✅ Server running on http://localhost:3000

**Start Here**: http://localhost:3000/auth/login

**Test Credentials**:
- Email: admin@mantis.gov.fj
- Password: Password123!

---

**Happy Testing! 🎉**
