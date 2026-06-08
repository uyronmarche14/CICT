import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'crypto';

const MOCK_RAW_TOKEN = 'aa'.repeat(32);

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(),
  },
}));

vi.mock('../models/User', () => ({
  default: {
    findOne: vi.fn(),
  },
}));

vi.mock('../models/Student', () => ({
  default: {
    findOne: vi.fn(),
  },
}));

vi.mock('./email.service', () => ({
  sendEmail: vi.fn(),
  buildPasswordResetEmail: vi.fn((url: string) => ({
    subject: 'Reset Password',
    html: `<a href="${url}">Reset</a>`,
  })),
}));

vi.mock('../utils/logger', () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import bcrypt from 'bcryptjs';
import User from '../models/User';
import Student from '../models/Student';
import { sendEmail, buildPasswordResetEmail } from './email.service';
import logger from '../utils/logger';
import {
  forgotPassword,
  resetPassword,
  forgotStudentPassword,
  resetStudentPassword,
} from './password-reset.service';

const mockedUserFindOne = vi.mocked(User.findOne);
const mockedStudentFindOne = vi.mocked(Student.findOne);
const mockedSendEmail = vi.mocked(sendEmail);
const mockedBuildPasswordResetEmail = vi.mocked(buildPasswordResetEmail);
const mockedBcryptHash = vi.mocked(bcrypt.hash);
const mockedLoggerInfo = vi.mocked(logger.info);

function mq(result: any) {
  const query: any = {};
  query.select = vi.fn().mockReturnValue(query);
  query.lean = vi.fn().mockReturnValue(query);
  query.then = (resolve: any) => resolve(result);
  query.catch = () => {};
  return query;
}

describe('forgotPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.FRONTEND_URL = 'https://cict-staging.example.com';
    vi.spyOn(crypto, 'randomBytes').mockImplementation(
      (size: any) => Buffer.from('aa'.repeat(size), 'hex') as any
    );
  });

  it('generates token, hashes it, stores on user, and sends email', async () => {
    const userDoc = {
      email: 'test@test.com',
      save: vi.fn().mockResolvedValue(undefined),
    };
    mockedUserFindOne.mockReturnValue(mq(userDoc) as any);

    await forgotPassword('test@test.com');

    expect(mockedUserFindOne).toHaveBeenCalledWith({ email: 'test@test.com' });

    const savedToken = (userDoc as any).resetPasswordToken;
    expect(savedToken).toBeDefined();
    expect(savedToken).not.toBe(MOCK_RAW_TOKEN);
    const expectedHash = crypto.createHash('sha256').update(MOCK_RAW_TOKEN).digest('hex');
    expect(savedToken).toBe(expectedHash);

    expect((userDoc as any).resetPasswordExpires).toBeInstanceOf(Date);
    expect(userDoc.save).toHaveBeenCalled();

    const expectedUrl = `https://cict-staging.example.com/auth/reset-password?token=${MOCK_RAW_TOKEN}`;
    expect(mockedBuildPasswordResetEmail).toHaveBeenCalledWith(expectedUrl);
    expect(mockedSendEmail).toHaveBeenCalledWith({
      to: 'test@test.com',
      subject: 'Reset Password',
      html: `<a href="${expectedUrl}">Reset</a>`,
    });
  });

  it('does not log the raw token', async () => {
    const userDoc = {
      email: 'test@test.com',
      save: vi.fn().mockResolvedValue(undefined),
    };
    mockedUserFindOne.mockReturnValue(mq(userDoc) as any);

    await forgotPassword('test@test.com');

    for (const call of mockedLoggerInfo.mock.calls) {
      const msg = String(call[0]);
      expect(msg).not.toContain(MOCK_RAW_TOKEN);
      if (msg.includes('token generated')) {
        expect(msg).toContain('test@test.com');
      }
    }
  });

  it('silently returns when email is unknown', async () => {
    mockedUserFindOne.mockReturnValue(mq(null) as any);

    await forgotPassword('unknown@test.com');

    expect(mockedSendEmail).not.toHaveBeenCalled();
    expect(mockedLoggerInfo).toHaveBeenCalledWith(
      'Password reset requested for unknown email: unknown@test.com'
    );
  });

  it('falls back to default FRONTEND_URL when env var is not set', async () => {
    delete process.env.FRONTEND_URL;
    const userDoc = {
      email: 'test@test.com',
      save: vi.fn().mockResolvedValue(undefined),
    };
    mockedUserFindOne.mockReturnValue(mq(userDoc) as any);

    await forgotPassword('test@test.com');

    const callUrl = mockedBuildPasswordResetEmail.mock.calls[0][0];
    expect(callUrl).toContain('https://cict.edu.ph');
    expect(callUrl).toContain(MOCK_RAW_TOKEN);
  });
});

describe('resetPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(crypto, 'randomBytes').mockImplementation(
      (size: any) => Buffer.from('aa'.repeat(size), 'hex') as any
    );
  });

  it('updates password and clears reset fields with valid token', async () => {
    const expectedHash = crypto.createHash('sha256').update(MOCK_RAW_TOKEN).digest('hex');
    const userDoc = {
      email: 'test@test.com',
      password: '',
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
      save: vi.fn().mockResolvedValue(undefined),
    };
    mockedUserFindOne.mockReturnValue(mq(userDoc) as any);

    await resetPassword(MOCK_RAW_TOKEN, 'newPassword123');

    expect(mockedUserFindOne).toHaveBeenCalledWith({
      resetPasswordToken: expectedHash,
      resetPasswordExpires: { $gt: expect.any(Date) },
    });
    expect((userDoc as any).password).toBe('newPassword123');
    expect((userDoc as any).resetPasswordToken).toBeUndefined();
    expect((userDoc as any).resetPasswordExpires).toBeUndefined();
    expect(userDoc.save).toHaveBeenCalled();
  });

  it('throws AppError when token is invalid or expired', async () => {
    mockedUserFindOne.mockReturnValue(mq(null) as any);

    await expect(resetPassword('bad-token', 'newPassword123')).rejects.toMatchObject({
      message: 'Invalid or expired reset token',
      statusCode: 400,
    });
  });
});

describe('forgotStudentPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.FRONTEND_URL = 'https://cict-staging.example.com';
    vi.spyOn(crypto, 'randomBytes').mockImplementation(
      (size: any) => Buffer.from('aa'.repeat(size), 'hex') as any
    );
  });

  it('generates token, hashes it, stores on student, and sends email', async () => {
    const studentDoc = {
      studentNumber: '2023-0001',
      email: 'student@test.com',
      save: vi.fn().mockResolvedValue(undefined),
    };
    mockedStudentFindOne.mockReturnValue(mq(studentDoc) as any);
    mockedBuildPasswordResetEmail.mockReturnValue({
      subject: 'Reset Password',
      html: `<a href="https://example.com/reset?token=${MOCK_RAW_TOKEN}">Reset</a>`,
    });

    await forgotStudentPassword('2023-0001', 'student@test.com');

    expect(mockedStudentFindOne).toHaveBeenCalledWith({
      studentNumber: '2023-0001',
      email: 'student@test.com',
    });

    const savedToken = (studentDoc as any).resetPasswordToken;
    expect(savedToken).toBeDefined();
    expect(savedToken).not.toBe(MOCK_RAW_TOKEN);
    const expectedHash = crypto.createHash('sha256').update(MOCK_RAW_TOKEN).digest('hex');
    expect(savedToken).toBe(expectedHash);

    expect((studentDoc as any).resetPasswordExpires).toBeInstanceOf(Date);
    expect(studentDoc.save).toHaveBeenCalled();
    expect(mockedSendEmail).toHaveBeenCalled();
  });

  it('trims and uppercases studentNumber', async () => {
    mockedStudentFindOne.mockReturnValue(mq(null) as any);

    await forgotStudentPassword(' 2023-0001 ');

    expect(mockedStudentFindOne).toHaveBeenCalledWith({
      studentNumber: '2023-0001',
    });
  });

  it('does not log the raw token', async () => {
    const studentDoc = {
      studentNumber: '2023-0001',
      email: 'student@test.com',
      save: vi.fn().mockResolvedValue(undefined),
    };
    mockedStudentFindOne.mockReturnValue(mq(studentDoc) as any);

    await forgotStudentPassword('2023-0001', 'student@test.com');

    for (const call of mockedLoggerInfo.mock.calls) {
      const msg = String(call[0]);
      expect(msg).not.toContain(MOCK_RAW_TOKEN);
      if (msg.includes('token generated')) {
        expect(msg).toContain('2023-0001');
      }
    }
  });

  it('silently returns when student is not found', async () => {
    mockedStudentFindOne.mockReturnValue(mq(null) as any);

    await forgotStudentPassword('NONEXISTENT');

    expect(mockedSendEmail).not.toHaveBeenCalled();
    expect(mockedLoggerInfo).toHaveBeenCalledWith(
      'Password reset requested for unknown student: NONEXISTENT'
    );
  });

  it('silently returns when student has no email (skips sending)', async () => {
    const studentDoc = {
      studentNumber: '2023-0001',
      email: undefined,
      save: vi.fn().mockResolvedValue(undefined),
    };
    mockedStudentFindOne.mockReturnValue(mq(studentDoc) as any);

    await forgotStudentPassword('2023-0001');

    expect(mockedSendEmail).not.toHaveBeenCalled();
    expect(studentDoc.save).toHaveBeenCalled();
  });
});

describe('resetStudentPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.BCRYPT_ROUNDS = '12';
    vi.spyOn(crypto, 'randomBytes').mockImplementation(
      (size: any) => Buffer.from('aa'.repeat(size), 'hex') as any
    );
  });

  it('updates password hash and clears reset fields with valid token', async () => {
    const expectedHash = crypto.createHash('sha256').update(MOCK_RAW_TOKEN).digest('hex');
    const studentDoc = {
      studentNumber: '2023-0001',
      passwordHash: 'oldhash',
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
      save: vi.fn().mockResolvedValue(undefined),
    };
    mockedStudentFindOne.mockReturnValue(mq(studentDoc) as any);
    mockedBcryptHash.mockResolvedValue('newhashedpassword' as never);

    await resetStudentPassword(MOCK_RAW_TOKEN, 'newPassword123');

    expect(mockedStudentFindOne).toHaveBeenCalledWith({
      resetPasswordToken: expectedHash,
      resetPasswordExpires: { $gt: expect.any(Date) },
    });
    expect(mockedBcryptHash).toHaveBeenCalledWith('newPassword123', 12);
    expect((studentDoc as any).passwordHash).toBe('newhashedpassword');
    expect((studentDoc as any).resetPasswordToken).toBeUndefined();
    expect((studentDoc as any).resetPasswordExpires).toBeUndefined();
    expect(studentDoc.save).toHaveBeenCalled();
  });

  it('throws AppError when token is invalid or expired', async () => {
    mockedStudentFindOne.mockReturnValue(mq(null) as any);

    await expect(resetStudentPassword('bad-token', 'newPassword123')).rejects.toMatchObject({
      message: 'Invalid or expired reset token',
      statusCode: 400,
    });
  });

  it('uses default BCRYPT_ROUNDS of 10 when env var is not set', async () => {
    delete process.env.BCRYPT_ROUNDS;
    const studentDoc = {
      studentNumber: '2023-0001',
      save: vi.fn().mockResolvedValue(undefined),
    };
    mockedStudentFindOne.mockReturnValue(mq(studentDoc) as any);
    mockedBcryptHash.mockResolvedValue('hashed' as never);

    await resetStudentPassword(MOCK_RAW_TOKEN, 'newPassword123');

    expect(mockedBcryptHash).toHaveBeenCalledWith('newPassword123', 10);
  });
});
