// Run this script with: node scripts/seed.js
// Or use: npm run seed

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: join(__dirname, '..', '.env.local') });

// Import models
async function importModels() {
  const { default: User } = await import('../models/User.js');
  const { default: Company } = await import('../models/Company.js');
  return { User, Company };
}

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const { User, Company } = await importModels();

    // Use fixed ID for testing (matches mockAuth.js)
    const MOCK_COMPANY_ID = '507f1f77bcf86cd799439012';

    // Create default company with fixed ID
    const companyData = {
      _id: MOCK_COMPANY_ID,
      name: 'Demo Construction Company',
      domain: 'democonstruction.com',
      email: 'info@democonstruction.com',
      phone: '+1-555-0100',
      address: '123 Construction Ave, Building City, BC 12345',
      isActive: true,
    };

    let company = await Company.findById(MOCK_COMPANY_ID);

    if (!company) {
      company = await Company.create(companyData);
      console.log('Default company created successfully');
      console.log('Company Name:', company.name);
      console.log('Company ID:', company._id);
    } else {
      console.log('Default company already exists');
      console.log('Company ID:', company._id);
    }

    // Create admin user
    const adminData = {
      name: 'Admin User',
      email: 'admin@admin.com',
      password: 'Admin@123',
      role: 'admin',
      companyId: company._id,
    };

    const existingAdmin = await User.findOne({ email: adminData.email });

    if (existingAdmin) {
      console.log('Admin user already exists');
    } else {
      await User.create(adminData);
      console.log('Admin user created successfully');
      console.log('Email:', adminData.email);
      console.log('Password:', adminData.password);
    }

    console.log('\nSeed completed!');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();
