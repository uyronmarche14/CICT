import Student from '../models/Student'
import Program from '../models/Program'
import YearLevel from '../models/YearLevel'
import Section from '../models/Section'
import { type AuthRequest } from '../middleware/auth'
import { AppError } from '../middleware/errorHandler'
import { StudentStatus } from '../types'
import { sanitizeSearchInput } from '../utils/escapeRegex'
import { TypedCache } from '../utils/cache'
import { invalidateDashboardCache } from './dashboard.service'

const studentDetailCache = new TypedCache<any>({ namespace: 'student:detail', ttlMs: 120_000 })
const studentListCache = new TypedCache<any>({ namespace: 'student:list', ttlMs: 30_000 })

const invalidateStudent = async (id: string): Promise<void> => {
  await studentDetailCache.invalidate(id)
  await studentListCache.clear()
  await invalidateDashboardCache()
}

const ensureAcademicReferences = async (
  programId: string,
  yearLevelId: string,
  sectionId: string
) => {
  const [program, yearLevel, section] = await Promise.all([
    Program.findById(programId),
    YearLevel.findById(yearLevelId),
    Section.findById(sectionId),
  ])

  if (!program) {throw new AppError('Program not found', 404)}
  if (!yearLevel) {throw new AppError('Year level not found', 404)}
  if (!section) {throw new AppError('Section not found', 404)}
  if (String(section.programId) !== programId || String(section.yearLevelId) !== yearLevelId) {
    throw new AppError('Section does not belong to the selected program and year level', 400)
  }
}

// ——— Reads ———

export const getStudents = async (req: AuthRequest): Promise<any> => {
  const { page = 1, limit = 10, search, programId, yearLevelId, sectionId, status, isActive } = req.query

  const query: Record<string, unknown> = {}
  if (typeof programId === 'string' && programId) {query.programId = programId}
  if (typeof yearLevelId === 'string' && yearLevelId) {query.yearLevelId = yearLevelId}
  if (typeof sectionId === 'string' && sectionId) {query.sectionId = sectionId}
  if (typeof status === 'string' && status) {query.status = status}
  if (typeof isActive === 'string' && isActive) {query.isActive = isActive === 'true'}

  const safeSearch = sanitizeSearchInput(search)
  if (safeSearch) {
    query.$or = [
      { studentNumber: { $regex: safeSearch, $options: 'i' } },
      { email: { $regex: safeSearch, $options: 'i' } },
      { firstName: { $regex: safeSearch, $options: 'i' } },
      { lastName: { $regex: safeSearch, $options: 'i' } },
    ]
  }

  const pageNumber = Math.max(1, Number(page))
  const limitNumber = Math.max(1, Math.min(100, Number(limit)))
  const skip = (pageNumber - 1) * limitNumber

  const cacheKey = `list:${JSON.stringify(query)}:${pageNumber}:${limitNumber}`
  const cached = await studentListCache.get(cacheKey)
  if (cached) {return cached}

  const [students, total] = await Promise.all([
    Student.find(query)
      .populate('programId', 'code name')
      .populate('yearLevelId', 'code label numericLevel')
      .populate('sectionId', 'name displayName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber),
    Student.countDocuments(query),
  ])

  const result = {
    students,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      pages: Math.ceil(total / limitNumber),
    },
  }

  await studentListCache.set(cacheKey, result)
  return result
}

export const getStudentById = async (id: string): Promise<any> => {
  const cached = await studentDetailCache.get(id)
  if (cached) {return cached}

  const student = await Student.findById(id)
    .populate('programId', 'code name')
    .populate('yearLevelId', 'code label numericLevel')
    .populate('sectionId', 'name displayName')

  if (!student) {throw new AppError('Student not found', 404)}

  await studentDetailCache.set(id, student)
  return student
}

export const getOwnStudentProfile = async (studentId: string): Promise<any> => {
  const cached = await studentDetailCache.get(`own:${studentId}`)
  if (cached) {return cached}

  const student = await Student.findById(studentId)
    .populate('programId', 'code name')
    .populate('yearLevelId', 'code label numericLevel')
    .populate('sectionId', 'name displayName')

  if (!student) {throw new AppError('Student not found', 404)}

  await studentDetailCache.set(`own:${studentId}`, student)
  return student
}

// ——— Writes ———

export const createStudent = async (req: AuthRequest): Promise<any> => {
  const {
    studentNumber, email, password, firstName, lastName, middleName,
    programId, yearLevelId, sectionId, status = StudentStatus.PENDING,
    isActive = false, profilePhoto, phone, address, birthDate, aboutMe,
    enrollmentDate, expectedGraduationYear, previousSchool,
    guardianName, guardianContact, guardianRelationship,
    emergencyContactName, emergencyContactPhone, emergencyContactRelationship,
    notificationPreferences,
  } = req.body

  const [studentNumberConflict, emailConflict] = await Promise.all([
    Student.findOne({ studentNumber: String(studentNumber).trim().toUpperCase() }),
    email ? Student.findOne({ email: String(email).trim().toLowerCase() }) : Promise.resolve(null),
  ])

  if (studentNumberConflict) {throw new AppError('Student number already exists', 409)}
  if (emailConflict) {throw new AppError('Student email already exists', 409)}

  await ensureAcademicReferences(programId, yearLevelId, sectionId)

  const student = await Student.create({
    studentNumber, email, passwordHash: password, firstName, lastName, middleName,
    programId, yearLevelId, sectionId, status, isActive, profilePhoto, phone,
    address, birthDate, aboutMe, enrollmentDate, expectedGraduationYear, previousSchool,
    guardianName, guardianContact, guardianRelationship,
    emergencyContactName, emergencyContactPhone, emergencyContactRelationship,
    notificationPreferences,
  })

  const populatedStudent = await Student.findById(student._id)
    .populate('programId', 'code name')
    .populate('yearLevelId', 'code label numericLevel')
    .populate('sectionId', 'name displayName')

  await studentListCache.clear()
  await invalidateDashboardCache()
  return populatedStudent
}

export const updateStudent = async (id: string, req: AuthRequest): Promise<any> => {
  const existingStudent = await Student.findById(id)
  if (!existingStudent) {throw new AppError('Student not found', 404)}

  const nextStudentNumber = req.body.studentNumber
    ? String(req.body.studentNumber).trim().toUpperCase()
    : existingStudent.studentNumber
  const nextEmail = typeof req.body.email === 'string' && req.body.email.trim()
    ? req.body.email.trim().toLowerCase()
    : undefined

  const [studentNumberConflict, emailConflict] = await Promise.all([
    Student.findOne({ _id: { $ne: id }, studentNumber: nextStudentNumber }),
    nextEmail ? Student.findOne({ _id: { $ne: id }, email: nextEmail }) : Promise.resolve(null),
  ])

  if (studentNumberConflict) {throw new AppError('Student number already exists', 409)}
  if (emailConflict) {throw new AppError('Student email already exists', 409)}

  const nextProgramId = req.body.programId ?? String(existingStudent.programId)
  const nextYearLevelId = req.body.yearLevelId ?? String(existingStudent.yearLevelId)
  const nextSectionId = req.body.sectionId ?? String(existingStudent.sectionId)
  await ensureAcademicReferences(nextProgramId, nextYearLevelId, nextSectionId)

  const STUDENT_EDITABLE_FIELDS = [
    'firstName', 'lastName', 'middleName', 'email',
    'programId', 'yearLevelId', 'sectionId',
    'profilePhoto', 'phone', 'address', 'birthDate', 'aboutMe',
    'enrollmentDate', 'expectedGraduationYear', 'previousSchool',
    'guardianName', 'guardianContact', 'guardianRelationship',
    'emergencyContactName', 'emergencyContactPhone', 'emergencyContactRelationship',
    'notificationPreferences',
  ] as const

  const NEVER_EDITABLE = ['status', 'isActive', 'studentNumber', 'role'] as const
  for (const field of NEVER_EDITABLE) {
    if (req.body[field] !== undefined) {
      throw new AppError(`Field '${field}' cannot be modified through this endpoint. Use the status update endpoint instead.`, 400)
    }
  }

  const updates: Record<string, unknown> = {}
  for (const field of STUDENT_EDITABLE_FIELDS) {
    if (req.body[field] !== undefined) {updates[field] = req.body[field]}
  }

  if (typeof req.body.password === 'string' && req.body.password.trim().length >= 8) {
    if (!req.user) {
      if (!req.body.currentPassword) {throw new AppError('Current password is required to set a new password', 400)}
      const isMatch = await existingStudent.comparePassword(req.body.currentPassword)
      if (!isMatch) {throw new AppError('Current password is incorrect', 400)}
    }
    updates.passwordHash = req.body.password
  }

  const student = await Student.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true }
  )
    .populate('programId', 'code name')
    .populate('yearLevelId', 'code label numericLevel')
    .populate('sectionId', 'name displayName')

  await invalidateStudent(id)
  return student
}

export const updateStudentStatus = async (id: string, req: AuthRequest): Promise<any> => {
  const { status, isActive } = req.body as { status: StudentStatus; isActive: boolean }

  const student = await Student.findByIdAndUpdate(
    id,
    { $set: { status, isActive } },
    { new: true, runValidators: true }
  )
    .populate('programId', 'code name')
    .populate('yearLevelId', 'code label numericLevel')
    .populate('sectionId', 'name displayName')

  if (!student) {throw new AppError('Student not found', 404)}

  await invalidateStudent(id)
  return student
}
