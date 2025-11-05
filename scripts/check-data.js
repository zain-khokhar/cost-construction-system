// Quick script to check database contents
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const db = mongoose.connection.db;
    
    // Check all collections
    const collections = ['projects', 'purchases', 'phases', 'items', 'categories', 'vendors'];
    
    for (const collectionName of collections) {
      const count = await db.collection(collectionName).countDocuments();
      console.log(`${collectionName.padEnd(15)}: ${count} documents`);
    }
    
    // Show sample purchase if exists
    const samplePurchase = await db.collection('purchases').findOne();
    if (samplePurchase) {
      console.log('\nSample purchase:');
      console.log(JSON.stringify(samplePurchase, null, 2));
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkData();
