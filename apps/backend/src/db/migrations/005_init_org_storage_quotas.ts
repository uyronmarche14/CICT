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

  const orgs = await db.collection('organizations').find({}).project({ _id: 1, id: 1 }).toArray();
  console.log(`Found ${orgs.length} organizations`);

  let created = 0;
  for (const org of orgs) {
    const existing = await db.collection('organizationstoragequotas').findOne({ organizationId: org.id });
    if (existing) {
      console.log(`  Skipping ${org.id}: quota already exists`);
      continue;
    }

    await db.collection('organizationstoragequotas').insertOne({
      organizationId: org.id,
      storageLimitMb: 100,
      monthlyUploadLimitMb: 100,
      maxFileSizeMb: 5,
      usedStorageBytes: 0,
      usedUploadBytesThisMonth: 0,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      blockedMimeTypes: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    created++;
    console.log(`  Created quota for ${org.id}`);
  }

  console.log(`\nCreated ${created} new quotas`);
  await mongoose.disconnect();
  console.log('Migration complete');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
