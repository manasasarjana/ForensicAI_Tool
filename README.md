# 🛡️ ForensicsAI - Automated Digital Forensics Reporting Tool

A comprehensive digital forensics platform with AI-powered analysis, secure evidence management, and automated report generation for law enforcement and cybersecurity professionals.

## 🚀 Features

### Core Functionality
- **AI-Powered Report Generation** - Automated forensic analysis using LLaMA 2 via HuggingFace API
- **Secure Evidence Management** - SHA-256 integrity verification and chain of custody tracking
- **Professional Report Export** - PDF and DOCX export with court-ready formatting
- **Role-Based Access Control** - Investigator and Administrator roles with proper permissions
- **Comprehensive Audit Logging** - Complete activity tracking for compliance

### Security & Compliance
- **Cryptographic Hashing** - SHA-256 and MD5 hash verification for evidence integrity
- **Chain of Custody** - Detailed tracking of all evidence interactions
- **JWT Authentication** - Secure token-based authentication with refresh tokens
- **Input Validation** - Comprehensive validation using Joi schemas
- **Rate Limiting** - Protection against abuse and DoS attacks

### Professional Workflow
- **Case Management** - Complete case lifecycle from creation to closure
- **Evidence Upload** - Secure file upload with automatic hash generation
- **Version Control** - Report revision history and version tracking
- **Digital Signatures** - Placeholder for digital signature integration
- **Export Capabilities** - Professional PDF and DOCX report generation

## 🏗️ Architecture

```
Frontend (React + Tailwind CSS)
├── Authentication & Authorization
├── Dashboard & Analytics
├── Case Management
├── Evidence Upload & Management
├── AI Report Generation
└── Audit Logging

Backend (Node.js + Express)
├── RESTful API
├── JWT Authentication
├── File Upload & Processing
├── AI Service Integration
├── Database Management
└── Security Middleware

Database (MongoDB)
├── Users & Authentication
├── Cases & Evidence
├── Reports & Versions
├── Audit Logs
└── Chain of Custody
```

## 🛠️ Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. **Install dependencies**
```bash
npm install
```

2. **Environment Configuration**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/forensics-tool
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
HUGGINGFACE_API_KEY=your-huggingface-api-key-here
```

3. **Start Backend Server**
```bash
npm run server
```

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Start Frontend Development Server**
```bash
npm start
```

### Full Development Setup

Run both frontend and backend concurrently:
```bash
npm run dev
```

## 📊 Database Schema

### Users Collection
```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  role: ['investigator', 'admin'],
  firstName: String,
  lastName: String,
  department: String,
  badgeNumber: String,
  isActive: Boolean,
  lastLogin: Date,
  loginHistory: Array
}
```

### Cases Collection
```javascript
{
  caseId: String (auto-generated),
  title: String,
  description: String,
  incidentDate: Date,
  investigator: ObjectId (ref: User),
  status: ['active', 'closed', 'archived'],
  priority: ['low', 'medium', 'high', 'critical'],
  location: String,
  suspects: Array,
  victims: Array,
  tags: Array
}
```

### Evidence Collection
```javascript
{
  caseId: ObjectId (ref: Case),
  evidenceId: String (auto-generated),
  fileName: String,
  originalName: String,
  fileType: String,
  fileSize: Number,
  filePath: String,
  sha256Hash: String,
  md5Hash: String,
  uploadedBy: ObjectId (ref: User),
  chainOfCustody: Array,
  verificationHistory: Array
}
```

### Reports Collection
```javascript
{
  reportId: String (auto-generated),
  caseId: ObjectId (ref: Case),
  title: String,
  status: ['draft', 'processing', 'completed', 'finalized'],
  version: Number,
  generatedBy: ObjectId (ref: User),
  content: {
    executiveSummary: String,
    incidentOverview: String,
    evidenceSummary: String,
    technicalFindings: String,
    timeline: String,
    conclusion: String
  },
  aiGenerated: Boolean,
  revisionHistory: Array
}
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Cases
- `GET /api/cases` - List cases (with pagination/filtering)
- `GET /api/cases/:id` - Get case details
- `POST /api/cases` - Create new case
- `PUT /api/cases/:id` - Update case
- `DELETE /api/cases/:id` - Delete case (admin only)
- `GET /api/cases/stats/dashboard` - Dashboard statistics

### Evidence
- `POST /api/evidence/upload` - Upload evidence files
- `GET /api/evidence/case/:caseId` - Get case evidence
- `GET /api/evidence/:id` - Get evidence details
- `GET /api/evidence/:id/download` - Download evidence file
- `POST /api/evidence/:id/verify` - Verify evidence integrity
- `PUT /api/evidence/:id` - Update evidence metadata
- `DELETE /api/evidence/:id` - Delete evidence (admin only)

### Reports
- `GET /api/reports` - List reports
- `GET /api/reports/:id` - Get report details
- `POST /api/reports` - Create manual report
- `POST /api/reports/generate-ai` - Generate AI report
- `PUT /api/reports/:id` - Update report
- `POST /api/reports/:id/finalize` - Finalize report
- `GET /api/reports/:id/export/pdf` - Export as PDF
- `GET /api/reports/:id/export/docx` - Export as DOCX
- `DELETE /api/reports/:id` - Delete report (admin only)

### Audit Logs
- `GET /api/audit` - Get audit logs
- `GET /api/audit/user/:userId` - Get user activity
- `GET /api/audit/system/summary` - System activity summary (admin)
- `GET /api/audit/security` - Security events (admin)
- `GET /api/audit/export` - Export audit logs (admin)

## 🤖 AI Integration

The platform integrates with AI services for automated report generation:

### Supported AI Models
- **LLaMA 2** via HuggingFace API (primary)
- **Fallback Mock Service** for development/testing

### AI Report Generation Process
1. **Data Collection** - Gather case and evidence information
2. **Prompt Engineering** - Create structured forensic analysis prompt
3. **AI Processing** - Send to AI service for analysis
4. **Response Parsing** - Structure AI output into report sections
5. **Quality Validation** - Ensure response meets forensic standards
6. **Report Storage** - Save with version control and audit trail

### AI Service Configuration
```env
HUGGINGFACE_API_KEY=your-api-key-here
```

## 🔒 Security Features

### Authentication & Authorization
- JWT access tokens (15-minute expiry)
- Refresh tokens (7-day expiry)
- Role-based access control (RBAC)
- Password hashing with bcrypt (12 rounds)

### Data Protection
- SHA-256 hash verification for evidence integrity
- Secure file upload with type validation
- Input sanitization and validation
- HTTPS enforcement (production)
- Helmet.js security headers

### Audit & Compliance
- Comprehensive audit logging
- Chain of custody tracking
- User activity monitoring
- Failed login attempt tracking
- Export capabilities for compliance

## 📈 Deployment

### Production Environment Variables
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/forensics
JWT_SECRET=your-production-jwt-secret
JWT_REFRESH_SECRET=your-production-refresh-secret
HUGGINGFACE_API_KEY=your-production-api-key
FRONTEND_URL=https://your-frontend-domain.com
```

### Deployment Platforms
- **Backend**: Heroku, AWS EC2, DigitalOcean
- **Frontend**: Vercel, Netlify, AWS S3 + CloudFront
- **Database**: MongoDB Atlas
- **File Storage**: AWS S3, Cloudinary

### Build Commands
```bash
# Frontend build
cd frontend && npm run build

# Backend production
npm start
```

## 🧪 Testing

### Backend Testing
```bash
# Run backend tests
npm test

# Run with coverage
npm run test:coverage
```

### Frontend Testing
```bash
# Run frontend tests
cd frontend && npm test

# Run with coverage
cd frontend && npm run test:coverage
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow ESLint configuration
- Write comprehensive tests
- Update documentation
- Follow security best practices
- Maintain audit trail compliance

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the API endpoints
- Verify environment configuration

## 🔮 Roadmap

### Phase 1 (Current)
- ✅ Core authentication system
- ✅ Case management
- ✅ Evidence upload with integrity verification
- ✅ AI report generation framework
- ✅ Audit logging system

### Phase 2 (Upcoming)
- 🔄 Advanced evidence analysis
- 🔄 Real-time notifications
- 🔄 Advanced search and filtering
- 🔄 Bulk operations
- 🔄 API rate limiting enhancements

### Phase 3 (Future)
- 📋 Mobile application
- 📋 Advanced AI models integration
- 📋 Blockchain evidence verification
- 📋 Advanced analytics dashboard
- 📋 Multi-tenant support

---

**Built for digital forensics professionals who demand accuracy, security, and efficiency in their investigations.**