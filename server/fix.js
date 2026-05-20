require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const result = await mongoose.connection.collection('users').deleteMany({ isVerified: false });
  console.log('Cleaned up unverified accounts:', result.deletedCount);
  
  // Also delete any account with these specific emails
  const result2 = await mongoose.connection.collection('users').deleteMany({ 
    email: { $in: ['amarachiikeji5@gmail.com', 'angeliskaikeji13@gmail.com'] },
    role: 'voter'
  });
  console.log('Deleted test accounts:', result2.deletedCount);
  
  process.exit(0);
});
