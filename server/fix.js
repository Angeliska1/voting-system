require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const result = await mongoose.connection.collection('users').deleteMany({ isVerified: false });
  console.log('Cleaned up:', result.deletedCount, 'unverified accounts');
  process.exit(0);
});