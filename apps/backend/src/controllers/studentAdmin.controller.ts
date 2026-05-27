import { Response } from 'express';
import Student from '../models/Student';
import Program from '../models/Program';
import YearLevel from '../models/YearLevel';
import Section from '../models/Section';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { StudentStatus } from '../types';
import { sanitizeSearchInput } from '../utils/escapeRegex';

const ensureAcademicReferences = async (
  programId: string,
  yearLevelId: string,
  sectionId: string
) => {
  const [program, yearLevel, section] = await Promise.all([
    Program.findById(programId),
    YearLevel.findById(yearLevelId),
    Section.findById(sectionId),
  ]);

  if (!program) {
    throw new AppError('Program not found', 404);
  }
  if (!yearLevel) {
    throw new AppError('Year level not found', 404);
  }
  if (!section) {
    throw new AppError('Section not found', 404);
  }
  if (String(section.programId) !== programId || String(section.yearLevelId) !== yearLevelId) {
    throw new AppError('Section does not belong to the selected program and year level', 400);
  }
};

export const getStudents = async (req: AuthRequest, res: Response): Promise<void> => {
  const {
    page = 1,
    limit = 10,
    search,
    programId,
    yearLevelId,
    sectionId,
    status,
    isActive,
  } = req.query;

  const query: Record<string, unknown> = {};

  if (typeof programId === 'string' && programId) {
    query.programId = programId;
  }
  if (typeof yearLevelId === 'string' && yearLevelId) {
    query.yearLevelId = yearLevelId;
  }
  if (typeof sectionId === 'string' && sectionId) {
    query.sectionId = sectionId;
  }
  if (typeof status === 'string' && status) {
    query.status = status;
  }
  if (typeof isActive === 'string' && isActive) {
    query.isActive = isActive === 'true';
  }
  const safeSearch = sanitizeSearchInput(search);
  if (safeSearch) {
    query.$or = [
      { studentNumber: { $regex: safeSearch, $options: 'i' } },
      { email: { $regex: safeSearch, $options: 'i' } },
      { firstName: { $regex: safeSearch, $options: 'i' } },
      { lastName: { $regex: safeSearch, $options: 'i' } },
    ];
  }

  const pageNumber = Math.max(1, Number(page));
  const limitNumber = Math.max(1, Math.min(100, Number(limit)));
  const skip = (pageNumber - 1) * limitNumber;

  const [students, total] = await Promise.all([
    Student.find(query)
      .populate('programId', 'code name')
      .populate('yearLevelId', 'code label numericLevel')
      .populate('sectionId', 'name displayName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber),
    Student.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: {
      students,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        pages: Math.ceil(total / limitNumber),
      },
    },
  });
};

export const getStudentById = async (req: AuthRequest, res: Response): Promise<void> => {
  const student = await Student.findById(req.params.id)
    .populate('programId', 'code name')
    .populate('yearLevelId', 'code label numericLevel')
    .populate('sectionId', 'name displayName');

  if (!student) {
    throw new AppError('Student not found', 404);
  }

  res.status(200).json({
    success: true,
    data: { student },
  });
};

export const createStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  const {
    studentNumber,
    email,
    password,
    firstName,
    lastName,
    middleName,
    programId,
    yearLevelId,
    sectionId,
    status = StudentStatus.PENDING,
    isActive = false,
    profilePhoto,
    phone,
    address,
    birthDate,
    aboutMe,
    enrollmentDate,
    expectedGraduationYear,
    previousSchool,
    guardianName,
    guardianContact,
    guardianRelationship,
    emergencyContactName,
    emergencyContactPhone,
    emergencyContactRelationship,
    notificationPreferences,
  } = req.body;

  const [studentNumberConflict, emailConflict] = await Promise.all([
    Student.findOne({ studentNumber: String(studentNumber).trim().toUpperCase() }),
    email ? Student.findOne({ email: String(email).trim().toLowerCase() }) : Promise.resolve(null),
  ]);

  if (studentNumberConflict) {
    throw new AppError('Student number already exists', 409);
  }
  if (emailConflict) {
    throw new AppError('Student email already exists', 409);
  }

  await ensureAcademicReferences(programId, yearLevelId, sectionId);

  const student = await Student.create({
    studentNumber,
    email,
    passwordHash: password,
    firstName,
    lastName,
    middleName,
    programId,
    yearLevelId,
    sectionId,
    status,
    isActive,
    profilePhoto,
    phone,
    address,
    birthDate,
    aboutMe,
    enrollmentDate,
    expectedGraduationYear,
    previousSchool,
    guardianName,
    guardianContact,
    guardianRelationship,
    emergencyContactName,
    emergencyContactPhone,
    emergencyContactRelationship,
    notificationPreferences,
  });

  const populatedStudent = await Student.findById(student._id)
    .populate('programId', 'code name')
    .populate('yearLevelId', 'code label numericLevel')
    .populate('sectionId', 'name displayName');

  res.status(201).json({
    success: true,
    data: { student: populatedStudent },
  });
};

export const updateStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  const existingStudent = await Student.findById(req.params.id);
  if (!existingStudent) {
    throw new AppError('Student not found', 404);
  }

  const nextStudentNumber = req.body.studentNumber
    ? String(req.body.studentNumber).trim().toUpperCase()
    : existingStudent.studentNumber;
  const nextEmail =
    typeof req.body.email === 'string' && req.body.email.trim()
      ? req.body.email.trim().toLowerCase()
      : undefined;

  const [studentNumberConflict, emailConflict] = await Promise.all([
    Student.findOne({ _id: { $ne: req.params.id }, studentNumber: nextStudentNumber }),
    nextEmail
      ? Student.findOne({ _id: { $ne: req.params.id }, email: nextEmail })
      : Promise.resolve(null),
  ]);

  if (studentNumberConflict) {
    throw new AppError('Student number already exists', 409);
  }
  if (emailConflict) {
    throw new AppError('Student email already exists', 409);
  }

  const nextProgramId = req.body.programId ?? String(existingStudent.programId);
  const nextYearLevelId = req.body.yearLevelId ?? String(existingStudent.yearLevelId);
  const nextSectionId = req.body.sectionId ?? String(existingStudent.sectionId);
  await ensureAcademicReferences(nextProgramId, nextYearLevelId, nextSectionId);

  const STUDENT_EDITABLE_FIELDS = [
    'firstName', 'lastName', 'middleName',
    'email',
    'programId', 'yearLevelId', 'sectionId',
    'profilePhoto', 'phone', 'address', 'birthDate', 'aboutMe',
    'enrollmentDate', 'expectedGraduationYear', 'previousSchool',
    'guardianName', 'guardianContact', 'guardianRelationship',
    'emergencyContactName', 'emergencyContactPhone', 'emergencyContactRelationship',
    'notificationPreferences',
  ] as const;

  const NEVER_EDITABLE = ['status', 'isActive', 'studentNumber', 'role'] as const;

  for (const field of NEVER_EDITABLE) {
    if (req.body[field] !== undefined) {
      throw new AppError(`Field '${field}' cannot be modified through this endpoint. Use the status update endpoint instead.`, 400);
    }
  }

  const updates: Record<string, unknown> = {};
  for (const field of STUDENT_EDITABLE_FIELDS) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  if (typeof req.body.password === 'string' && req.body.password.trim().length >= 8) {
    if (!req.body.currentPassword) {
      throw new AppError('Current password is required to set a new password', 400);
    }
    const isMatch = await existingStudent.comparePassword(req.body.currentPassword);
    if (!isMatch) {
      throw new AppError('Current password is incorrect', 400);
    }
    updates.passwordHash = req.body.password;
  }

  const student = await Student.findByIdAndUpdate(
    req.params.id,
    { $set: updates },
    { new: true, runValidators: true }
  )
    .populate('programId', 'code name')
    .populate('yearLevelId', 'code label numericLevel')
    .populate('sectionId', 'name displayName');

  res.status(200).json({
    success: true,
    data: { student },
  });
};

export const updateStudentStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status, isActive } = req.body as { status: StudentStatus; isActive: boolean };

  const student = await Student.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        status,
        isActive,
      },
    },
    { new: true, runValidators: true }
  )
    .populate('programId', 'code name')
    .populate('yearLevelId', 'code label numericLevel')
    .populate('sectionId', 'name displayName');

  if (!student) {
    throw new AppError('Student not found', 404);
  }

  res.status(200).json({
    success: true,
    data: { student },
  });
};
