# Admin Account Setup Guide

## Creating Test Admin and User Accounts

To quickly create test admin and user accounts for development/testing, use these endpoints:

### Create Test Admin Account

**Endpoint:** `POST /api/auth/create-test-admin`

Execute this command in your terminal to create a test admin account:

```bash
curl -X POST http://localhost:3001/api/auth/create-test-admin
```

**Credentials:**
- Email: `admin@forensics.com`
- Password: `admin123456`
- Role: **Administrator**

### Create Test Investigator Account

**Endpoint:** `POST /api/auth/create-test-user`

Execute this command in your terminal to create a test investigator account:

```bash
curl -X POST http://localhost:3001/api/auth/create-test-user
```

**Credentials:**
- Email: `test@forensics.com`
- Password: `password123`
- Role: **Investigator**

---

## Manual Registration (Alternative Method)

If you prefer to manually register an admin account:

1. Go to the **Register** page (`/register`)
2. Fill in the form with these details:
   - **First Name:** Admin
   - **Last Name:** User
   - **Username:** admin_user (alphanumeric, underscores, dots, and hyphens allowed)
   - **Email:** admin@forensics.com
   - **Password:** admin123456 (minimum 6 characters)
   - **Role:** Administrator
3. Click **Create account**
4. You'll be automatically logged in and redirected to the dashboard

---

## What Was Fixed

✅ **Validation Error:** The username field previously only allowed alphanumeric characters. Now it allows:
- Letters (a-z, A-Z)
- Numbers (0-9)
- Underscores (_)
- Dots (.)
- Hyphens (-)

✅ **Admin Route:** Added `/api/auth/create-test-admin` endpoint for quick test admin creation

---

## Testing Login

### Using Admin Account

1. Go to **Login** page
2. Enter:
   - **Email:** admin@forensics.com
   - **Password:** admin123456
3. Click **Sign in**

### Using Investigator Account

1. Go to **Login** page
2. Enter:
   - **Email:** test@forensics.com
   - **Password:** password123
3. Click **Sign in**

---

## Troubleshooting

### "Validation error" when registering with admin role
- Make sure your username only contains: letters, numbers, underscores (_), dots (.), hyphens (-)
- Example valid usernames: `admin_user`, `admin.user`, `admin-user`, `adminuser123`

### "User already exists"
- The credentials have already been created
- Use a different email or username for additional accounts

### "Server error during login"
- Ensure the backend server is running (`npm run dev` in the backend directory)
- Verify MongoDB is connected (check server console logs)
