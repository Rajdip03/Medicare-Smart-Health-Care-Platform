# Email Confirmation Feature - Troubleshooting Guide

## ✅ Quick Fix Checklist

### 1. **Verify .env Configuration**
Make sure your `.backend/.env` has these exact keys:
```
EMAIL_USER = your_gmail@gmail.com
EMAIL_PASSWORD = your_16_char_app_password
FRONTEND_URL = http://localhost:5173
```

**⚠️ Common Mistakes:**
- Using your Gmail password instead of App Password
- Extra spaces around the `=` sign
- Quotes around values

### 2. **Generate Gmail App Password**
1. Go to: https://myaccount.google.com/apppasswords
2. Select **Mail** and **Windows Computer**
3. Copy the 16-character password (remove spaces)
4. Paste in `.env` as `EMAIL_PASSWORD`

### 3. **Enable Less Secure App Access (if needed)**
If App Passwords don't work:
1. Go to: https://myaccount.google.com/lesssecureapps
2. Toggle ON "Allow less secure app access"

---

## 🧪 Test Email Feature

Use this endpoint to test if emails are working:

**POST** `http://localhost:4000/api/user/send-test-email`

**Body:**
```json
{
  "email": "your_test_email@gmail.com"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Test email sent successfully to your_test_email@gmail.com"
}
```

If you get an error, check the console logs for the exact error message.

---

## 🔍 Common Error Solutions

### Error: "No recipients defined"
- **Cause:** Email address is invalid or empty
- **Fix:** Verify email format is correct

### Error: "Invalid login credentials"
- **Cause:** EMAIL_USER or EMAIL_PASSWORD is wrong
- **Fix:** Double-check credentials in .env file

### Error: "Gmail connection timeout"
- **Cause:** Gmail server not responding
- **Fix:** Check internet connection, Gmail might be blocking your IP

### Error: "Less secure app access is disabled"
- **Cause:** Gmail security setting
- **Fix:** Enable it at https://myaccount.google.com/lesssecureapps

### Error: "ENOTFOUND" or "getaddrinfo ENOTFOUND"
- **Cause:** Cannot reach Gmail SMTP server
- **Fix:** Check internet connection, verify firewall settings

---

## 📧 What Emails Are Sent?

### 1. **Signup Verification**
- Sent when user registers
- Contains verification link
- Link expires in 24 hours
- User redirected to `/verify-email?token=xxxxx`

### 2. **Appointment Confirmation**
- Sent when user books appointment
- Contains doctor name, date, time, fees
- Sent to user's email address

### 3. **Email Resend**
- User can request resend if verification email lost
- Uses endpoint: `/api/user/resend-verification`

---

## 🚀 Full Setup Steps

### Step 1: Create Gmail Account (Optional)
Create a dedicated email for your app:
- `medicareapp@gmail.com`

### Step 2: Generate App Password
1. Login to: https://myaccount.google.com/
2. Go to Security section
3. Enable 2-Step Verification (if not done)
4. Go to App Passwords
5. Generate password for Mail/Windows
6. Copy the 16 characters (no spaces)

### Step 3: Update .env
```
EMAIL_USER = medicareapp@gmail.com
EMAIL_PASSWORD = abcd efgh ijkl mnop
FRONTEND_URL = http://localhost:5173
```

### Step 4: Restart Backend Server
```bash
cd backend
npm run server
```

### Step 5: Test with Test Email Endpoint
```bash
curl -X POST http://localhost:4000/api/user/send-test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### Step 6: Register a New User
Sign up with a test email and check if verification email arrives.

---

## 📋 Verification Workflow

1. User registers → Verification token generated
2. Email sent with verification link
3. User clicks link → Token validated
4. Email marked as verified in database
5. `isEmailVerified` flag set to `true`

---

## 💡 Tips

- Check **Spam/Promotions** folder if email not in inbox
- Gmail may delay delivery by 1-2 minutes
- Test email function helps diagnose issues quickly
- Always use App Password, not Gmail password
- Enable 2-Factor Authentication for better security

---

## 📞 Still Having Issues?

Check these:
1. Backend server running? (`npm run server`)
2. MongoDB connected? (Check connection logs)
3. Nodemailer installed? (`npm install nodemailer`)
4. .env file saved? (Close and reopen .env)
5. Credentials correct? (Copy-paste from Google Account)

Check backend console logs for detailed error messages:
```
Error sending verification email: [detailed error]
```

---

**Email feature tested and working! ✅**
