require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./db');

// Import models directly — bypass the pre-save hook by using insertMany with raw data
const User = require('../models/User');
const Election = require('../models/Election');
const Candidate = require('../models/Candidate');

const seed = async () => {
  await connectDB();

  await User.deleteMany({});
  await Election.deleteMany({});
  await Candidate.deleteMany({});
  console.log('Cleared existing data...');

  // Create admin — let the model's pre-save hook hash the password naturally
  const admin = new User({
    fullName: 'System Administrator',
    email: 'admin@voteng.gov.ng',
    phone: '08012345678',
    nin: 'ADMIN0000001',
    voterCardNumber: 'ADMIN-CARD-001',
    password: 'Admin1234',
    role: 'admin',
    isVerified: true,
  });
  await admin.save();
  console.log('Admin created:', admin.email);

  // Create voters — use save() so the pre-save hook hashes passwords correctly
  const voterData = [
    { fullName:'Chukwuemeka Obi', email:'emeka@email.com', phone:'08023456789', nin:'12345678901', voterCardNumber:'NG-LAG-001-2024', state:'Lagos', lga:'Ikeja' },
    { fullName:'Amina Yusuf', email:'amina@email.com', phone:'07034567890', nin:'23456789012', voterCardNumber:'NG-KAN-002-2024', state:'Kano', lga:'Kano Municipal' },
    { fullName:'Ngozi Adeyemi', email:'ngozi@email.com', phone:'09045678901', nin:'34567890123', voterCardNumber:'NG-ABJ-003-2024', state:'FCT', lga:'Abuja Municipal' },
  ];

  for (const v of voterData) {
    const voter = new User({ ...v, password: 'Voter1234', isVerified: true });
    await voter.save();
  }
  console.log('3 voter accounts created');

  // Create election
  const now = new Date();
  const election = await Election.create({
    title: '2024 Student Union Government Election',
    description: 'Annual election for the Student Union Government',
    startDate: new Date(now.getTime() - 60 * 60 * 1000), // started 1 hour ago = already active
    endDate: new Date(now.getTime() + 48 * 60 * 60 * 1000),
    status: 'active', // set to active immediately so you can vote right away
    positions: ['President', 'Vice President', 'Secretary General'],
    createdBy: admin._id,
  });
  console.log('Election created:', election.title);

  const candidates = [
    { fullName:'Babatunde Adewale', party:'Progressive Students Alliance', position:'President', bio:'Final year Engineering student with 3 years leadership experience.', election:election._id, image:'https://ui-avatars.com/api/?name=Babatunde+Adewale&background=0D8ABC&color=fff' },
    { fullName:'Fatima Mohammed', party:'United Students Front', position:'President', bio:'Law student and advocate for student rights.', election:election._id, image:'https://ui-avatars.com/api/?name=Fatima+Mohammed&background=AB2346&color=fff' },
    { fullName:'Emeka Nwosu', party:'Progressive Students Alliance', position:'Vice President', bio:'Science student passionate about academic excellence.', election:election._id, image:'https://ui-avatars.com/api/?name=Emeka+Nwosu&background=12863A&color=fff' },
    { fullName:'Halima Bello', party:'United Students Front', position:'Vice President', bio:'Social Sciences student with community development background.', election:election._id, image:'https://ui-avatars.com/api/?name=Halima+Bello&background=7B3FAB&color=fff' },
    { fullName:'Tunde Okafor', party:'Progressive Students Alliance', position:'Secretary General', bio:'Experienced in student administration.', election:election._id, image:'https://ui-avatars.com/api/?name=Tunde+Okafor&background=C47A1E&color=fff' },
    { fullName:'Chidinma Eze', party:'United Students Front', position:'Secretary General', bio:'Communication Arts student and campus journalist.', election:election._id, image:'https://ui-avatars.com/api/?name=Chidinma+Eze&background=1E7AC4&color=fff' },
  ];
  await Candidate.insertMany(candidates);
  console.log('6 candidates created');

  console.log('\n✅ Seed complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin:  admin@voteng.gov.ng  /  Admin1234');
  console.log('Voter:  emeka@email.com      /  Voter1234');
  console.log('Voter:  amina@email.com      /  Voter1234');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  process.exit(0);
};

seed().catch((err) => { console.error(err); process.exit(1); });
