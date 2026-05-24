'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { academicAPI } from '@/lib/api/academic';
import { studentsAPI, type StudentMutationPayload } from '@/lib/api/students';
import { Program, Section, Student, StudentStatus, YearLevel } from '@/types';
import { usePermissions } from '@/hooks/permissions/use-permissions';
import { useAdminPageAccess } from '@/hooks/permissions/use-admin-page-access';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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
};

const getProgramLabel = (program: Student['programId']) =>
  typeof program === 'string' ? program : `${program.code} - ${program.name}`;

const getYearLevelLabel = (yearLevel: Student['yearLevelId']) =>
  typeof yearLevel === 'string' ? yearLevel : yearLevel.label;

const getSectionLabel = (section: Student['sectionId']) =>
  typeof section === 'string' ? section : section.displayName;

export default function StudentsPage() {
  const {
    canAccessStudentsModule,
    canCreateStudent,
    canUpdateStudent,
    canSetStudentStatus,
  } = usePermissions();
  const { shouldRender } = useAdminPageAccess(canAccessStudentsModule());

  const [students, setStudents] = useState<Student[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [yearLevels, setYearLevels] = useState<YearLevel[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [programFilter, setProgramFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [form, setForm] = useState<StudentMutationPayload>(emptyStudentForm);
  const [formLoading, setFormLoading] = useState(false);

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

      <Card>
        <CardHeader>
          <CardTitle>{editingStudent ? 'Edit Student' : 'Create Student'}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="space-y-2">
            <Label>Student Number</Label>
            <Input
              value={form.studentNumber}
              onChange={(event) => setForm((current) => ({ ...current, studentNumber: event.target.value }))}
              disabled={editingStudent ? !canUpdateStudent() : !canCreateStudent()}
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              value={form.email ?? ''}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              disabled={editingStudent ? !canUpdateStudent() : !canCreateStudent()}
            />
          </div>
          <div className="space-y-2">
            <Label>{editingStudent ? 'New Password (optional)' : 'Password'}</Label>
            <Input
              type="password"
              value={form.password ?? ''}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              disabled={editingStudent ? !canUpdateStudent() : !canCreateStudent()}
            />
          </div>
          <div className="space-y-2">
            <Label>First Name</Label>
            <Input
              value={form.firstName}
              onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Last Name</Label>
            <Input
              value={form.lastName}
              onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Middle Name</Label>
            <Input
              value={form.middleName ?? ''}
              onChange={(event) => setForm((current) => ({ ...current, middleName: event.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Program</Label>
            <Select
              value={form.programId}
              onValueChange={(value) =>
                setForm((current) => ({ ...current, programId: value, sectionId: '' }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select program" />
              </SelectTrigger>
              <SelectContent>
                {programs.map((program) => (
                  <SelectItem key={program._id} value={program._id}>
                    {program.code} - {program.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Year Level</Label>
            <Select
              value={form.yearLevelId}
              onValueChange={(value) =>
                setForm((current) => ({ ...current, yearLevelId: value, sectionId: '' }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select year level" />
              </SelectTrigger>
              <SelectContent>
                {yearLevels.map((yearLevel) => (
                  <SelectItem key={yearLevel._id} value={yearLevel._id}>
                    {yearLevel.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Section</Label>
            <Select value={form.sectionId} onValueChange={(value) => setForm((current) => ({ ...current, sectionId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select section" />
              </SelectTrigger>
              <SelectContent>
                {filteredSections.map((section) => (
                  <SelectItem key={section._id} value={section._id}>
                    {section.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(value) =>
                setForm((current) => ({ ...current, status: value as StudentStatus }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(StudentStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-2 md:col-span-2 xl:col-span-3">
            <Button onClick={() => void handleSubmit()} disabled={formLoading}>
              {editingStudent ? 'Update Student' : 'Create Student'}
            </Button>
            {editingStudent ? (
              <Button variant="outline" onClick={resetForm} disabled={formLoading}>
                Cancel
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Student Directory</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <Input placeholder="Search students..." value={search} onChange={(event) => setSearch(event.target.value)} />
            <Select value={programFilter} onValueChange={setProgramFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Program" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All programs</SelectItem>
                {programs.map((program) => (
                  <SelectItem key={program._id} value={program._id}>
                    {program.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Year level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All year levels</SelectItem>
                {yearLevels.map((yearLevel) => (
                  <SelectItem key={yearLevel._id} value={yearLevel._id}>
                    {yearLevel.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sectionFilter} onValueChange={setSectionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sections</SelectItem>
                {sections.map((section) => (
                  <SelectItem key={section._id} value={section._id}>
                    {section.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {Object.values(StudentStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Academic</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No students found.
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((student) => (
                    <TableRow key={student._id}>
                      <TableCell>
                        <div className="font-medium">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="text-xs text-muted-foreground">{student.studentNumber}</div>
                        {student.email ? (
                          <div className="text-xs text-muted-foreground">{student.email}</div>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{getProgramLabel(student.programId)}</div>
                        <div className="text-xs text-muted-foreground">
                          {getYearLevelLabel(student.yearLevelId)} • {getSectionLabel(student.sectionId)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={student.isActive ? 'default' : 'secondary'}>
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{student.lastLoginAt ? new Date(student.lastLoginAt).toLocaleString() : 'Never'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(student)} disabled={!canUpdateStudent()}>
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => void handleStatusToggle(student)}
                            disabled={!canSetStudentStatus()}
                          >
                            {student.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
