/**
 * Cleanup Test Data Script
 * Removes test/dummy data that may interfere with AI chatbot functionality
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Configure dotenv to load from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });

// Import models
import Project from '../models/Project.js';
import Phase from '../models/Phase.js';
import Category from '../models/Category.js';
import Item from '../models/Item.js';
import Purchase from '../models/Purchase.js';
import Vendor from '../models/Vendor.js';
import Company from '../models/Company.js';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const cleanupTestData = async () => {
  try {
    await connectDB();

    console.log('🧹 Starting cleanup of test/dummy data...');

    // Find test data patterns (items/vendors with random characters)
    const testVendors = await Vendor.find({
      name: { $regex: /^[a-z]{8,}$/ } // Vendors with random lowercase letters
    });

    const testItems = await Item.find({
      name: { $regex: /^[a-z]{8,}$/ } // Items with random lowercase letters
    });

    console.log(`Found ${testVendors.length} test vendors and ${testItems.length} test items`);

    if (testVendors.length > 0 || testItems.length > 0) {
      const testVendorIds = testVendors.map(v => v._id);
      const testItemIds = testItems.map(i => i._id);

      // Remove test purchases
      const deletedPurchases = await Purchase.deleteMany({
        $or: [
          { vendorId: { $in: testVendorIds } },
          { itemId: { $in: testItemIds } }
        ]
      });

      // Remove test vendors
      const deletedVendors = await Vendor.deleteMany({
        _id: { $in: testVendorIds }
      });

      // Remove test items
      const deletedItems = await Item.deleteMany({
        _id: { $in: testItemIds }
      });

      console.log(`✅ Cleanup completed:`);
      console.log(`   • Removed ${deletedPurchases.deletedCount} test purchases`);
      console.log(`   • Removed ${deletedVendors.deletedCount} test vendors`);
      console.log(`   • Removed ${deletedItems.deletedCount} test items`);
    } else {
      console.log('✅ No test data found to clean up');
    }

    console.log('');
    console.log('💡 Next steps:');
    console.log('   1. Run: npm run seed:tech-plaza');
    console.log('   2. Test AI chatbot with realistic data');
    console.log('   3. Try queries like "Show vendor spending" or "What\'s spent on Grey phase?"');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    mongoose.disconnect();
    console.log('🔌 Database connection closed');
  }
};

// Run the cleanup
console.log('🚀 Starting test data cleanup...');
cleanupTestData()
  .then(() => {
    console.log('✅ Cleanup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Cleanup failed:', error);
    process.exit(1);
  });