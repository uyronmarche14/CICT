import mongoose from 'mongoose';

const MONGODB_URI: string = process.env.MONGODB_URI ?? '';

if (!MONGODB_URI) {
  console.error('MONGODB_URI is required');
  process.exit(1);
}

const MODELS_TO_MIGRATE = [
  'OrganizationMember',
  'OrgTask',
  'OrgMeeting',
  'OrgBudget',
  'OrgVote',
  'OrgTransaction',
  'OrgTaskForce',
  'ResourceRequest',
  'CollaborationSpace',
];

async function migrate() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;
  if (!db) {
    console.error('Failed to get database connection');
    process.exit(1);
  }

  // Build ObjectId -> slug map
  const orgs = await db.collection('organizations').find({}).project({ _id: 1, id: 1 }).toArray();
  const orgMap = new Map(orgs.map((o: any) => [String(o._id), o.id]));
  console.log(`Found ${orgMap.size} organizations to map`);

  let totalUpdated = 0;

  for (const collectionName of MODELS_TO_MIGRATE) {
    const docs = await db.collection(collectionName.toLowerCase()).find({
      organizationId: { $type: 'objectId' },
    }).project({ _id: 1, organizationId: 1 }).toArray();

    if (docs.length === 0) {
      console.log(`  ${collectionName}: no ObjectId refs to convert`);
      continue;
    }

    let converted = 0;
    for (const doc of docs) {
      const slug = orgMap.get(String(doc.organizationId));
      if (slug) {
        await db.collection(collectionName.toLowerCase()).updateOne(
          { _id: doc._id },
          { $set: { organizationId: slug } }
        );
        converted++;
      }
    }

    await db.collection(collectionName.toLowerCase()).createIndex(
      { organizationId: 1 },
    );

    totalUpdated += converted;
    console.log(`  ${collectionName}: converted ${converted}/${docs.length} docs`);
  }

  console.log(`\nTotal: ${totalUpdated} documents updated across ${MODELS_TO_MIGRATE.length} collections`);
  await mongoose.disconnect();
  console.log('Migration complete');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
