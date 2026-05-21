'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { academicAPI } from '@/lib/api/academic';
import { Program, Section, YearLevel } from '@/types';
import { usePermissions } from '@/hooks/permissions/use-permissions';
import { useAdminPageAccess } from '@/hooks/permissions/use-admin-page-access';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export default function StudentSettingsPage() {
  const { canAccessStudentsModule, canManageAcademicGroups } = usePermissions();
  const { shouldRender } = useAdminPageAccess(canAccessStudentsModule());

  const [programs, setPrograms] = useState<Program[]>([]);
  const [yearLevels, setYearLevels] = useState<YearLevel[]>([]);
  const [sections, setSections] = useState<Section[]>([]);

  const [programForm, setProgramForm] = useState({ id: '', code: '', name: '', isActive: true });
  const [yearLevelForm, setYearLevelForm] = useState({
    id: '',
    code: '',
    label: '',
    numericLevel: 1,
    isActive: true,
  });
  const [sectionForm, setSectionForm] = useState({
    id: '',
    programId: '',
    yearLevelId: '',
    name: '',
    displayName: '',
    isActive: true,
  });

  const loadData = async () => {
    const [programData, yearLevelData, sectionData] = await Promise.all([
      academicAPI.getPrograms(),
      academicAPI.getYearLevels(),
      academicAPI.getSections(),
    ]);
    setPrograms(programData);
    setYearLevels(yearLevelData);
    setSections(sectionData);
  };

  useEffect(() => {
    void loadData();
  }, []);

  if (!shouldRender) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Settings</h1>
          <p className="text-muted-foreground">
            Manage programs, year levels, and sections.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/students">Back to Students</Link>
        </Button>
      </div>

      <Tabs defaultValue="programs">
        <TabsList>
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="year-levels">Year Levels</TabsTrigger>
          <TabsTrigger value="sections">Sections</TabsTrigger>
        </TabsList>

        <TabsContent value="programs">
          <Card>
            <CardHeader>
              <CardTitle>{programForm.id ? 'Edit Program' : 'Create Program'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Code</Label>
                  <Input value={programForm.code} onChange={(event) => setProgramForm((current) => ({ ...current, code: event.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={programForm.name} onChange={(event) => setProgramForm((current) => ({ ...current, name: event.target.value }))} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  disabled={!canManageAcademicGroups()}
                  onClick={async () => {
                    if (programForm.id) {
                      await academicAPI.updateProgram(programForm.id, programForm);
                    } else {
                      await academicAPI.createProgram(programForm);
                    }
                    setProgramForm({ id: '', code: '', name: '', isActive: true });
                    await loadData();
                  }}
                >
                  {programForm.id ? 'Update Program' : 'Create Program'}
                </Button>
                {programForm.id ? (
                  <Button variant="outline" onClick={() => setProgramForm({ id: '', code: '', name: '', isActive: true })}>
                    Cancel
                  </Button>
                ) : null}
              </div>
              <div className="space-y-3">
                {programs.map((program) => (
                  <div key={program._id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <div className="font-medium">{program.code}</div>
                      <div className="text-sm text-muted-foreground">{program.name}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={program.isActive ? 'default' : 'secondary'}>
                        {program.isActive ? 'active' : 'inactive'}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setProgramForm({
                            id: program._id,
                            code: program.code,
                            name: program.name,
                            isActive: program.isActive,
                          })
                        }
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="year-levels">
          <Card>
            <CardHeader>
              <CardTitle>{yearLevelForm.id ? 'Edit Year Level' : 'Create Year Level'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Code</Label>
                  <Input value={yearLevelForm.code} onChange={(event) => setYearLevelForm((current) => ({ ...current, code: event.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Label</Label>
                  <Input value={yearLevelForm.label} onChange={(event) => setYearLevelForm((current) => ({ ...current, label: event.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Numeric Level</Label>
                  <Input
                    type="number"
                    value={yearLevelForm.numericLevel}
                    onChange={(event) =>
                      setYearLevelForm((current) => ({
                        ...current,
                        numericLevel: Number(event.target.value),
                      }))
                    }
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  disabled={!canManageAcademicGroups()}
                  onClick={async () => {
                    if (yearLevelForm.id) {
                      await academicAPI.updateYearLevel(yearLevelForm.id, yearLevelForm);
                    } else {
                      await academicAPI.createYearLevel(yearLevelForm);
                    }
                    setYearLevelForm({ id: '', code: '', label: '', numericLevel: 1, isActive: true });
                    await loadData();
                  }}
                >
                  {yearLevelForm.id ? 'Update Year Level' : 'Create Year Level'}
                </Button>
                {yearLevelForm.id ? (
                  <Button
                    variant="outline"
                    onClick={() =>
                      setYearLevelForm({ id: '', code: '', label: '', numericLevel: 1, isActive: true })
                    }
                  >
                    Cancel
                  </Button>
                ) : null}
              </div>
              <div className="space-y-3">
                {yearLevels.map((yearLevel) => (
                  <div key={yearLevel._id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <div className="font-medium">{yearLevel.label}</div>
                      <div className="text-sm text-muted-foreground">{yearLevel.code}</div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setYearLevelForm({
                          id: yearLevel._id,
                          code: yearLevel.code,
                          label: yearLevel.label,
                          numericLevel: yearLevel.numericLevel,
                          isActive: yearLevel.isActive,
                        })
                      }
                    >
                      Edit
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sections">
          <Card>
            <CardHeader>
              <CardTitle>{sectionForm.id ? 'Edit Section' : 'Create Section'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Program</Label>
                  <Select value={sectionForm.programId} onValueChange={(value) => setSectionForm((current) => ({ ...current, programId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select program" />
                    </SelectTrigger>
                    <SelectContent>
                      {programs.map((program) => (
                        <SelectItem key={program._id} value={program._id}>
                          {program.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Year Level</Label>
                  <Select value={sectionForm.yearLevelId} onValueChange={(value) => setSectionForm((current) => ({ ...current, yearLevelId: value }))}>
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
                  <Label>Name</Label>
                  <Input value={sectionForm.name} onChange={(event) => setSectionForm((current) => ({ ...current, name: event.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Display Name</Label>
                  <Input value={sectionForm.displayName} onChange={(event) => setSectionForm((current) => ({ ...current, displayName: event.target.value }))} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  disabled={!canManageAcademicGroups()}
                  onClick={async () => {
                    if (sectionForm.id) {
                      await academicAPI.updateSection(sectionForm.id, sectionForm);
                    } else {
                      await academicAPI.createSection(sectionForm);
                    }
                    setSectionForm({
                      id: '',
                      programId: '',
                      yearLevelId: '',
                      name: '',
                      displayName: '',
                      isActive: true,
                    });
                    await loadData();
                  }}
                >
                  {sectionForm.id ? 'Update Section' : 'Create Section'}
                </Button>
                {sectionForm.id ? (
                  <Button
                    variant="outline"
                    onClick={() =>
                      setSectionForm({
                        id: '',
                        programId: '',
                        yearLevelId: '',
                        name: '',
                        displayName: '',
                        isActive: true,
                      })
                    }
                  >
                    Cancel
                  </Button>
                ) : null}
              </div>
              <div className="space-y-3">
                {sections.map((section) => (
                  <div key={section._id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <div className="font-medium">{section.displayName}</div>
                      <div className="text-sm text-muted-foreground">
                        {typeof section.programId === 'string' ? section.programId : section.programId.code} •{' '}
                        {typeof section.yearLevelId === 'string'
                          ? section.yearLevelId
                          : section.yearLevelId.label}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setSectionForm({
                          id: section._id,
                          programId:
                            typeof section.programId === 'string'
                              ? section.programId
                              : section.programId._id,
                          yearLevelId:
                            typeof section.yearLevelId === 'string'
                              ? section.yearLevelId
                              : section.yearLevelId._id,
                          name: section.name,
                          displayName: section.displayName,
                          isActive: section.isActive,
                        })
                      }
                    >
                      Edit
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
