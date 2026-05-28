import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { TypedCache, InMemoryBackend } from '../utils/cache';
import { getDashboardSummary, invalidateDashboardCache } from './dashboard.service';
import { getPrograms, createProgram, getYearLevels, createYearLevel, createSection } from './academic.service';
import { getFAQContent, upsertFAQContent, invalidateFaqCache } from './faq.service';

import News from '../models/News';
import User from '../models/User';
import Program from '../models/Program';
import YearLevel from '../models/YearLevel';
import Section from '../models/Section';
import FAQContent from '../models/FAQContent';
import { UserRole, NewsStatus } from '../types';

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

beforeEach(async () => {
  await News.deleteMany({});
  await User.deleteMany({});
  await Program.deleteMany({});
  await YearLevel.deleteMany({});
  await Section.deleteMany({});
  await FAQContent.deleteMany({});
  await invalidateDashboardCache();
  await invalidateFaqCache();
});

describe('TypedCache', () => {
  let cache: TypedCache<string>;

  beforeEach(() => {
    cache = new TypedCache<string>({ ttlMs: 60_000 });
    cache.clear();
  });

  it('set and get a value', async () => {
    await cache.set('key1', 'value1');
    expect(await cache.get('key1')).toBe('value1');
  });

  it('returns undefined for missing key', async () => {
    expect(await cache.get('nonexistent')).toBeUndefined();
  });

  it('invalidate removes a key', async () => {
    await cache.set('key1', 'value1');
    await cache.invalidate('key1');
    expect(await cache.get('key1')).toBeUndefined();
  });

  it('clear removes all keys', async () => {
    await cache.set('a', '1');
    await cache.set('b', '2');
    await cache.clear();
    expect(await cache.get('a')).toBeUndefined();
    expect(await cache.get('b')).toBeUndefined();
  });

  it('namespaced caches are isolated', async () => {
    const a = new TypedCache<string>({ namespace: 'ns1' });
    const b = new TypedCache<string>({ namespace: 'ns2' });
    await a.set('key', 'from-a');
    await b.set('key', 'from-b');
    expect(await a.get('key')).toBe('from-a');
    expect(await b.get('key')).toBe('from-b');
  });
});

describe('InMemoryBackend', () => {
  it('delPattern with regex matches correctly', async () => {
    const backend = new InMemoryBackend();
    await backend.set('news:detail:abc', 'x', 60_000);
    await backend.set('news:list:xyz', 'y', 60_000);
    await backend.set('org:detail:abc', 'z', 60_000);
    await backend.delPattern('^news:');
    expect(await backend.get('news:detail:abc')).toBeUndefined();
    expect(await backend.get('news:list:xyz')).toBeUndefined();
    expect(await backend.get('org:detail:abc')).toBe('z');
  });
});

describe('DashboardService', () => {
  const makeMockAdmin = (perms: string[]) => ({
    userId: 'admin1',
    role: UserRole.FULL_ADMIN,
    permissions: perms,
    visibleAdminModules: ['dashboard', 'users'],
    canAccessAdmin: true,
    adminScopes: { global: true, organizations: [] },
    organizationAssignments: [],
    scopedAdminModulesByOrganization: {},
  });

  it('returns zero counts when no data exists', async () => {
    const summary = await getDashboardSummary(makeMockAdmin(['view_users']));
    expect(summary.cards.users).toBe(0);
  });

  it('returns response with correct shape', async () => {
    await User.create({ email: 'a@b.com', password: 'Test1234!', firstName: 'A', lastName: 'B', role: UserRole.FULL_ADMIN });
    await News.create({ title: 'N1', bodyHtml: 'C', excerpt: 'E', author: new mongoose.Types.ObjectId(), status: NewsStatus.PUBLISHED, ownerType: 'system', tags: [] });

    const summary = await getDashboardSummary(makeMockAdmin(['view_users', 'view_news']));
    expect(typeof summary.cards.users).toBe('number');
    expect(typeof summary.cards.news).toBe('number');
    expect(Array.isArray(summary.visibleModules)).toBe(true);
  });
});

describe('AcademicService', () => {
  it('creates and retrieves programs', async () => {
    await createProgram({ code: 'BSIT', name: 'IT', isActive: true, sortOrder: 1 });
    await createProgram({ code: 'BSCS', name: 'CS', isActive: true, sortOrder: 2 });
    const programs = await getPrograms();
    expect(programs).toHaveLength(2);
  });

  it('rejects duplicate program code', async () => {
    await createProgram({ code: 'BSIT', name: 'IT', isActive: true, sortOrder: 1 });
    await expect(createProgram({ code: 'BSIT', name: 'IT Again', isActive: true, sortOrder: 2 }))
      .rejects.toThrow('Program code already exists');
  });

  it('creates and retrieves year levels', async () => {
    await createYearLevel({ code: '1st', label: '1st Year', numericLevel: 1, isActive: true, sortOrder: 1 });
    await createYearLevel({ code: '2nd', label: '2nd Year', numericLevel: 2, isActive: true, sortOrder: 2 });
    const levels = await getYearLevels();
    expect(levels).toHaveLength(2);
  });

  it('creates section with valid references', async () => {
    const program = await Program.create({ code: 'BSIT', name: 'IT', isActive: true, sortOrder: 1 });
    const yearLevel = await YearLevel.create({ code: '1st', label: '1st Year', numericLevel: 1, isActive: true, sortOrder: 1 });
    const section = await createSection({
      programId: String(program._id), yearLevelId: String(yearLevel._id), name: 'A', displayName: 'Section A', isActive: true,
    });
    expect(section.name).toBe('A');
  });

  it('rejects section with invalid program', async () => {
    await expect(createSection({
      programId: new mongoose.Types.ObjectId().toString(), yearLevelId: new mongoose.Types.ObjectId().toString(),
      name: 'A', displayName: 'Section A',
    })).rejects.toThrow('Program not found');
  });
});

describe('FAQService', () => {
  it('returns default content when nothing is stored', async () => {
    const content = await getFAQContent();
    expect(content.title).toBe('Frequently Asked Questions');
    expect(content.topics.length).toBeGreaterThan(0);
    expect(content.questions.length).toBeGreaterThan(0);
  });

  it('stores and retrieves custom content', async () => {
    await upsertFAQContent({
      title: 'Custom FAQ', subtitle: 'Custom subtitle',
      topics: [{ id: 'topic1', label: 'Topic 1' }],
      questions: [{ category: 'topic1', question: 'Q1?', answer: 'A1' }],
    });
    const content = await getFAQContent();
    expect(content.title).toBe('Custom FAQ');
    expect(content.questions).toHaveLength(1);
  });

  it('returns updated content after upsert', async () => {
    const first = await getFAQContent();
    expect(first.title).toBe('Frequently Asked Questions');
    await upsertFAQContent({ title: 'Updated', subtitle: 'S', topics: [], questions: [] });
    const second = await getFAQContent();
    expect(second.title).toBe('Updated');
  });
});
