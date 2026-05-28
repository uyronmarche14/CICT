import { Request, Response } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import Student from '../models/Student';
import StudentSession from '../models/StudentSession';
import Program from '../models/Program';
import YearLevel from '../models/YearLevel';
import Section from '../models/Section';
import { StudentAuthRequest } from '../middleware/studentAuth';
import { AppError } from '../middleware/errorHandler';
import { IStudentJWTPayload, StudentStatus } from '../types';
import { getAuthCookieOptions } from '../utils/authCookies';
import { setCsrfCookie } from '../middleware/csrf';
import logger from '../utils/logger';
import {
  forgotStudentPassword as forgotStudentPasswordService,
  resetStudentPassword as resetStudentPasswordService,
} from '../services/password-reset.service';

const getStudentJwtSecret = (): string => {
  const secret = process.env.STUDENT_JWT_SECRET;
  if (!secret) {
    throw new Error('STUDENT_JWT_SECRET is not configured');
  }

  return secret;
};

const getStudentRefreshSecret = (): string => {
  const secret = process.env.STUDENT_REFRESH_SECRET;
  if (!secret) {
    throw new Error('STUDENT_REFRESH_SECRET is not configured');
  }

  return secret;
};

const hashToken = (value: string): string =>
  crypto.createHash('sha256').update(value).digest('hex');

const buildStudentPayload = (
  student: {
    _id: unknown;
    studentNumber: string;
    email?: string;
  },
  sessionId?: string
): IStudentJWTPayload => ({
  studentId: String(student._id),
  studentNumber: student.studentNumber,
  email: student.email,
  actorType: 'student',
  sessionId,
});

const generateStudentAccessToken = (payload: IStudentJWTPayload): string =>
  jwt.sign(payload, getStudentJwtSecret(), {
    expiresIn: process.env.STUDENT_JWT_EXPIRE ?? '15m',
  } as jwt.SignOptions);

const generateStudentRefreshToken = (payload: IStudentJWTPayload): string =>
  jwt.sign(payload, getStudentRefreshSecret(), {
    expiresIn: process.env.STUDENT_REFRESH_EXPIRE ?? '30d',
  } as jwt.SignOptions);

const serializeStudent = (student: {
  _id: unknown;
  studentNumber: string;
  email?: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  status: StudentStatus;
  isActive: boolean;
  qrVersion: number;
  programId: unknown;
  yearLevelId: unknown;
  sectionId: unknown;
}) => ({
  id: String(student._id),
  studentNumber: student.studentNumber,
  email: student.email,
  firstName: student.firstName,
  lastName: student.lastName,
  middleName: student.middleName,
  status: student.status,
  isActive: student.isActive,
  qrVersion: student.qrVersion,
  programId: String(student.programId),
  yearLevelId: String(student.yearLevelId),
  sectionId: String(student.sectionId),
});

/**
 * Register a new student (self-registration)
 * Creates a pending account that must be activated by an admin
 */
export const registerStudent = async (req: Request, res: Response): Promise<void> => {
  const { studentNumber, email, password, firstName, lastName, middleName, programId, yearLevelId, sectionId } = req.body;

  if (!studentNumber || !password || !firstName || !lastName || !programId || !yearLevelId || !sectionId) {
    throw new AppError('Student number, password, first name, last name, program, year level, and section are required', 400);
  }

  if (password.length < 8) {
    throw new AppError('Password must be at least 8 characters', 400);
  }

  const [studentNumberConflict, emailConflict] = await Promise.all([
    Student.findOne({ studentNumber: String(studentNumber).trim().toUpperCase() }),
    email ? Student.findOne({ email: String(email).trim().toLowerCase() }) : Promise.resolve(null),
  ]);

  if (studentNumberConflict) {throw new AppError('Student number already exists', 409);}
  if (emailConflict) {throw new AppError('Email already exists', 409);}

  const [program, yearLevel, section] = await Promise.all([
    Program.findById(programId),
    YearLevel.findById(yearLevelId),
    Section.findById(sectionId),
  ]);

  if (!program) {throw new AppError('Program not found', 404);}
  if (!yearLevel) {throw new AppError('Year level not found', 404);}
  if (!section) {throw new AppError('Section not found', 404);}

  const student = await Student.create({
    studentNumber: String(studentNumber).trim().toUpperCase(),
    email: email?.trim().toLowerCase(),
    passwordHash: password,
    firstName,
    lastName,
    middleName,
    programId,
    yearLevelId,
    sectionId,
    status: 'pending',
    isActive: false,
    qrVersion: 1,
  });

  const populatedStudent = await Student.findById(student._id)
    .populate('programId', 'code name')
    .populate('yearLevelId', 'code label numericLevel')
    .populate('sectionId', 'name displayName');

  logger.info(`Student self-registered: ${studentNumber}`);

  res.status(201).json({
    success: true,
    message: 'Registration successful. Your account must be activated by an administrator.',
    data: { student: populatedStudent },
  });
};

export const loginStudent = async (req: Request, res: Response): Promise<void> => {
  const { identifier, password, deviceLabel, platform } = req.body;
  const normalizedIdentifier = String(identifier).trim();
  const identifierQuery = normalizedIdentifier.includes('@')
    ? { email: normalizedIdentifier.toLowerCase() }
    : { studentNumber: normalizedIdentifier.toUpperCase() };

  const student = await Student.findOne(identifierQuery).select('+passwordHash');
  if (!student) {
    throw new AppError('Invalid student credentials', 401);
  }

  if (!student.isActive || student.status !== StudentStatus.ACTIVE) {
    throw new AppError('Student account is not active', 403);
  }

  const isPasswordValid = await student.comparePassword(password);
  if (!isPasswordValid) {
    throw new AppError('Invalid student credentials', 401);
  }

  const session = await StudentSession.create({
    studentId: student._id,
    tokenHash: 'pending',
    deviceLabel,
    platform,
    lastUsedAt: new Date(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  const refreshPayload = buildStudentPayload(student, String(session._id));
  const accessToken = generateStudentAccessToken(refreshPayload);
  const refreshToken = generateStudentRefreshToken(refreshPayload);

  session.tokenHash = hashToken(refreshToken);
  await session.save();

  student.lastLoginAt = new Date();
  await student.save();

  res.cookie('student_token', accessToken, getAuthCookieOptions());
  setCsrfCookie(res);
  res.cookie('refreshToken', refreshToken, {
    ...getAuthCookieOptions(),
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    data: {
      accessToken,
      refreshToken,
      student: serializeStudent(student),
    },
  });
};

export const refreshStudentToken = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (!refreshToken) {
    throw new AppError('Refresh token is required', 400);
  }

  const decoded = jwt.verify(refreshToken, getStudentRefreshSecret()) as IStudentJWTPayload;
  if (decoded.actorType !== 'student' || !decoded.sessionId) {
    throw new AppError('Invalid refresh token', 401);
  }

  const session = await StudentSession.findById(decoded.sessionId);
  if (!session || session.revokedAt || session.tokenHash !== hashToken(refreshToken)) {
    throw new AppError('Refresh token is no longer valid', 401);
  }

  const student = await Student.findById(decoded.studentId);
  if (!student || !student.isActive || student.status !== StudentStatus.ACTIVE) {
    throw new AppError('Student account is not active', 403);
  }

  const refreshPayload = buildStudentPayload(student, String(session._id));
  const nextAccessToken = generateStudentAccessToken(refreshPayload);
  const nextRefreshToken = generateStudentRefreshToken(refreshPayload);

  session.tokenHash = hashToken(nextRefreshToken);
  session.lastUsedAt = new Date();
  session.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await session.save();

  res.cookie('student_token', nextAccessToken, getAuthCookieOptions());
  res.cookie('refreshToken', nextRefreshToken, {
    ...getAuthCookieOptions(),
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    data: {
      accessToken: nextAccessToken,
      refreshToken: nextRefreshToken,
      student: serializeStudent(student),
    },
  });
};

export const logoutStudent = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, getStudentRefreshSecret()) as IStudentJWTPayload;
      if (decoded.sessionId) {
        await StudentSession.findByIdAndUpdate(decoded.sessionId, {
          $set: { revokedAt: new Date() },
        });
      }
    } catch {
      // Best-effort revoke only.
    }
  }

  res.clearCookie('student_token', getAuthCookieOptions());
  res.clearCookie('refreshToken', getAuthCookieOptions());

  res.status(200).json({
    success: true,
    message: 'Student logout successful',
  });
};

export const getStudentProfile = async (
  req: StudentAuthRequest,
  res: Response
): Promise<void> => {
  if (!req.student) {
    throw new AppError('Student not authenticated', 401);
  }

  const student = await Student.findById(req.student.studentId)
    .populate('programId', 'code name')
    .populate('yearLevelId', 'code label numericLevel')
    .populate('sectionId', 'name displayName');

  if (!student) {
    throw new AppError('Student not found', 404);
  }

  res.status(200).json({
    success: true,
    data: {
      student,
    },
  });
};

export const forgotStudentPassword = async (req: Request, res: Response): Promise<void> => {
  const { studentNumber, email } = req.body;
  if (!studentNumber) {
    throw new AppError('Student number is required', 400);
  }

  await forgotStudentPasswordService(studentNumber, email);

  res.status(200).json({
    success: true,
    message: 'If the student exists, a password reset link has been sent.',
  });
};

export const resetStudentPasswordCtrl = async (req: Request, res: Response): Promise<void> => {
  const { token, password } = req.body;
  if (!token || !password) {
    throw new AppError('Token and password are required', 400);
  }

  if (password.length < 8) {
    throw new AppError('Password must be at least 8 characters', 400);
  }

  await resetStudentPasswordService(token, password);

  res.status(200).json({
    success: true,
    message: 'Password reset successfully',
  });
};
