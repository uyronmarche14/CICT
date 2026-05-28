import Program from '../models/Program'
import YearLevel from '../models/YearLevel'
import Section from '../models/Section'
import { AppError } from '../middleware/errorHandler'
import { TypedCache } from '../utils/cache'
import { invalidateDashboardCache } from './dashboard.service'

const programCache = new TypedCache<any>({ namespace: 'academic:programs', ttlMs: 600_000 })
const yearLevelCache = new TypedCache<any>({ namespace: 'academic:yearLevels', ttlMs: 600_000 })
const sectionCache = new TypedCache<any>({ namespace: 'academic:sections', ttlMs: 600_000 })

export const invalidateAcademic = async (): Promise<void> => {
  await Promise.all([
    programCache.clear(),
    yearLevelCache.clear(),
    sectionCache.clear(),
  ])
  await invalidateDashboardCache()
}

// ——— Programs ———

export const getPrograms = async (): Promise<any[]> => {
  const cached = await programCache.get('all')
  if (cached) {return cached}

  const programs = await Program.find().sort({ sortOrder: 1, code: 1 })
  await programCache.set('all', programs)
  return programs
}

export const createProgram = async (data: any): Promise<any> => {
  const { code, name, isActive = true, sortOrder = 0 } = data
  const existingProgram = await Program.findOne({ code: String(code).trim().toUpperCase() })
  if (existingProgram) {
    throw new AppError('Program code already exists', 409)
  }

  const program = await Program.create({ code, name, isActive, sortOrder })
  await invalidateAcademic()
  return program
}

export const updateProgram = async (id: string, data: any): Promise<any> => {
  const existingProgram = await Program.findById(id)
  if (!existingProgram) {
    throw new AppError('Program not found', 404)
  }

  if (data.code && String(data.code).trim().toUpperCase() !== existingProgram.code) {
    const codeConflict = await Program.findOne({ code: String(data.code).trim().toUpperCase() })
    if (codeConflict) {
      throw new AppError('Program code already exists', 409)
    }
  }

  const program = await Program.findByIdAndUpdate(
    id,
    { $set: { code: data.code, name: data.name, isActive: data.isActive, sortOrder: data.sortOrder } },
    { new: true, runValidators: true }
  )

  await invalidateAcademic()
  return program
}

// ——— Year Levels ———

export const getYearLevels = async (): Promise<any[]> => {
  const cached = await yearLevelCache.get('all')
  if (cached) {return cached}

  const yearLevels = await YearLevel.find().sort({ sortOrder: 1, numericLevel: 1 })
  await yearLevelCache.set('all', yearLevels)
  return yearLevels
}

export const createYearLevel = async (data: any): Promise<any> => {
  const { code, label, numericLevel, isActive = true, sortOrder = 0 } = data
  const [codeConflict, numericConflict] = await Promise.all([
    YearLevel.findOne({ code: String(code).trim() }),
    YearLevel.findOne({ numericLevel }),
  ])

  if (codeConflict || numericConflict) {
    throw new AppError('Year level already exists', 409)
  }

  const yearLevel = await YearLevel.create({ code, label, numericLevel, isActive, sortOrder })
  await invalidateAcademic()
  return yearLevel
}

export const updateYearLevel = async (id: string, data: any): Promise<any> => {
  const existingYearLevel = await YearLevel.findById(id)
  if (!existingYearLevel) {
    throw new AppError('Year level not found', 404)
  }

  const nextCode = data.code ? String(data.code).trim() : existingYearLevel.code
  const nextNumericLevel = typeof data.numericLevel === 'number' ? data.numericLevel : existingYearLevel.numericLevel

  const [codeConflict, numericConflict] = await Promise.all([
    YearLevel.findOne({ _id: { $ne: id }, code: nextCode }),
    YearLevel.findOne({ _id: { $ne: id }, numericLevel: nextNumericLevel }),
  ])

  if (codeConflict || numericConflict) {
    throw new AppError('Year level already exists', 409)
  }

  const yearLevel = await YearLevel.findByIdAndUpdate(
    id,
    { $set: { code: data.code, label: data.label, numericLevel: data.numericLevel, isActive: data.isActive, sortOrder: data.sortOrder } },
    { new: true, runValidators: true }
  )

  await invalidateAcademic()
  return yearLevel
}

// ——— Sections ———

export const getSections = async (): Promise<any[]> => {
  const cached = await sectionCache.get('all')
  if (cached) {return cached}

  const sections = await Section.find()
    .populate('programId', 'code name')
    .populate('yearLevelId', 'code label numericLevel')
    .sort({ createdAt: -1 })

  await sectionCache.set('all', sections)
  return sections
}

export const createSection = async (data: any): Promise<any> => {
  const { programId, yearLevelId, name, displayName, isActive = true } = data

  const [program, yearLevel, sectionConflict] = await Promise.all([
    Program.findById(programId),
    YearLevel.findById(yearLevelId),
    Section.findOne({ programId, yearLevelId, name: String(name).trim() }),
  ])

  if (!program) {throw new AppError('Program not found', 404)}
  if (!yearLevel) {throw new AppError('Year level not found', 404)}
  if (sectionConflict) {throw new AppError('Section already exists for this program and year level', 409)}

  const section = await Section.create({ programId, yearLevelId, name, displayName, isActive })

  const populatedSection = await Section.findById(section._id)
    .populate('programId', 'code name')
    .populate('yearLevelId', 'code label numericLevel')

  await invalidateAcademic()
  return populatedSection
}

export const updateSection = async (id: string, data: any): Promise<any> => {
  const existingSection = await Section.findById(id)
  if (!existingSection) {
    throw new AppError('Section not found', 404)
  }

  const nextProgramId = data.programId ?? String(existingSection.programId)
  const nextYearLevelId = data.yearLevelId ?? String(existingSection.yearLevelId)
  const nextName = data.name ? String(data.name).trim() : existingSection.name

  const [program, yearLevel, sectionConflict] = await Promise.all([
    Program.findById(nextProgramId),
    YearLevel.findById(nextYearLevelId),
    Section.findOne({ _id: { $ne: id }, programId: nextProgramId, yearLevelId: nextYearLevelId, name: nextName }),
  ])

  if (!program) {throw new AppError('Program not found', 404)}
  if (!yearLevel) {throw new AppError('Year level not found', 404)}
  if (sectionConflict) {throw new AppError('Section already exists for this program and year level', 409)}

  const setFields: Record<string, unknown> = {}
  if (data.programId !== undefined) {setFields.programId = data.programId}
  if (data.yearLevelId !== undefined) {setFields.yearLevelId = data.yearLevelId}
  if (data.name !== undefined) {setFields.name = data.name}
  if (data.displayName !== undefined) {setFields.displayName = data.displayName}
  if (data.isActive !== undefined) {setFields.isActive = data.isActive}

  const section = await Section.findByIdAndUpdate(
    id,
    { $set: setFields },
    { new: true, runValidators: true }
  )
    .populate('programId', 'code name')
    .populate('yearLevelId', 'code label numericLevel')

  await invalidateAcademic()
  return section
}
