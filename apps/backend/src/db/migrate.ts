import mongoose from 'mongoose';
import Migration from '../models/Migration';
import logger from '../utils/logger';

interface MigrationModule {
  up: () => Promise<void>;
  down: () => Promise<void>;
}

const getAppliedMigrations = async (): Promise<Set<string>> => {
  const records = await Migration.find({}).select('name').lean();
  return new Set(records.map((r) => r.name));
};

const getAvailableMigrations = (): { name: string; module: () => Promise<MigrationModule> }[] => [
  { name: '001_add_missing_indexes', module: () => import('./migrations/001_add_missing_indexes.js') },
  { name: '002_extract_organization_members', module: () => import('./migrations/002_extract_organization_members.js') },
];

const runMigrations = async (direction: 'up' | 'down'): Promise<void> => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not configured');
  }
  await mongoose.connect(uri);
  logger.info(`Connected to MongoDB. Running ${direction} migrations...`);

  const applied = await getAppliedMigrations();
  const available = getAvailableMigrations();

  const toProcess = direction === 'up'
    ? available.filter((m) => !applied.has(m.name))
    : available.filter((m) => applied.has(m.name)).reverse();

  if (toProcess.length === 0) {
    logger.info('No migrations to run.');
    await mongoose.disconnect();
    return;
  }

  for (const migration of toProcess) {
    logger.info(`${direction === 'up' ? 'Applying' : 'Rolling back'}: ${migration.name}`);
    const mod = await migration.module();

    try {
      if (direction === 'up') {
        await mod.up();
        await Migration.create({ name: migration.name, appliedAt: new Date() });
      } else {
        await mod.down();
        await Migration.deleteOne({ name: migration.name });
      }
      logger.info(`  ✓ ${migration.name} ${direction === 'up' ? 'applied' : 'rolled back'}`);
    } catch (err) {
      logger.error(`  ✗ ${migration.name} failed:`, err);
      process.exit(1);
    }
  }

  logger.info('All migrations complete.');
  await mongoose.disconnect();
};

const direction = process.argv[2] as 'up' | 'down' | undefined;
if (!direction || !['up', 'down'].includes(direction)) {
  console.error('Usage: ts-node src/db/migrate.ts <up|down>');
  process.exit(1);
}

runMigrations(direction);
