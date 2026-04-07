/**
 * Create Technician User Script
 * 
 * Usage: node create-tech-user.js
 * 
 * This script creates a technician user with a linked Tech record.
 * Run this from the backend-api directory.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// User Schema (minimal)
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: { type: String, default: '' },
  role: { type: String, enum: ['admin', 'technician'], default: 'admin' },
  techId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tech', default: null },
}, { timestamps: true });

// Tech Schema (minimal)
const TechSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  technicianCode: { type: String, unique: true },
  active: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Tech = mongoose.models.Tech || mongoose.model('Tech', TechSchema);

// Counter for technician codes
const CounterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  prefix: { type: String, default: '' },
  seq: { type: Number, default: 0 },
}, { timestamps: true });
const Counter = mongoose.models.Counter || mongoose.model('Counter', CounterSchema);

async function getNextSequence(name, prefix = '') {
  const counter = await Counter.findOneAndUpdate(
    { name },
    { $inc: { seq: 1 }, $setOnInsert: { prefix } },
    { new: true, upsert: true }
  );
  return counter.seq;
}

async function createTechnician() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('❌ Missing MONGODB_URI in .env');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Configuration - CHANGE THESE VALUES
    const TECH_NAME = 'Test Technician';
    const TECH_EMAIL = 'tech@test.com';
    const TECH_PASSWORD = 'password123';
    const ADMIN_CREATOR_ID = '000000000000000000000000'; // Placeholder - will be updated

    // Check if user already exists
    const existingUser = await User.findOne({ email: TECH_EMAIL });
    if (existingUser) {
      console.log('⚠️  User already exists:', TECH_EMAIL);
      console.log('   You can log in with this account.');
      await mongoose.disconnect();
      process.exit(0);
    }

    // Create Tech record first
    const seq = await getNextSequence('tech', 'TECH');
    const technicianCode = `TECH-${String(seq).padStart(3, '0')}`;

    const tech = await Tech.create({
      name: TECH_NAME,
      email: TECH_EMAIL,
      phone: '',
      technicianCode,
      active: true,
      createdBy: ADMIN_CREATOR_ID
    });
    console.log('✅ Created Tech record:', tech.name, '(', technicianCode, ')');

    // Create User record linked to Tech
    const passwordHash = await bcrypt.hash(TECH_PASSWORD, 10);
    const user = await User.create({
      name: TECH_NAME,
      email: TECH_EMAIL,
      passwordHash,
      role: 'technician',
      techId: tech._id
    });
    console.log('✅ Created User record:', user.email, '(role: technician)');

    console.log('\n🎉 Technician account created successfully!');
    console.log('\n📧 Login Credentials:');
    console.log('   Email:', TECH_EMAIL);
    console.log('   Password:', TECH_PASSWORD);
    console.log('   Role: technician');
    console.log('   Tech ID:', tech._id.toString());

    await mongoose.disconnect();
    process.exit(0);
  } catch (e) {
    console.error('❌ Error:', e.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

createTechnician();
