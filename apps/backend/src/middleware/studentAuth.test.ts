import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';
import type { Response, NextFunction } from 'express';
import { authenticateStudent, type StudentAuthRequest } from './studentAuth';

vi.mock('jsonwebtoken');
vi.mock('../models/Student', () => ({
  default: {
    findById: vi.fn(),
  },
}));
vi.mock('../utils/logger', () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

import Student from '../models/Student';

const mockedJwt = vi.mocked(jwt);
const mockedStudentFindById = vi.mocked(Student.findById);

function mockReq(overrides: Partial<StudentAuthRequest> = {}): StudentAuthRequest {
  return {
    headers: {},
    cookies: {},
    ...overrides,
  } as StudentAuthRequest;
}

function mockRes(): Response {
  const res = {} as Response;
  (res as any).status = vi.fn().mockReturnValue(res);
  (res as any).json = vi.fn().mockReturnValue(res);
  return res;
}

function mockNext(): NextFunction {
  return vi.fn();
}

class MockTokenExpiredError extends Error {
  name = 'TokenExpiredError';
}

class MockJsonWebTokenError extends Error {
  name = 'JsonWebTokenError';
}

const mockStudent = {
  _id: 'student123',
  studentNumber: '2023-0001',
  email: 'student@test.com',
  firstName: 'Jane',
  lastName: 'Doe',
  middleName: undefined,
  status: 'active',
  isActive: true,
  qrVersion: 1,
  programId: 'prog1',
  yearLevelId: 'yr1',
  sectionId: 'sec1',
};

describe('authenticateStudent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STUDENT_JWT_SECRET = 'student-secret';
  });

  it('returns 401 when no token is provided', async () => {
    const req = mockReq();
    const res = mockRes();
    const next = mockNext();

    await authenticateStudent(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'No student token provided.',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 for invalid JWT', async () => {
    const req = mockReq({
      headers: { authorization: 'Bearer invalid' },
    });
    const res = mockRes();
    const next = mockNext();

    mockedJwt.verify.mockImplementation(() => {
      throw new MockJsonWebTokenError('bad token');
    });

    await authenticateStudent(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Student authentication failed',
    });
  });

  it('returns 401 for expired token', async () => {
    const req = mockReq({
      headers: { authorization: 'Bearer expired' },
    });
    const res = mockRes();
    const next = mockNext();

    mockedJwt.verify.mockImplementation(() => {
      throw new MockTokenExpiredError('jwt expired');
    });

    await authenticateStudent(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Student token has expired',
    });
  });

  it('returns 401 when actorType is not student', async () => {
    const req = mockReq({
      headers: { authorization: 'Bearer admin-token' },
    });
    const res = mockRes();
    const next = mockNext();

    mockedJwt.verify.mockReturnValue({
      studentId: 'student123',
      studentNumber: '2023-0001',
      actorType: 'admin',
    });

    await authenticateStudent(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Invalid student token',
    });
  });

  it('returns 401 when student not found', async () => {
    const req = mockReq({
      headers: { authorization: 'Bearer valid-token' },
    });
    const res = mockRes();
    const next = mockNext();

    mockedJwt.verify.mockReturnValue({
      studentId: 'missing-student',
      studentNumber: '2023-0001',
      actorType: 'student',
      email: 'student@test.com',
      sessionId: 'session1',
    });
    mockedStudentFindById.mockResolvedValue(null as any);

    await authenticateStudent(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Student no longer exists',
    });
  });

  it('returns 403 when student is not active (isActive false)', async () => {
    const req = mockReq({
      headers: { authorization: 'Bearer valid-token' },
    });
    const res = mockRes();
    const next = mockNext();

    mockedJwt.verify.mockReturnValue({
      studentId: 'student123',
      studentNumber: '2023-0001',
      actorType: 'student',
      email: 'student@test.com',
      sessionId: 'session1',
    });
    mockedStudentFindById.mockResolvedValue({
      ...mockStudent,
      isActive: false,
      status: 'active',
    } as any);

    await authenticateStudent(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Student account is not active',
    });
  });

  it('returns 403 when student status is not ACTIVE', async () => {
    const req = mockReq({
      headers: { authorization: 'Bearer valid-token' },
    });
    const res = mockRes();
    const next = mockNext();

    mockedJwt.verify.mockReturnValue({
      studentId: 'student123',
      studentNumber: '2023-0001',
      actorType: 'student',
      email: 'student@test.com',
      sessionId: 'session1',
    });
    mockedStudentFindById.mockResolvedValue({
      ...mockStudent,
      isActive: true,
      status: 'suspended',
    } as any);

    await authenticateStudent(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Student account is not active',
    });
  });

  it('returns 500 when STUDENT_JWT_SECRET is missing', async () => {
    delete process.env.STUDENT_JWT_SECRET;
    const req = mockReq({
      headers: { authorization: 'Bearer token' },
    });
    const res = mockRes();
    const next = mockNext();

    await authenticateStudent(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Server configuration error',
    });
  });

  it('sets req.student and req.studentSessionId on success via Bearer header', async () => {
    const req = mockReq({
      headers: { authorization: 'Bearer valid-token' },
    });
    const res = mockRes();
    const next = mockNext();

    mockedJwt.verify.mockReturnValue({
      studentId: 'student123',
      studentNumber: '2023-0001',
      actorType: 'student',
      email: 'student@test.com',
      sessionId: 'session1',
    });
    mockedStudentFindById.mockResolvedValue(mockStudent as any);

    await authenticateStudent(req, res, next);

    expect(mockedJwt.verify).toHaveBeenCalledWith('valid-token', 'student-secret');
    expect(req.student).toEqual({
      studentId: 'student123',
      studentNumber: '2023-0001',
      email: 'student@test.com',
      firstName: 'Jane',
      lastName: 'Doe',
      middleName: undefined,
      status: 'active',
      isActive: true,
      qrVersion: 1,
      programId: 'prog1',
      yearLevelId: 'yr1',
      sectionId: 'sec1',
    });
    expect(req.studentSessionId).toBe('session1');
    expect(next).toHaveBeenCalled();
  });

  it('extracts token from student_token cookie', async () => {
    const req = mockReq({
      headers: {},
      cookies: { student_token: 'cookie-student-token' },
    });
    const res = mockRes();
    const next = mockNext();

    mockedJwt.verify.mockReturnValue({
      studentId: 'student123',
      studentNumber: '2023-0001',
      actorType: 'student',
      email: 'student@test.com',
      sessionId: 'session1',
    });
    mockedStudentFindById.mockResolvedValue(mockStudent as any);

    await authenticateStudent(req, res, next);

    expect(mockedJwt.verify).toHaveBeenCalledWith('cookie-student-token', 'student-secret');
    expect(req.student).toBeDefined();
    expect(next).toHaveBeenCalled();
  });
});
