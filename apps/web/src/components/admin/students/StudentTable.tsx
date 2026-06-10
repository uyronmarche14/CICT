'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import type { Student } from '@/types';
import { getProgramLabel, getYearLevelLabel, getSectionLabel } from '@/utils/student-helpers';

interface StudentTableProps {
  students: Student[];
  loading: boolean;
  onEdit: (student: Student) => void;
  onStatusToggle: (student: Student) => void;
}

export function StudentTable({
  students,
  loading,
  onEdit,
  onStatusToggle,
}: StudentTableProps) {
  return (
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
  );
}
