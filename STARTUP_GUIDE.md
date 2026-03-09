# 🚀 ForensicsAI Startup Guide

This guide will help you get the ForensicsAI application running on your local machine.

## 📋 Prerequisites

Before starting, make sure you have:

1. **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
2. **MongoDB** - Either:
   - Local MongoDB installation - [Download here](https://www.mongodb.com/try/download/community)
   - MongoDB Atlas account (cloud) - [Sign up here](https://www.mongodb.com/atlas)
3. **Git** - [Download here](https://git-scm.com/)

## 🛠️ Installation Steps

### Step 1: Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Step 2: Database Setup

#### Option A: Local MongoDB
1. Start MongoDB service on your machine
2. MongoDB will run on default port 27017

#### Option B: MongoDB Atlas (Cloud)
1. Create a free MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Update the `MONGODB_URI` in `backend/.env`

### Step 3: Environment Configuration

The backend `.env` file has been created with default values. You can modify it if needed:

```env
# backend/.env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/forensics-tool
JWT_SECRET=forensics-super-secret-jwt-key-2024
JWT_REFRESH_SECRET=forensics-super-secret-refresh-key-2024
```

## 🚀 Starting the Application

### Method 1: Start Both Frontend and Backend Together (Recommended)

```bash
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend development server on http://localhost:3000

### Method 2: Start Separately

**Terminal 1 - Backend:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
npm run client
```

## 🧪 Testing the Setup

Run the automated test to verify everything is working:

```bash
npm run test-setup
```

This will:
1. Test the backend health endpoint
2. Create a test user account
3. Test login functionality
4. Test authenticated endpoints

## 🔐 Test Credentials

After running the test setup, you can login with:

- **Email:** `test@forensics.com`
- **Password:** `password123`

## 🌐 Accessing the Application

1. Open your browser and go to: http://localhost:3000
2. You'll see the ForensicsAI landing page
3. Click "Login" or "Get Started"
4. Use the test credentials above

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. "MongoDB connection error"
**Problem:** Cannot connect to MongoDB
**Solutions:**
- Make sure MongoDB is running locally
- Check if the connection string in `.env` is correct
- For Atlas: Ensure your IP is whitelisted

#### 2. "Port 5000 already in use"
**Problem:** Another service is using port 5000
**Solutions:**
- Change the PORT in `backend/.env` to another port (e.g., 5001)
- Kill the process using port 5000: `lsof -ti:5000 | xargs kill -9` (Mac/Linux)

#### 3. "Cannot GET /api/auth/login"
**Problem:** Backend server is not running
**Solutions:**
- Make sure you started the backend server
- Check the console for any error messages
- Verify the backend is running on http://localhost:5000

#### 4. Frontend shows "Network Error"
**Problem:** Frontend cannot connect to backend
**Solutions:**
- Ensure both frontend and backend are running
- Check if CORS is properly configured
- Verify the API base URL in the frontend

#### 5. "Login failed" with correct credentials
**Problem:** Authentication issues
**Solutions:**
- Run `npm run test-setup` to create/verify test user
- Check browser console for error messages
- Verify JWT secrets are set in `.env`

### Debug Steps

1. **Check Backend Health:**
   ```bash
   curl http://localhost:5000/api/health
   ```
   Should return: `{"status":"OK","timestamp":"..."}`

2. **Check Database Connection:**
   Look for "MongoDB connected" in the backend console

3. **Check Frontend Console:**
   Open browser developer tools and check for any error messages

4. **Check Network Tab:**
   In browser dev tools, verify API calls are being made to the correct URLs

## 📁 Project Structure

```
forensics-ai/
├── backend/                 # Node.js/Express backend
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── services/           # Business logic
│   ├── uploads/            # File uploads
│   └── server.js           # Main server file
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   └── App.js          # Main app component
│   └── public/             # Static files
├── package.json            # Root package.json
└── README.md              # Project documentation
```

## 🎯 Next Steps

Once the application is running:

1. **Explore the Dashboard** - View statistics and quick actions
2. **Create a Case** - Start a new forensic investigation
3. **Upload Evidence** - Add digital evidence files (coming soon)
4. **Generate Reports** - Create AI-powered forensic reports (coming soon)
5. **Check Audit Logs** - Monitor system activity (coming soon)

## 🆘 Getting Help

If you encounter issues:

1. Check this troubleshooting guide
2. Look at the console output for error messages
3. Verify all prerequisites are installed
4. Make sure all services are running
5. Check the main README.md for additional information

## 🔄 Development Workflow

For development:

1. **Backend changes:** Server will auto-restart with nodemon
2. **Frontend changes:** Browser will auto-reload
3. **Database changes:** You may need to restart the backend
4. **Environment changes:** Restart both frontend and backend

---

**Happy coding! 🎉**

The ForensicsAI platform is now ready for development and testing.