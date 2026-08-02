require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const Category = require('../models/Category');
const Event = require('../models/Event');
const User = require('../models/User');

const categoriesData = [
  { name: 'Music', description: 'Concerts, gigs, and live performances' },
  { name: 'Tech', description: 'Conferences, workshops, and hackathons' },
  { name: 'Sports', description: 'Tournaments, matches, and fitness events' },
];

const adminData = {
  name: 'Admin User',
  email: 'admin@eventpulse.com',
  password: 'Admin@123',
  role: 'admin',
};

const seed = async () => {
  await connectDB();

  // Upsert categories so re-running this script never creates duplicates.
  const categoryDocs = {};
  for (const cat of categoriesData) {
    const doc = await Category.findOneAndUpdate(
      { name: cat.name },
      { $setOnInsert: cat },
      { upsert: true, new: true }
    );
    categoryDocs[cat.name] = doc;
  }
  console.log(`Categories ready: ${Object.keys(categoryDocs).join(', ')}`);

  // Only create the admin if it doesn't already exist.
  let admin = await User.findOne({ email: adminData.email });
  if (!admin) {
    const hashedPassword = await bcrypt.hash(adminData.password, 12);
    admin = await User.create({ ...adminData, password: hashedPassword });
    console.log(`Admin user created: ${admin.email} (password: ${adminData.password})`);
  } else {
    console.log(`Admin user already exists: ${admin.email}`);
  }

  const eventsData = [
    {
      name: 'Cairo Jazz Night',
      description: 'An evening of live jazz in the heart of Cairo.',
      category: categoryDocs.Music._id,
      date: new Date('2026-09-15T19:00:00Z'),
      city: 'Cairo',
      capacity: 150,
    },
    {
      name: 'DEPI Tech Summit',
      description: 'Talks and workshops on backend engineering and cloud deployment.',
      category: categoryDocs.Tech._id,
      date: new Date('2026-10-05T09:00:00Z'),
      city: 'Port Said',
      capacity: 300,
    },
    {
      name: 'Alexandria Beach Run',
      description: 'A 10K community run along the Alexandria coastline.',
      category: categoryDocs.Sports._id,
      date: new Date('2026-08-20T06:30:00Z'),
      city: 'Alexandria',
      capacity: 500,
    },
  ];

  // Upsert on (name, city) so re-running this script never duplicates events.
  for (const evt of eventsData) {
    await Event.findOneAndUpdate(
      { name: evt.name, city: evt.city },
      { $setOnInsert: evt },
      { upsert: true, new: true }
    );
  }
  console.log(`Sample events ready: ${eventsData.map((e) => e.name).join(', ')}`);

  console.log('Seeding complete.');
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
