const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB...');

  const collection = mongoose.connection.collection('users');

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('password123', salt);

  // Update mehak@gmail.com with password and details, remove college record
  await collection.updateOne(
    { email: 'mehak@gmail.com' },
    {
      $set: {
        name: 'Mehak',
        pic: '/mehak-profile.jpg',
        password: hash,
        program: 'Class 12th Passed',
      },
      $unset: {
        'academicRecords.college': '',
      },
    }
  );

  const mehakUser = await collection.findOne({ email: 'mehak@gmail.com' });
  console.log('Verified mehak@gmail.com:', {
    name: mehakUser.name,
    email: mehakUser.email,
    pic: mehakUser.pic,
    hasPassword: !!mehakUser.password,
  });

  process.exit(0);
}

main().catch(console.error);
