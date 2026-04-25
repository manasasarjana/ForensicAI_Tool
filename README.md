# 🛡️ DigitalForensics: AI-Powered Investigative Suite

**DigitalForensics** is a premium, enterprise-grade platform designed for law enforcement and private investigative agencies. It streamlines the lifecycle of digital forensic cases, from initial evidence ingestion and integrity hashing to AI-driven report generation and administrative oversight.

---

## 🚀 Key Features

### 🔍 Investigator Workspace
- **Case Management**: Create and track cases with unique IDs (`CF-XXXXXXXXXX`).
- **Evidence Vault**: Secure upload with mandatory **SHA-256 integrity hashing** to ensure non-repudiation.
- **AI Narrative Engine**: Automated drafting of forensic reports using Large Language Models (LLMs).
- **Glassmorphism UI**: High-end, eye-friendly "Royal Slate" dark/light mode interface.

### 🛡️ Administrator Control Center
- **User Lifecycle Management**: Securely manage investigator accounts (Delete/View).
- **Global Audit Logs**: Comprehensive real-time tracking of all system actions for legal compliance.
- **Advanced Analytics**: Visual performance trends using Recharts (Activity Origin, Action Distribution).

### ⚖️ Legal & Compliance
- **Cryptographic Integrity**: SHA-256 verification on all evidence downloads.
- **Chain of Custody**: Automatic logging of every evidence interaction.
- **Role-Based Access Control (RBAC)**: Strict isolation between Administrator and Investigator capabilities.

---

## 🏗️ Technical Architecture (MERN Stack)

- **Frontend**: React.js (Context API, Tailwind CSS, Lucide-React).
- **Backend**: Node.js & Express.js.
- **Database**: MongoDB (Mongoose ODM).
- **Security**: JWT (JSON Web Tokens) & BcryptJS.
- **AI**: Integrated LLM interface for automated forensic narratives.

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)

### 1. Clone & Install
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install
cd ..
```

### 2. Environment Configuration
Create a `.env` file in the root and add:
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/digitalforensics
JWT_SECRET=your_secure_random_key_here
```

### 3. Run the Platform
```bash
# Start both Backend & Frontend concurrently
npm run dev
```

---

## 📄 Documentation

We maintain extensive technical documentation for the platform's architecture and lifecycle:

- **[Master SRS & SDLC Report](file:///C:/Users/MANASA/.gemini/antigravity/brain/ef6cc672-dbfb-4773-95ec-5d5389f4b716/SRS_SDLC_DigitalForensics_Extended.md)**: A deep-dive into the 15-20 page technical specification.
- **Word Document Output**: Found at `DigitalForensics_Master_Standard_SRS.docx` for formal submissions.

---

## 🧪 Testing

The platform includes a rigorous testing suite:
- **Security**: Cross-role route protection and 403-Forbidden validation.
- **Integrity**: Byte-by-byte SHA-256 verification tests.
- **UI/UX**: Responsive breakpoint and theme-consistency testing.

---

## 📝 License & Attribution
Prepared by **Group G1081** - Keshav Memorial Institute of Technology.  
Licensed under the MIT License.

---

**Built for digital forensics professionals who demand accuracy, security, and efficiency in their investigations.**