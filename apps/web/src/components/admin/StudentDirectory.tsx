'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import { StudentStatus } from '@cict/contracts/enums';
import type { Program, Section, Student, YearLevel } from '@/types';
import { getProgramLabel, getYearLevelLabel, getSectionLabel } from '@/utils/student-helpers';

interface StudentDirectoryProps {
  students: Student[];
  programs: Program[];
  yearLevels: YearLevel[];
  sections: Section[];
  loading: boolean;
  search: string;
  programFilter: string;
  yearFilter: string;
  sectionFilter: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onProgramFilterChange: (value: string) => void;
  onYearFilterChange: (value: string) => void;
  onSectionFilterChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onEdit: (student: Student) => void;
  onStatusToggle: (student: Student) => void;
}

export function StudentDirectory({
  students,
  programs,
  yearLevels,
  sections,
  loading,
  search,
  programFilter,
  yearFilter,
  sectionFilter,
  statusFilter,
  onSearchChange,
  onProgramFilterChange,
  onYearFilterChange,
  onSectionFilterChange,
  onStatusFilterChange,
  onEdit,
  onStatusToggle,
}: StudentDirectoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Directory</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <Input
            placeholder="Search students..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-[200px]"
          />
          <Select value={programFilter} onValueChange={onProgramFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Programs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Programs</SelectItem>
              {programs.map((p) => (
                <SelectItem key={p._id} value={p._id}>{p.code} - {p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={yearFilter} onValueChange={onYearFilterChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {yearLevels.map((yl) => (
                <SelectItem key={yl._id} value={yl._id}>{yl.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sectionFilter} onValueChange={onSectionFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Sections" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sections</SelectItem>
              {sections.map((s) => (
                <SelectItem key={s._id} value={s._id}>{s.displayName || s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {Object.values(StudentStatus).map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
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
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">Loading...</TableCell>
                </TableRow>
              ) : students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">No students found.</TableCell>
                </TableRow>
              ) : (
                students.map((student) => (
                  <TableRow key={student._id}>
                    <TableCell>
                      <Link href={`/admin/students/${student._id}`} className="font-medium hover:text-primary">
                        {student.firstName} {student.lastName}
                      </Link>
                      <div className="text-sm text-muted-foreground">{student.studentNumber}</div>
                      <div className="text-xs text-muted-foreground">{student.email}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{getProgramLabel(student.programId)}</div>
                      <div className="text-xs text-muted-foreground">{getYearLevelLabel(student.yearLevelId)}</div>
                      <div className="text-xs text-muted-foreground">{getSectionLabel(student.sectionId)}</div>
                    </TableCell>
                    <TableCell>{student.phone || '—'}</TableCell>
                    <TableCell>
                      <Badge variant={student.isActive ? 'default' : 'secondary'}>
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {student.lastLoginAt
                        ? new Date(student.lastLoginAt).toLocaleDateString()
                        : 'Never'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => onEdit(student)}>
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onStatusToggle(student)}
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
  );
}
