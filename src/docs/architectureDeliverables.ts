export const ARCHITECTURE_DELIVERABLES = {
  step1DatabaseSchema: {
    title: 'Step 1: Database Schema (JSON, SQL & Firestore Structure)',
    description: 'Relational & NoSQL document models designed with data integrity, indexing, and RBAC filtering in mind.',
    firestoreCollections: `
// Collection 1: "users" (Document ID = Firebase Auth UID)
users/{userId}: {
  id: string,               // e.g. "usr_tm_01" (matches request.auth.uid)
  name: string,             // e.g. "Rajesh Sharma"
  email: string,            // e.g. "rajesh.s@fincollect.enterprise"
  role: "manager" | "team_member",
  avatar: string,           // profile photo URL
  department: string,       // e.g. "Enterprise Key Accounts"
  targetMonthlyCollection: number, // Quota e.g. 450000
  createdAt: timestamp
}

// Collection 2: "customers" (Document ID = Auto-generated UUID)
customers/{customerId}: {
  id: string,               // Unique ID
  customerName: string,     // "Apex Industrial Tech Ltd"
  category: "AMC" | "Solution" | "Outstanding",
  totalAmount: number,      // Billed contract amount (Numeric)
  expectedDate: string,     // "2026-09-18" (Date string / timestamp)
  receiptReceived: boolean, // Toggle: true ("Receipt Received") / false ("Not Received")
  receivedAmount: number,   // Cleared/collected funds (Numeric)
  balanceAmount: number,    // Computed: totalAmount - receivedAmount
  remarks: string,          // Call logs, payment promises, transaction IDs
  assignedMemberId: string, // Foreign Key / UID of assigned team member
  assignedMemberName: string, // Cached display name for fast lookup
  clientContact: string,    // Phone number / point of contact
  clientEmail: string,      // Client billing email
  lastFollowupDate: string, // Date of last communication
  createdAt: timestamp,
  updatedAt: timestamp
}
    `.trim(),
    
    sqlDDL: `
-- PostgreSQL / Cloud SQL Relational Schema
CREATE TYPE user_role AS ENUM ('manager', 'team_member');
CREATE TYPE collection_category AS ENUM ('AMC', 'Solution', 'Outstanding');

-- 1. Users / Team Members Table
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(190) UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'team_member',
    avatar TEXT,
    department VARCHAR(100),
    target_monthly_collection NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Customers / Payment Collections Table
CREATE TABLE customers (
    id VARCHAR(64) PRIMARY KEY,
    customer_name VARCHAR(200) NOT NULL,
    category collection_category NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    expected_date DATE NOT NULL,
    receipt_received BOOLEAN NOT NULL DEFAULT FALSE,
    received_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (received_amount >= 0),
    balance_amount NUMERIC(12, 2) GENERATED ALWAYS AS (total_amount - received_amount) STORED,
    remarks TEXT,
    assigned_member_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_contact VARCHAR(50),
    client_email VARCHAR(190),
    last_followup_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Essential Performance & RBAC Indexes
CREATE INDEX idx_customers_assigned_member ON customers(assigned_member_id);
CREATE INDEX idx_customers_expected_date ON customers(expected_date);
CREATE INDEX idx_customers_category ON customers(category);
CREATE INDEX idx_customers_receipt_received ON customers(receipt_received);
    `.trim(),

    jsonSchema: `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "CustomerPaymentRecord",
  "type": "object",
  "properties": {
    "customerName": { "type": "string", "minLength": 2 },
    "category": { "type": "string", "enum": ["AMC", "Solution", "Outstanding"] },
    "totalAmount": { "type": "number", "minimum": 0 },
    "expectedDate": { "type": "string", "format": "date" },
    "receiptReceived": { "type": "boolean" },
    "receivedAmount": { "type": "number", "minimum": 0 },
    "balanceAmount": { "type": "number" },
    "remarks": { "type": "string" },
    "assignedMemberId": { "type": "string" },
    "assignedMemberName": { "type": "string" }
  },
  "required": ["customerName", "category", "totalAmount", "expectedDate", "receiptReceived", "assignedMemberId"]
}`
  },

  step2TechStackComparison: {
    title: 'Step 2: Recommended Tech Stack & Architectural Analysis',
    recommendation: 'Recommendation: React 19 + Tailwind CSS + Firebase (Firestore & Auth)',
    options: [
      {
        name: 'Stack A: Modern React + Firebase (RECOMMENDED FOR SCALE & UI)',
        verdict: 'Best for enterprise experience, real-time sync, strict RBAC, and responsive mobile/desktop UI.',
        pros: [
          'High Performance & Polished UI: Tailored dashboards with instant inline toggles, optimistic updates, and rich data tables.',
          'Granular RBAC Security Rules: Firestore Security Rules enforce at database-level that Team Members cannot query or read other reps data.',
          'Real-time Synchronization: onSnapshot() keeps Manager and Team Member views updated instantly when payments clear.',
          'Low Operating Cost: Firebase free tier covers up to 50k reads/day and 20k writes/day, ideal for growing teams.'
        ],
        cons: [
          'Requires custom deployment (e.g. Firebase Hosting, Cloud Run, or Vercel).',
          'Requires minimal TypeScript/React development expertise.'
        ]
      },
      {
        name: 'Stack B: Google Sheets + AppSheet / Apps Script (RAPID NO-CODE ALTERNATIVE)',
        verdict: 'Best for non-technical teams who already live exclusively in Google Workspace and want zero custom code.',
        pros: [
          'Fast setup: Directly binds to a Google Sheet spreadsheet with columns matching data fields.',
          'Google Workspace SSO: Native login with corporate Google accounts.',
          'Automatic mobile app generation with AppSheet UI templates.'
        ],
        cons: [
          'Limited UI customization and sluggish table updates compared to dedicated React web applications.',
          'AppSheet licensing: Requires $5 to $10/user/month for secure multi-role workflows.',
          'Concurrency limits: Google Sheets API throttles on heavy simultaneous edits from 10+ reps.'
        ]
      }
    ]
  },

  step4RBACImplementation: {
    title: 'Step 4: Backend / Firebase Integration Code for RBAC',
    description: 'Enforcing Role-Based Access Control both on the client query level and the server database security level.',
    clientQuerySnippet: `
// Client-side Firestore querying with automatic role isolation:
import { collection, query, where, onSnapshot, getFirestore } from 'firebase/firestore';

export function subscribeToCustomers(currentUser, onUpdate) {
  const db = getFirestore();
  const customersRef = collection(db, 'customers');
  
  let q;
  if (currentUser.role === 'manager') {
    // Manager: Subscribes to ALL customers across the whole enterprise
    q = query(customersRef);
  } else {
    // Team Member: Server-enforced query restricted strictly to assigned records
    q = query(customersRef, where('assignedMemberId', '==', currentUser.id));
  }
  
  return onSnapshot(q, (snapshot) => {
    const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    onUpdate(records);
  }, (error) => {
    console.error("Firestore permission or network error:", error);
  });
}
    `.trim(),

    rulesSnippet: `
// firestore.rules (Deployed to Cloud Firestore)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isManager() {
      return request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'manager';
    }

    match /customers/{customerId} {
      // Manager can read all; Team Member can only read documents where assignedMemberId matches their UID
      allow read: if isManager() || (request.auth != null && resource.data.assignedMemberId == request.auth.uid);
      
      // Team Member can update payment status, received amount, and remarks for their own customers
      allow update: if isManager() || (
        request.auth != null && 
        resource.data.assignedMemberId == request.auth.uid &&
        request.resource.data.assignedMemberId == request.auth.uid
      );
      
      // Team Member can add a new customer assigned to themselves
      allow create: if isManager() || (
        request.auth != null && request.resource.data.assignedMemberId == request.auth.uid
      );

      // Only manager can delete records
      allow delete: if isManager();
    }
  }
}
    `.trim()
  }
};
