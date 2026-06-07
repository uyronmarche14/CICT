import mongoose from 'mongoose';

const MONGODB_URI: string = process.env.MONGODB_URI ?? '';

if (!MONGODB_URI) {
  console.error('MONGODB_URI is required');
  process.exit(1);
}

async function migrate() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;
  if (!db) {
    console.error('Failed to get database connection');
    process.exit(1);
  }

  const result = await db.collection('organizations').updateMany(
    {},
    { $unset: { members: '' } }
  );

  console.log(`Removed members field from ${result.modifiedCount} organizations`);

  await mongoose.disconnect();
  console.log('Migration complete');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
