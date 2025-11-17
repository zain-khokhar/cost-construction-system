/**
 * Tech Plaza Project Data Seeder
 * Creates comprehensive sample data for AI chatbot testing
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
import User from '../models/User.js';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedTechPlazaProject = async () => {
  try {
    await connectDB();

    // Find the first company (assuming it exists from main seed)
    const company = await Company.findOne();
    if (!company) {
      console.error('❌ No company found. Please run main seed script first.');
      return;
    }

    // Find the first user to use as createdBy
    const user = await User.findOne({ companyId: company._id });
    if (!user) {
      console.error('❌ No user found. Please run main seed script first.');
      return;
    }

    console.log('🏗️ Creating Tech Plaza project data...');

    // Create Tech Plaza Project
    const project = await Project.create({
      name: 'Tech Plaza',
      client: 'NextGen Technologies Inc.',
      location: '1250 Innovation Drive, Silicon Valley, CA',
      description: 'Modern 15-story commercial office building with smart building technology, underground parking, and rooftop gardens',
      startDate: new Date('2024-03-15'),
      endDate: new Date('2025-08-30'),
      totalBudget: 45000000, // $45M
      status: 'ongoing',
      createdBy: user._id,
      companyId: company._id
    });

    // Create Phases (using only allowed enum values: 'Grey' and 'Finishing')
    const phases = await Phase.insertMany([
      {
        name: 'Grey',
        description: 'Foundation, structure, MEP rough-in, and core construction work',
        projectId: project._id,
        companyId: company._id,
        status: 'In Progress',
        progressPercentage: 65
      },
      {
        name: 'Finishing',
        description: 'Interior finishes, exterior facade, technology systems, and landscaping',
        projectId: project._id,
        companyId: company._id,
        status: 'Not Started',
        progressPercentage: 0
      }
    ]);

    // Create Categories
    const categories = await Category.insertMany([
      // Grey Phase Categories (Foundation, Structure, MEP)
      { name: 'Excavation Equipment', description: 'Heavy machinery for site preparation', phaseId: phases[0]._id, projectId: project._id, companyId: company._id },
      { name: 'Concrete Materials', description: 'Concrete, rebar, and foundation materials', phaseId: phases[0]._id, projectId: project._id, companyId: company._id },
      { name: 'Steel Structure', description: 'Structural steel beams, columns, and connections', phaseId: phases[0]._id, projectId: project._id, companyId: company._id },
      { name: 'Precast Concrete', description: 'Precast concrete elements and panels', phaseId: phases[0]._id, projectId: project._id, companyId: company._id },
      { name: 'HVAC Systems', description: 'Heating, ventilation, and air conditioning', phaseId: phases[0]._id, projectId: project._id, companyId: company._id },
      { name: 'Electrical Infrastructure', description: 'Power distribution, lighting, and electrical panels', phaseId: phases[0]._id, projectId: project._id, companyId: company._id },
      { name: 'Plumbing Systems', description: 'Water supply, drainage, and plumbing fixtures', phaseId: phases[0]._id, projectId: project._id, companyId: company._id },
      
      // Finishing Phase Categories (Interior, Technology, Exterior)
      { name: 'Flooring Systems', description: 'Various flooring materials and installation', phaseId: phases[1]._id, projectId: project._id, companyId: company._id },
      { name: 'Wall Systems', description: 'Drywall, partitions, and wall finishes', phaseId: phases[1]._id, projectId: project._id, companyId: company._id },
      { name: 'Ceiling Systems', description: 'Suspended ceilings and ceiling finishes', phaseId: phases[1]._id, projectId: project._id, companyId: company._id },
      { name: 'Smart Building Tech', description: 'IoT sensors, building automation systems', phaseId: phases[1]._id, projectId: project._id, companyId: company._id },
      { name: 'Security Systems', description: 'Access control, cameras, and security infrastructure', phaseId: phases[1]._id, projectId: project._id, companyId: company._id },
      { name: 'Network Infrastructure', description: 'Data cabling, wireless systems, and network equipment', phaseId: phases[1]._id, projectId: project._id, companyId: company._id },
      { name: 'Curtain Wall', description: 'Glass facade and exterior wall systems', phaseId: phases[1]._id, projectId: project._id, companyId: company._id },
      { name: 'Landscaping Materials', description: 'Plants, irrigation, and landscape features', phaseId: phases[1]._id, projectId: project._id, companyId: company._id }
    ]);

    // Create Vendors
    const vendors = await Vendor.insertMany([
      { name: 'Sierra Construction Supply', contact: 'Mike Rodriguez', email: 'mike@sierraconst.com', phone: '(555) 123-4567', companyId: company._id },
      { name: 'TechFlow HVAC Solutions', contact: 'Sarah Chen', email: 'sarah@techflow.com', phone: '(555) 234-5678', companyId: company._id },
      { name: 'Metropolitan Steel Works', contact: 'James Patterson', email: 'james@metrosteel.com', phone: '(555) 345-6789', companyId: company._id },
      { name: 'Smart Building Technologies', contact: 'David Kim', email: 'david@smartbuilding.com', phone: '(555) 456-7890', companyId: company._id },
      { name: 'Premier Flooring Solutions', contact: 'Lisa Thompson', email: 'lisa@premierflooring.com', phone: '(555) 567-8901', companyId: company._id },
      { name: 'GreenScape Landscaping', contact: 'Robert Green', email: 'robert@greenscape.com', phone: '(555) 678-9012', companyId: company._id },
      { name: 'Advanced Security Systems', contact: 'Maria Garcia', email: 'maria@advancedsecurity.com', phone: '(555) 789-0123', companyId: company._id },
      { name: 'Crystal Clear Glass & Glazing', contact: 'John Wilson', email: 'john@crystalclear.com', phone: '(555) 890-1234', companyId: company._id }
    ]);

    // Create Items for each category
    const items = [];

    // Grey Phase Items (Foundation, Structure, MEP)
    const greyPhaseItems = [
      // Foundation items
      { name: 'Excavator (CAT 336)', unit: 'hours', ratePerUnit: 125.00, categoryId: categories[0]._id, companyId: company._id },
      { name: 'High-Strength Concrete (5000 PSI)', unit: 'cubic_yards', ratePerUnit: 180.50, categoryId: categories[1]._id, companyId: company._id },
      { name: 'Rebar Grade 60', unit: 'tons', ratePerUnit: 2800.00, categoryId: categories[1]._id, companyId: company._id },
      // Structural items
      { name: 'W14x90 Steel Beams', unit: 'linear_feet', ratePerUnit: 85.75, categoryId: categories[2]._id, companyId: company._id },
      { name: 'Precast Concrete Panels', unit: 'square_feet', ratePerUnit: 45.25, categoryId: categories[3]._id, companyId: company._id },
      { name: 'Structural Steel Columns', unit: 'pieces', ratePerUnit: 1250.00, categoryId: categories[2]._id, companyId: company._id },
      // MEP items
      { name: 'VRF HVAC System', unit: 'units', ratePerUnit: 18500.00, categoryId: categories[4]._id, companyId: company._id },
      { name: 'LED Lighting Fixtures', unit: 'fixtures', ratePerUnit: 145.00, categoryId: categories[5]._id, companyId: company._id },
      { name: 'Electrical Panels', unit: 'panels', ratePerUnit: 2850.00, categoryId: categories[5]._id, companyId: company._id },
      { name: 'Plumbing Fixtures', unit: 'units', ratePerUnit: 385.00, categoryId: categories[6]._id, companyId: company._id }
    ];

    // Finishing Phase Items (Interior, Technology, Exterior)
    const finishingPhaseItems = [
      // Interior items
      { name: 'Luxury Vinyl Plank Flooring', unit: 'square_feet', ratePerUnit: 12.85, categoryId: categories[7]._id, companyId: company._id },
      { name: 'Acoustic Ceiling Tiles', unit: 'square_feet', ratePerUnit: 8.50, categoryId: categories[9]._id, companyId: company._id },
      { name: 'Glass Office Partitions', unit: 'linear_feet', ratePerUnit: 125.00, categoryId: categories[8]._id, companyId: company._id },
      // Technology items
      { name: 'Smart Thermostats', unit: 'units', ratePerUnit: 385.00, categoryId: categories[10]._id, companyId: company._id },
      { name: 'Access Control System', unit: 'doors', ratePerUnit: 1250.00, categoryId: categories[11]._id, companyId: company._id },
      { name: 'IP Security Cameras', unit: 'cameras', ratePerUnit: 485.00, categoryId: categories[11]._id, companyId: company._id },
      { name: 'Cat6A Network Cabling', unit: 'linear_feet', ratePerUnit: 3.25, categoryId: categories[12]._id, companyId: company._id },
      // Exterior items
      { name: 'Curtain Wall System', unit: 'square_feet', ratePerUnit: 285.00, categoryId: categories[13]._id, companyId: company._id },
      { name: 'Rooftop Garden Plants', unit: 'plants', ratePerUnit: 45.00, categoryId: categories[14]._id, companyId: company._id },
      { name: 'Irrigation System', unit: 'zones', ratePerUnit: 2800.00, categoryId: categories[14]._id, companyId: company._id }
    ];

    items.push(...greyPhaseItems, ...finishingPhaseItems);
    const createdItems = await Item.insertMany(items);

    // Create realistic purchases with varying dates and vendors
    const purchases = [];
    const purchaseDates = [
      new Date('2024-03-20'), new Date('2024-04-15'), new Date('2024-05-10'),
      new Date('2024-06-05'), new Date('2024-07-01'), new Date('2024-08-15'),
      new Date('2024-09-10'), new Date('2024-10-05'), new Date('2024-11-01'),
      new Date('2024-11-15'), new Date('2024-12-01'), new Date('2025-01-10')
    ];

    // Foundation Purchases
    purchases.push(
      { itemId: createdItems[0]._id, categoryId: categories[0]._id, phaseId: phases[0]._id, vendorId: vendors[0]._id, quantity: 240, pricePerUnit: 125.00, totalCost: 30000, purchaseDate: purchaseDates[0], projectId: project._id, companyId: company._id },
      { itemId: createdItems[1]._id, categoryId: categories[1]._id, phaseId: phases[0]._id, vendorId: vendors[0]._id, quantity: 850, pricePerUnit: 180.50, totalCost: 153425, purchaseDate: purchaseDates[0], projectId: project._id, companyId: company._id },
      { itemId: createdItems[2]._id, categoryId: categories[1]._id, phaseId: phases[0]._id, vendorId: vendors[0]._id, quantity: 45, pricePerUnit: 2800.00, totalCost: 126000, purchaseDate: purchaseDates[1], projectId: project._id, companyId: company._id }
    );

    // Structural Purchases
    purchases.push(
      { itemId: createdItems[3]._id, categoryId: categories[2]._id, phaseId: phases[0]._id, vendorId: vendors[2]._id, quantity: 1200, pricePerUnit: 85.75, totalCost: 102900, purchaseDate: purchaseDates[2], projectId: project._id, companyId: company._id },
      { itemId: createdItems[4]._id, categoryId: categories[3]._id, phaseId: phases[0]._id, vendorId: vendors[2]._id, quantity: 2800, pricePerUnit: 45.25, totalCost: 126700, purchaseDate: purchaseDates[3], projectId: project._id, companyId: company._id },
      { itemId: createdItems[5]._id, categoryId: categories[2]._id, phaseId: phases[0]._id, vendorId: vendors[2]._id, quantity: 180, pricePerUnit: 1250.00, totalCost: 225000, purchaseDate: purchaseDates[2], projectId: project._id, companyId: company._id }
    );

    // MEP Purchases
    purchases.push(
      { itemId: createdItems[6]._id, categoryId: categories[4]._id, phaseId: phases[0]._id, vendorId: vendors[1]._id, quantity: 25, pricePerUnit: 18500.00, totalCost: 462500, purchaseDate: purchaseDates[4], projectId: project._id, companyId: company._id },
      { itemId: createdItems[7]._id, categoryId: categories[5]._id, phaseId: phases[0]._id, vendorId: vendors[1]._id, quantity: 485, pricePerUnit: 145.00, totalCost: 70325, purchaseDate: purchaseDates[5], projectId: project._id, companyId: company._id },
      { itemId: createdItems[8]._id, categoryId: categories[10]._id, phaseId: phases[1]._id, vendorId: vendors[3]._id, quantity: 120, pricePerUnit: 385.00, totalCost: 46200, purchaseDate: purchaseDates[6], projectId: project._id, companyId: company._id },
      { itemId: createdItems[9]._id, categoryId: categories[5]._id, phaseId: phases[0]._id, vendorId: vendors[1]._id, quantity: 15, pricePerUnit: 2850.00, totalCost: 42750, purchaseDate: purchaseDates[4], projectId: project._id, companyId: company._id }
    );

    // Interior Purchases
    purchases.push(
      { itemId: createdItems[10]._id, categoryId: categories[7]._id, phaseId: phases[1]._id, vendorId: vendors[4]._id, quantity: 12500, pricePerUnit: 12.85, totalCost: 160625, purchaseDate: purchaseDates[7], projectId: project._id, companyId: company._id },
      { itemId: createdItems[11]._id, categoryId: categories[9]._id, phaseId: phases[1]._id, vendorId: vendors[4]._id, quantity: 8200, pricePerUnit: 8.50, totalCost: 69700, purchaseDate: purchaseDates[8], projectId: project._id, companyId: company._id },
      { itemId: createdItems[12]._id, categoryId: categories[8]._id, phaseId: phases[1]._id, vendorId: vendors[4]._id, quantity: 450, pricePerUnit: 125.00, totalCost: 56250, purchaseDate: purchaseDates[9], projectId: project._id, companyId: company._id }
    );

    // Technology Purchases
    purchases.push(
      { itemId: createdItems[13]._id, categoryId: categories[11]._id, phaseId: phases[1]._id, vendorId: vendors[6]._id, quantity: 85, pricePerUnit: 1250.00, totalCost: 106250, purchaseDate: purchaseDates[10], projectId: project._id, companyId: company._id },
      { itemId: createdItems[14]._id, categoryId: categories[11]._id, phaseId: phases[1]._id, vendorId: vendors[6]._id, quantity: 65, pricePerUnit: 485.00, totalCost: 31525, purchaseDate: purchaseDates[10], projectId: project._id, companyId: company._id },
      { itemId: createdItems[15]._id, categoryId: categories[12]._id, phaseId: phases[1]._id, vendorId: vendors[3]._id, quantity: 8500, pricePerUnit: 3.25, totalCost: 27625, purchaseDate: purchaseDates[9], projectId: project._id, companyId: company._id }
    );

    // Exterior Purchases
    purchases.push(
      { itemId: createdItems[16]._id, categoryId: categories[13]._id, phaseId: phases[1]._id, vendorId: vendors[7]._id, quantity: 3200, pricePerUnit: 285.00, totalCost: 912000, purchaseDate: purchaseDates[11], projectId: project._id, companyId: company._id },
      { itemId: createdItems[17]._id, categoryId: categories[14]._id, phaseId: phases[1]._id, vendorId: vendors[5]._id, quantity: 250, pricePerUnit: 45.00, totalCost: 11250, purchaseDate: purchaseDates[11], projectId: project._id, companyId: company._id },
      { itemId: createdItems[18]._id, categoryId: categories[14]._id, phaseId: phases[1]._id, vendorId: vendors[5]._id, quantity: 12, pricePerUnit: 2800.00, totalCost: 33600, purchaseDate: purchaseDates[11], projectId: project._id, companyId: company._id }
    );

    await Purchase.insertMany(purchases);

    console.log('✅ Tech Plaza project data created successfully!');
    console.log('\n📊 Project Summary:');
    console.log(`🏗️ Project: ${project.name}`);
    console.log(`🏢 Client: ${project.client}`);
    console.log(`💰 Budget: $${project.totalBudget.toLocaleString()}`);
    console.log(`📅 Duration: ${project.startDate.toDateString()} - ${project.endDate.toDateString()}`);
    console.log(`\n📈 Data Created:`);
    console.log(`   • ${phases.length} Phases`);
    console.log(`   • ${categories.length} Categories`);
    console.log(`   • ${items.length} Items`);
    console.log(`   • ${purchases.length} Purchases`);
    console.log(`   • ${vendors.length} Vendors`);
    console.log('\n🤖 Your AI Chatbot can now answer questions like:');
    console.log('   • "What is the total spent on HVAC systems?"');
    console.log('   • "Show me all purchases from TechFlow HVAC Solutions"');
    console.log('   • "Which phase has the highest spending?"');
    console.log('   • "List all vendors for the Grey phase"');
    console.log('   • "What are the most expensive items in Tech Plaza?"');
    console.log('   • "Show spending breakdown by category"');
    console.log('   • "How much have we spent on the Finishing phase?"');
    console.log('   • "Compare Grey phase vs Finishing phase costs"');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    mongoose.disconnect();
    console.log('🔌 Database connection closed');
  }
};

// Run the seeder immediately with proper async handling
console.log('🚀 Starting Tech Plaza project seeder...');
seedTechPlazaProject()
  .then(() => {
    console.log('✅ Seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  });