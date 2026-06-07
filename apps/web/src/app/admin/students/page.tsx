'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { academicAPI } from '@/lib/api/academic';
import { studentsAPI, type StudentMutationPayload } from '@/lib/api/students';
import { StudentStatus } from '@cict/contracts/enums';
import { Program, Section, Student, YearLevel } from '@/types';
import { usePermissions } from '@/hooks/permissions/use-permissions';
import { useAdminPageAccess } from '@/hooks/permissions/use-admin-page-access';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

const emptyStudentForm: StudentMutationPayload = {
  studentNumber: '',
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  middleName: '',
  programId: '',
  yearLevelId: '',
  sectionId: '',
  status: StudentStatus.PENDING,
  isActive: false,
  profilePhoto: '',
  phone: '',
  address: '',
  birthDate: '',
  aboutMe: '',
  enrollmentDate: '',
  expectedGraduationYear: 0,
  previousSchool: '',
  guardianName: '',
  guardianContact: '',
  guardianRelationship: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  emergencyContactRelationship: '',
  notificationPreferences: {
    email: true,
    push: true,
    sms: false,
  },
};

import { StudentForm } from '@/components/admin/StudentForm';
import { StudentDirectory } from '@/components/admin/StudentDirectory';

export default function StudentsPage() {
  const { canAccessStudentsModule } = usePermissions();
  const { shouldRender } = useAdminPageAccess(canAccessStudentsModule());

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [yearLevels, setYearLevels] = useState<YearLevel[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [search, setSearch] = useState('');
  const [programFilter, setProgramFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [form, setForm] = useState<StudentMutationPayload>(emptyStudentForm);
  const [formLoading, setFormLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('directory');

  const filteredSections = useMemo(
    () =>
      sections.filter((section) => {
        const sectionProgramId =
          typeof section.programId === 'string' ? section.programId : section.programId._id;
        const sectionYearLevelId =
          typeof section.yearLevelId === 'string' ? section.yearLevelId : section.yearLevelId._id;
        const matchesProgram = !form.programId || sectionProgramId === form.programId;
        const matchesYear = !form.yearLevelId || sectionYearLevelId === form.yearLevelId;
        return matchesProgram && matchesYear;
      }),
    [form.programId, form.yearLevelId, sections]
  );

  const loadAcademicData = async () => {
    const [programData, yearLevelData, sectionData] = await Promise.all([
      academicAPI.getPrograms(),
      academicAPI.getYearLevels(),
      academicAPI.getSections(),
    ]);
    setPrograms(programData);
    setYearLevels(yearLevelData);
    setSections(sectionData);
  };

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await studentsAPI.getAll({
        page: 1,
        limit: 100,
        search: search || undefined,
        programId: programFilter === 'all' ? undefined : programFilter,
        yearLevelId: yearFilter === 'all' ? undefined : yearFilter,
        sectionId: sectionFilter === 'all' ? undefined : sectionFilter,
        status: statusFilter === 'all' ? undefined : statusFilter,
      });
      setStudents(data.students);
    } finally {
      setLoading(false);
    }
  }, [programFilter, search, sectionFilter, statusFilter, yearFilter]);

  useEffect(() => {
    void loadAcademicData();
  }, []);

  useEffect(() => {
    void loadStudents();
  }, [loadStudents]);


  const resetForm = () => {
    setEditingStudent(null);
    setForm(emptyStudentForm);
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setActiveTab('form');
    setForm({
      studentNumber: student.studentNumber,
      email: student.email ?? '',
      password: '',
      firstName: student.firstName,
      lastName: student.lastName,
      middleName: student.middleName ?? '',
      programId: typeof student.programId === 'string' ? student.programId : student.programId._id,
      yearLevelId:
        typeof student.yearLevelId === 'string' ? student.yearLevelId : student.yearLevelId._id,
      sectionId: typeof student.sectionId === 'string' ? student.sectionId : student.sectionId._id,
      status: student.status,
      isActive: student.isActive,
      profilePhoto: student.profilePhoto ?? '',
      phone: student.phone ?? '',
      address: student.address ?? '',
      birthDate: student.birthDate ?? '',
      aboutMe: student.aboutMe ?? '',
      enrollmentDate: student.enrollmentDate ?? '',
      expectedGraduationYear: student.expectedGraduationYear ?? 0,
      previousSchool: student.previousSchool ?? '',
      guardianName: student.guardianName ?? '',
      guardianContact: student.guardianContact ?? '',
      guardianRelationship: student.guardianRelationship ?? '',
      emergencyContactName: student.emergencyContactName ?? '',
      emergencyContactPhone: student.emergencyContactPhone ?? '',
      emergencyContactRelationship: student.emergencyContactRelationship ?? '',
      notificationPreferences: student.notificationPreferences ?? {
        email: true,
        push: true,
        sms: false,
      },
    });
  };

  const handleSubmit = async () => {
    setFormLoading(true);
    try {
      if (editingStudent) {
        await studentsAPI.update(editingStudent._id, form);
      } else {
        await studentsAPI.create(form);
      }
      resetForm();
      await loadStudents();
    } finally {
      setFormLoading(false);
    }
  };

  const handleStatusToggle = async (student: Student) => {
    const nextIsActive = !student.isActive;
    const nextStatus = nextIsActive ? StudentStatus.ACTIVE : StudentStatus.INACTIVE;
    await studentsAPI.updateStatus(student._id, {
      status: nextStatus,
      isActive: nextIsActive,
    });
    await loadStudents();
  };

  if (!shouldRender) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Students</h1>
          <p className="text-muted-foreground">
            Manage student accounts and academic assignments.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/students/settings">Student Settings</Link>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="form">{editingStudent ? 'Edit Student' : 'Add Student'}</TabsTrigger>
          <TabsTrigger value="directory">Student Directory</TabsTrigger>
        </TabsList>

        <TabsContent value="form" className="mt-6">
          <StudentForm
            form={form}
            editingStudent={editingStudent}
            programs={programs}
            yearLevels={yearLevels}
            sections={sections}
            filteredSections={filteredSections}
            formLoading={formLoading}
            onFormChange={(updates) => setForm((current) => ({ ...current, ...updates }))}
            onSubmit={() => void handleSubmit()}
            onCancel={resetForm}
          />
        </TabsContent>

        <TabsContent value="directory" className="mt-6">
          <StudentDirectory
            students={students}
            programs={programs}
            yearLevels={yearLevels}
            sections={sections}
            loading={loading}
            search={search}
            programFilter={programFilter}
            yearFilter={yearFilter}
            sectionFilter={sectionFilter}
            statusFilter={statusFilter}
            onSearchChange={setSearch}
            onProgramFilterChange={setProgramFilter}
            onYearFilterChange={setYearFilter}
            onSectionFilterChange={setSectionFilter}
            onStatusFilterChange={setStatusFilter}
            onEdit={handleEdit}
            onStatusToggle={(s) => void handleStatusToggle(s)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
