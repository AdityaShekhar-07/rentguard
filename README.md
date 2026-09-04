# RentGuard

A full-stack property rental audit platform designed to eliminate security deposit disputes through immutable condition logging and automated assessment.

## Architecture

- **Frontend**: React, Tailwind CSS (v4), Vite, jsPDF, Lucide Icons
- **Backend**: Node.js, Express, Multer
- **Database & ORM**: PostgreSQL, Prisma ORM
- **Media Storage**: Cloudinary
- **AI Assessment**: Google Gemini (Multimodal Vision & Damage Classification)
- **Integrity**: Sequential SHA-256 Cryptographic Hash Chaining

## Key Features

1. **Role-Based Portfolios**: Landlord multi-property deployment with unique 6-character tenant join codes; automatic home assignment for tenants.
2. **Sequential SHA-256 Ledger**: Every condition record hashes prior block data with new inspection metadata, creating a tamper-evident audit trail.
3. **Localized AI Vision Damage Appraisal**: Evaluates images, notes, and local geography to classify wear vs. damage and generate local-currency repair estimates.
4. **Mutual Sign-Off & PDF Certificates**: Formal landlord acknowledgement and one-click PDF audit certificate export with complete property and hash metadata.

## Setup Instructions

### Backend
```bash
cd rentguard-backend
npm install
npx prisma db push
npx nodemon server.js
```

### Frontend
```bash
cd rentguard-frontend
npm install
npm run dev
```