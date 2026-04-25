const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Case = require('../models/Case');
const Evidence = require('../models/Evidence');
const Report = require('../models/Report');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const fs = require('fs');
const path = require('path');
const { validate, registerSchema, loginSchema } = require('../middleware/validation');
const { auth, adminAuth, auditLogger } = require('../middleware/auth');

const router = express.Router();

// Generate JWT tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

// Test route to create a default user for testing
router.post('/create-test-user', async (req, res) => {
  try {
    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@forensics.com' });
    if (existingUser) {
      return res.json({ message: 'Test user already exists', email: 'test@forensics.com' });
    }

    // Create test user
    const testUser = new User({
      username: 'testuser',
      email: 'test@forensics.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      department: 'Digital Forensics',
      badgeNumber: '12345',
      role: 'investigator'
    });

    await testUser.save();

    res.json({
      message: 'Test user created successfully',
      credentials: {
        email: 'test@forensics.com',
        password: 'password123'
      }
    });
  } catch (error) {
    console.error('Test user creation error:', error);
    res.status(500).json({ message: 'Error creating test user', error: error.message });
  }
});

// Test route to create an admin user for testing
router.post('/create-test-admin', async (req, res) => {
  try {
    // Check if test admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@forensics.com' });
    if (existingAdmin) {
      return res.json({ message: 'Test admin already exists', email: 'admin@forensics.com' });
    }

    // Create test admin user
    const testAdmin = new User({
      username: 'admin_user',
      email: 'admin@forensics.com',
      password: 'admin123456',
      firstName: 'Admin',
      lastName: 'User',
      department: 'Administration',
      badgeNumber: '00001',
      role: 'admin'
    });

    await testAdmin.save();

    res.json({
      message: 'Test admin created successfully',
      credentials: {
        email: 'admin@forensics.com',
        password: 'admin123456',
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Test admin creation error:', error);
    res.status(500).json({ message: 'Error creating test admin', error: error.message });
  }
});

// Test route to create test cases
router.post('/create-test-cases', async (req, res) => {
  try {
    // Get or create test user as investigator
    let testUser = await User.findOne({ email: 'test@forensics.com' });
    if (!testUser) {
      testUser = new User({
        username: 'testuser',
        email: 'test@forensics.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        department: 'Digital Forensics',
        badgeNumber: '12345',
        role: 'investigator'
      });
      await testUser.save();
    }

    // Check if test cases already exist
    const existingCases = await Case.countDocuments({ caseId: { $regex: 'CASE-2026' } });
    if (existingCases > 0) {
      return res.json({ message: 'Test cases already exist', count: existingCases });
    }

    // Create test cases
    const testCasesData = [
      {
        title: 'Cyber Fraud Investigation',
        description: 'Investigation into unauthorized access and fraudulent transactions',
        incidentDate: new Date('2026-02-15'),
        location: 'Online - Multiple Jurisdictions',
        priority: 'critical',
        suspects: [
          { name: 'Unknown Attacker', details: 'Accessed via compromised credentials' }
        ],
        victims: [
          { name: 'John Corporation', details: 'Financial account compromised' }
        ],
        tags: ['fraud', 'cyber', 'financial']
      },
      {
        title: 'Data Breach Analysis',
        description: 'Analysis of unauthorized data exfiltration from company servers',
        incidentDate: new Date('2026-02-10'),
        location: 'Data Center - New York',
        priority: 'high',
        suspects: [
          { name: 'Internal User (TBD)', details: 'Elevated access privileges' }
        ],
        victims: [
          { name: 'TechCorp Inc.', details: '10,000+ customer records exposed' }
        ],
        tags: ['breach', 'data', 'servers']
      },
      {
        title: 'Insider Threat Investigation',
        description: 'Investigation into potential insider threat activities',
        incidentDate: new Date('2026-02-08'),
        location: 'Corporate Office - Los Angeles',
        priority: 'high',
        suspects: [
          { name: 'Employee - Dept. IT', details: 'Suspicious access patterns' }
        ],
        victims: [
          { name: 'Finance Department', details: 'Access to confidential records' }
        ],
        tags: ['insider', 'threat', 'access']
      },
      {
        title: 'Ransomware Incident',
        description: 'Analysis of ransomware attack on hospital systems',
        incidentDate: new Date('2026-02-05'),
        location: 'Medical Facility - Chicago',
        priority: 'critical',
        suspects: [
          { name: 'International Ransomware Group', details: 'LockBit variant detected' }
        ],
        victims: [
          { name: 'Healthcare Systems Inc.', details: 'Patient data at risk' }
        ],
        tags: ['ransomware', 'malware', 'healthcare']
      },
      {
        title: 'Social Media Harassment Case',
        description: 'Investigation into coordinated harassment campaign on social platforms',
        incidentDate: new Date('2026-02-01'),
        location: 'Online - Twitter/Instagram',
        priority: 'medium',
        suspects: [
          { name: 'Multiple Unknown Accounts', details: '50+ accounts identified' }
        ],
        victims: [
          { name: 'Public Figure - Jane Smith', details: 'Defamation and harassment' }
        ],
        tags: ['harassment', 'social-media', 'cyberbullying']
      }
    ];

    const createdCases = [];
    const year = new Date().getFullYear();
    
    for (let i = 0; i < testCasesData.length; i++) {
      const newCase = new Case({
        ...testCasesData[i],
        investigator: testUser._id,
        status: 'active',
        caseId: `CASE-${year}-${String(i + 1).padStart(3, '0')}`
      });
      await newCase.save();
      createdCases.push({
        _id: newCase._id,
        caseId: newCase.caseId,
        title: newCase.title
      });
    }

    res.json({
      message: `${createdCases.length} test cases created successfully`,
      cases: createdCases
    });
  } catch (error) {
    console.error('Test cases creation error:', error);
    res.status(500).json({ message: 'Error creating test cases', error: error.message });
  }
});

// Register
router.post('/register',
  validate(registerSchema),
  async (req, res) => {
    try {
      const { username, email, password, firstName, lastName, department, badgeNumber, role } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }]
      });

      if (existingUser) {
        return res.status(400).json({
          message: 'User already exists with this email or username'
        });
      }

      // Create new user
      const user = new User({
        username,
        email,
        password,
        firstName,
        lastName,
        department,
        badgeNumber,
        role: role || 'investigator'
      });

      await user.save();

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user._id);

      res.status(201).json({
        message: 'User registered successfully',
        user: user.toJSON(),
        accessToken,
        refreshToken
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Server error during registration' });
    }
  }
);

// Login
router.post('/login',
  validate(loginSchema),
  async (req, res) => {
    try {
      console.log('Login attempt:', { email: req.body.email });

      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email });
      console.log('User found:', user ? 'Yes' : 'No');

      if (!user || !user.isActive) {
        console.log('User not found or inactive');
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      console.log('Password match:', isMatch);

      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Update login info
      user.lastLogin = new Date();
      user.loginHistory.push({
        timestamp: new Date(),
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      });

      // Keep only last 10 login records
      if (user.loginHistory.length > 10) {
        user.loginHistory = user.loginHistory.slice(-10);
      }

      await user.save();

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user._id);

      console.log('Login successful for user:', user.email);

      res.json({
        message: 'Login successful',
        user: user.toJSON(),
        accessToken,
        refreshToken
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error during login', error: error.message });
    }
  }
);

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret'
    );

    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);

    res.json({
      accessToken,
      refreshToken: newRefreshToken
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

// Logout
router.post('/logout',
  auth,
  async (req, res) => {
    try {
      // In a production app, you might want to blacklist the token
      res.json({ message: 'Logout successful' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ message: 'Server error during logout' });
    }
  }
);

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password -loginHistory');
    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile
router.put('/profile',
  auth,
  async (req, res) => {
    try {
      const { firstName, lastName, department, badgeNumber } = req.body;

      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update allowed fields
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (department !== undefined) user.department = department;
      if (badgeNumber !== undefined) user.badgeNumber = badgeNumber;

      await user.save();

      res.json({
        message: 'Profile updated successfully',
        user: user.toJSON()
      });

    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ message: 'Server error during profile update' });
    }
  }
);

// Change password
router.put('/change-password',
  auth,
  async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current and new passwords are required' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters' });
      }

      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Verify current password
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      res.json({ message: 'Password changed successfully' });

    } catch (error) {
      console.error('Password change error:', error);
      res.status(500).json({ message: 'Server error during password change' });
    }
  }
);

// Get all users (Admin only)
router.get('/users',
  auth, adminAuth,
  async (req, res) => {
    try {
      // Select all fields except password
      const users = await User.find().select('-password').sort({ createdAt: -1 });
      res.json({ users });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({ message: 'Server error fetching users' });
    }
  }
);

// Delete user (Admin only)
router.delete('/users/:id',
  auth, adminAuth,
  async (req, res) => {
    try {
      const userId = req.params.id;
      
      // Prevent deleting self
      if (userId === req.userId.toString()) {
        return res.status(400).json({ message: 'Cannot delete your own admin account' });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // --- CASCADING DELETION ---
      
      // 1. Find all cases created by this user
      const userCases = await Case.find({ investigator: userId });
      const caseIds = userCases.map(c => c._id);

      // 2. Cleanup Evidence and Files for these cases
      const evidenceList = await Evidence.find({ caseId: { $in: caseIds } });
      for (const evidence of evidenceList) {
        if (evidence.filePath && fs.existsSync(evidence.filePath)) {
          try {
            fs.unlinkSync(evidence.filePath);
          } catch (err) {
            console.error(`Failed to delete evidence file: ${evidence.filePath}`, err);
          }
        }
      }
      await Evidence.deleteMany({ caseId: { $in: caseIds } });

      // 3. Cleanup Reports and Exported Files for these cases
      const reportsList = await Report.find({ caseId: { $in: caseIds } });
      for (const report of reportsList) {
        if (report.exports && report.exports.length > 0) {
          for (const exp of report.exports) {
            if (exp.filePath && fs.existsSync(exp.filePath)) {
              try {
                fs.unlinkSync(exp.filePath);
              } catch (err) {
                console.error(`Failed to delete report export: ${exp.filePath}`, err);
              }
            }
          }
        }
      }
      await Report.deleteMany({ caseId: { $in: caseIds } });

      // 4. Delete the cases
      await Case.deleteMany({ investigator: userId });

      // 5. Delete notifications for the user
      await Notification.deleteMany({ userId });

      // 6. Finally delete the user
      await User.findByIdAndDelete(userId);

      // Log the deletion
      console.log(`User ${user.email} and all their ${userCases.length} cases deleted by Admin ${req.userId}`);

      res.json({ 
        message: 'User and all associated cases, evidence, and reports deleted successfully',
        details: {
          userDeleted: user.email,
          casesDeleted: userCases.length,
          evidenceDeleted: evidenceList.length,
          reportsDeleted: reportsList.length
        }
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ message: 'Server error during cascading user deletion' });
    }
  }
);

module.exports = router;