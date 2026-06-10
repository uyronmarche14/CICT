'use client';

import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { StudentStatus } from '@cict/contracts/enums';
import type { Program, Section, YearLevel } from '@/types';

interface StudentFiltersProps {
  search: string;
  programFilter: string;
  yearFilter: string;
  sectionFilter: string;
  statusFilter: string;
  programs: Program[];
  yearLevels: YearLevel[];
  sections: Section[];
  onSearchChange: (value: string) => void;
  onProgramFilterChange: (value: string) => void;
  onYearFilterChange: (value: string) => void;
  onSectionFilterChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
}

export function StudentFilters({
  search,
  programFilter,
  yearFilter,
  sectionFilter,
  statusFilter,
  programs,
  yearLevels,
  sections,
  onSearchChange,
  onProgramFilterChange,
  onYearFilterChange,
  onSectionFilterChange,
  onStatusFilterChange,
}: StudentFiltersProps) {
  return (
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
  );
}
