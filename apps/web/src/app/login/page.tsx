'use client';

import axios from 'axios';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  Lock,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { getApiErrorMessage } from '@/lib/api/errors';
import { useAuth } from '@/context/AuthContext';
import { useStudentAuth } from '@/context/StudentAuthContext';
import {
  studentAuthAPI,
  type StudentAcademicOptionsResponse,
  type StudentRegisterPayload,
} from '@/lib/api/student';
import type { Section } from '@/types';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CldImage } from 'next-cloudinary';
import { adminAuthFeatureAPI } from '@/features/auth';

type AuthTab = 'student' | 'admin';
type StudentMode = 'login' | 'register';

const emptyOptions: StudentAcademicOptionsResponse = {
  programs: [],
  yearLevels: [],
  sections: [],
};

const sectionRefId = (value: Section['programId'] | Section['yearLevelId']) =>
  typeof value === 'string' ? value : value._id;

const loginSlides = [
  { src: 'cict4_qqksfh', alt: 'CICT Campus building' },
  { src: '529718384_122100992648966778_7029427848362639164_n_geskab', alt: 'CICT students at a campus event' },
  { src: '459388087_1210395166778357_1242381946816835441_n_vrx5th', alt: 'CICT events and activities' },
  { src: 'CHOSEN_113_UY_RON_MARCHE_RHYSS_TCU02223_d0xhvg', alt: 'CICT student community' },
];

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login: applyAdminLogin } = useAuth();
  const { login: applyStudentLogin } = useStudentAuth();

  const requestedTab = searchParams.get('tab') === 'admin' ? 'admin' : 'student';
  const redirect = searchParams.get('redirect') || undefined;
  const [activeTab, setActiveTab] = useState<AuthTab>(requestedTab);
  const [studentMode, setStudentMode] = useState<StudentMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [academicOptions, setAcademicOptions] = useState<StudentAcademicOptionsResponse>(emptyOptions);

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % loginSlides.length);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const [adminForm, setAdminForm] = useState({ email: '', password: '' });
  const [studentLoginForm, setStudentLoginForm] = useState({ studentNumber: '', password: '' });
  const [studentRegisterForm, setStudentRegisterForm] = useState<
    StudentRegisterPayload & { confirmPassword: string }
  >({
    studentNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    middleName: '',
    programId: '',
    yearLevelId: '',
    sectionId: '',
  });

  useEffect(() => {
    setActiveTab(requestedTab);
  }, [requestedTab]);

  useEffect(() => {
    if (activeTab !== 'student' || studentMode !== 'register') {
      return;
    }

    let ignore = false;
    setOptionsLoading(true);
    studentAuthAPI
      .getAcademicOptions()
      .then((data) => {
        if (!ignore) {
          setAcademicOptions(data);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          setError(getApiErrorMessage(err, 'Academic options are temporarily unavailable.'));
        }
      })
      .finally(() => {
        if (!ignore) {
          setOptionsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [activeTab, studentMode]);

  const filteredSections = useMemo(
    () =>
      academicOptions.sections.filter((section) => {
        const matchesProgram =
          studentRegisterForm.programId &&
          sectionRefId(section.programId) === studentRegisterForm.programId;
        const matchesYear =
          studentRegisterForm.yearLevelId &&
          sectionRefId(section.yearLevelId) === studentRegisterForm.yearLevelId;
        return matchesProgram && matchesYear;
      }),
    [academicOptions.sections, studentRegisterForm.programId, studentRegisterForm.yearLevelId]
  );

  const resetFeedback = () => {
    setError('');
    setSuccess('');
  };

  const handleAdminLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetFeedback();
    setLoading(true);

    try {
      const authProfile = await adminAuthFeatureAPI.login(adminForm);

      if (!authProfile.user) {
        setError('Invalid server response. Please contact support.');
        return;
      }

      if (!authProfile.canAccessAdmin) {
        setError('Your credentials are valid, but this account does not have admin access.');
        return;
      }

      applyAdminLogin(authProfile);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError('Invalid email or password.');
      } else if (axios.isAxiosError(err) && !err.response) {
        setError('Cannot reach the backend right now. Please try again later.');
      } else {
        setError(getApiErrorMessage(err, 'Admin login failed. Please try again.'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStudentLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetFeedback();
    setLoading(true);

    try {
      await applyStudentLogin(studentLoginForm.studentNumber, studentLoginForm.password, redirect);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        setError('Your student account is not active yet. Please wait for admin acceptance.');
      } else if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError('Invalid student number or password.');
      } else if (axios.isAxiosError(err) && !err.response) {
        setError('Cannot reach the backend right now. Please try again later.');
      } else {
        setError(getApiErrorMessage(err, 'Student login failed. Please try again.'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStudentRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetFeedback();

    if (studentRegisterForm.password !== studentRegisterForm.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (
      !studentRegisterForm.programId ||
      !studentRegisterForm.yearLevelId ||
      !studentRegisterForm.sectionId
    ) {
      setError('Please select your program, year level, and section.');
      return;
    }

    setLoading(true);
    try {
      const payload: StudentRegisterPayload = {
        studentNumber: studentRegisterForm.studentNumber,
        email: studentRegisterForm.email || undefined,
        password: studentRegisterForm.password,
        firstName: studentRegisterForm.firstName,
        lastName: studentRegisterForm.lastName,
        middleName: studentRegisterForm.middleName || undefined,
        programId: studentRegisterForm.programId,
        yearLevelId: studentRegisterForm.yearLevelId,
        sectionId: studentRegisterForm.sectionId,
      };
      await studentAuthAPI.register(payload);
      setSuccess('Request submitted. An admin must accept your student account before you can sign in.');
      setStudentMode('login');
      setStudentLoginForm((current) => ({
        ...current,
        studentNumber: studentRegisterForm.studentNumber,
      }));
      setStudentRegisterForm({
        studentNumber: '',
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        middleName: '',
        programId: '',
        yearLevelId: '',
        sectionId: '',
      });
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setError(getApiErrorMessage(err, 'Student number or email already exists.'));
      } else if (axios.isAxiosError(err) && !err.response) {
        setError('Cannot reach the backend right now. Please try again later.');
      } else {
        setError(getApiErrorMessage(err, 'Could not submit your request. Please review the form.'));
      }
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (value: string) => {
    resetFeedback();
    setActiveTab(value as AuthTab);
    setStudentMode('login');
    router.replace(`/login?tab=${value}${redirect ? `&redirect=${encodeURIComponent(redirect)}` : ''}`);
  };

  return (
    <main className="min-h-svh bg-canvas">
      <div className="grid min-h-svh md:grid-cols-2">
        <section
          className="group relative hidden overflow-hidden md:flex"
        >
          <div className="absolute inset-0">
            {loginSlides.map((slide, i) => (
              <div
                key={slide.src}
                className="absolute inset-0 transition-opacity duration-1000"
                style={{ opacity: i === currentSlide ? 1 : 0, zIndex: i === currentSlide ? 1 : 0 }}
              >
                <CldImage
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  className="object-cover"
                  sizes="50vw"
                  priority={i === 0}
                />
              </div>
            ))}
          </div>

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/15" />

          <div className="relative z-10 mt-auto flex flex-col gap-4 p-8 lg:p-10">
            <div>
              <h1 className="text-4xl font-display font-black leading-none text-white lg:text-5xl xl:text-6xl">
                CICT Portal
              </h1>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/75 lg:text-base">
                Your digital gateway to CICT updates, events, and student resources.
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              {loginSlides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Slide ${i + 1}`}
                  onClick={() => setCurrentSlide(i)}
                  className={cn(
                    'h-2 rounded-full transition-all duration-300',
                    i === currentSlide
                      ? 'w-7 bg-white'
                      : 'w-2 bg-white/40 hover:bg-white/70'
                  )}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="overflow-y-auto flex w-full flex-col items-center justify-center p-8 md:p-12">
          <div className="mx-auto w-full max-w-lg space-y-4">
          <div className="flex flex-col items-center gap-3 text-center md:hidden backdrop-blur-sm">
            <div className="flex size-12 items-center justify-center rounded-2xl border border-primary/15 bg-primary text-primary-foreground shadow-[var(--shadow-card)]">
              <GraduationCap className="size-6" />
            </div>
            <div>
              <h1 className="text-4xl font-black leading-none text-primary">CICT Portal</h1>
              <p className="mt-2 text-sm text-muted-foreground">Secure access for admins and students.</p>
            </div>
          </div>

          <Card className="rounded-3xl border border-white/20 bg-transparent shadow-2xl backdrop-blur-xl dark:border-white/10">
            <CardHeader className="gap-3 text-center">
              <div className="mx-auto flex size-11 items-center justify-center rounded-2xl border border-primary/10 bg-primary/10 text-primary">
                {activeTab === 'admin' ? <ShieldCheck className="size-5" /> : <Sparkles className="size-5" />}
              </div>
              <div>
                <CardTitle className="text-2xl">
                  {activeTab === 'admin'
                    ? 'Admin Sign In'
                    : studentMode === 'login'
                      ? 'Student Sign In'
                      : 'Request Student Access'}
                </CardTitle>
                <CardDescription>
                  {activeTab === 'admin'
                    ? 'Use your admin credentials to continue.'
                    : studentMode === 'login'
                      ? 'Use your student account after admin acceptance.'
                      : 'Submit your details for admin acceptance.'}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="flex flex-col gap-5">
              <Tabs value={activeTab} onValueChange={switchTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="student">Student</TabsTrigger>
                  <TabsTrigger value="admin">Admin</TabsTrigger>
                </TabsList>

                {(error || success) && (
                  <Alert
                    className={cn(
                      'mt-4',
                      success && 'border-primary/20 bg-primary/5 text-primary'
                    )}
                    variant={error ? 'destructive' : 'default'}
                  >
                    {error ? <AlertCircle className="size-4" /> : <CheckCircle2 className="size-4" />}
                    <AlertTitle>{error ? 'Check this first' : 'Request received'}</AlertTitle>
                    <AlertDescription>{error || success}</AlertDescription>
                  </Alert>
                )}

                <TabsContent value="student" className="mt-5">
                  {studentMode === 'login' ? (
                    <form onSubmit={handleStudentLogin} className="flex flex-col gap-4">
                      <Field label="Student Number">
                        <Input
                          value={studentLoginForm.studentNumber}
                          onChange={(event) =>
                            setStudentLoginForm((current) => ({
                              ...current,
                              studentNumber: event.target.value,
                            }))
                          }
                          placeholder="e.g. 2024-00001"
                          autoComplete="username"
                          required
                        />
                      </Field>
                      <PasswordField
                        label="Password"
                        value={studentLoginForm.password}
                        show={showPassword}
                        onToggle={() => setShowPassword((current) => !current)}
                        onChange={(value) =>
                          setStudentLoginForm((current) => ({ ...current, password: value }))
                        }
                      />
                      <Button type="submit" className="h-11 w-full" disabled={loading}>
                        {loading ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}
                        Sign In
                      </Button>
                      <p className="text-center text-sm text-muted-foreground">
                        Need student access?{' '}
                        <button
                          type="button"
                          className="font-semibold text-primary hover:underline"
                          onClick={() => {
                            resetFeedback();
                            setStudentMode('register');
                          }}
                        >
                          Register for approval
                        </button>
                      </p>
                    </form>
                  ) : (
                    <form onSubmit={handleStudentRegister} className="flex flex-col gap-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="First Name">
                          <Input
                            value={studentRegisterForm.firstName}
                            onChange={(event) =>
                              setStudentRegisterForm((current) => ({
                                ...current,
                                firstName: event.target.value,
                              }))
                            }
                            required
                          />
                        </Field>
                        <Field label="Last Name">
                          <Input
                            value={studentRegisterForm.lastName}
                            onChange={(event) =>
                              setStudentRegisterForm((current) => ({
                                ...current,
                                lastName: event.target.value,
                              }))
                            }
                            required
                          />
                        </Field>
                        <Field label="Middle Name">
                          <Input
                            value={studentRegisterForm.middleName}
                            onChange={(event) =>
                              setStudentRegisterForm((current) => ({
                                ...current,
                                middleName: event.target.value,
                              }))
                            }
                          />
                        </Field>
                        <Field label="Student Number">
                          <Input
                            value={studentRegisterForm.studentNumber}
                            onChange={(event) =>
                              setStudentRegisterForm((current) => ({
                                ...current,
                                studentNumber: event.target.value,
                              }))
                            }
                            placeholder="e.g. 2024-00001"
                            required
                          />
                        </Field>
                      </div>
                      <Field label="Email">
                        <Input
                          type="email"
                          value={studentRegisterForm.email}
                          onChange={(event) =>
                            setStudentRegisterForm((current) => ({
                              ...current,
                              email: event.target.value,
                            }))
                          }
                          placeholder="Optional"
                        />
                      </Field>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <PasswordField
                          label="Password"
                          value={studentRegisterForm.password}
                          show={showPassword}
                          onToggle={() => setShowPassword((current) => !current)}
                          onChange={(value) =>
                            setStudentRegisterForm((current) => ({ ...current, password: value }))
                          }
                        />
                        <PasswordField
                          label="Confirm Password"
                          value={studentRegisterForm.confirmPassword}
                          show={showConfirmPassword}
                          onToggle={() => setShowConfirmPassword((current) => !current)}
                          onChange={(value) =>
                            setStudentRegisterForm((current) => ({
                              ...current,
                              confirmPassword: value,
                            }))
                          }
                        />
                      </div>
                      <AcademicSelects
                        options={academicOptions}
                        optionsLoading={optionsLoading}
                        filteredSections={filteredSections}
                        value={studentRegisterForm}
                        onChange={(updates) =>
                          setStudentRegisterForm((current) => ({ ...current, ...updates }))
                        }
                      />
                      <Button type="submit" className="h-11 w-full" disabled={loading || optionsLoading}>
                        {loading ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                        Submit Request
                      </Button>
                      <p className="text-center text-sm text-muted-foreground">
                        Already accepted?{' '}
                        <button
                          type="button"
                          className="font-semibold text-primary hover:underline"
                          onClick={() => {
                            resetFeedback();
                            setStudentMode('login');
                          }}
                        >
                          Sign in
                        </button>
                      </p>
                    </form>
                  )}
                </TabsContent>

                <TabsContent value="admin" className="mt-5">
                  <form onSubmit={handleAdminLogin} className="flex flex-col gap-4">
                    <Field label="Email">
                      <Input
                        type="email"
                        value={adminForm.email}
                        onChange={(event) =>
                          setAdminForm((current) => ({ ...current, email: event.target.value }))
                        }
                        placeholder="admin@example.com"
                        autoComplete="email"
                        required
                      />
                    </Field>
                    <PasswordField
                      label="Password"
                      value={adminForm.password}
                      show={showPassword}
                      onToggle={() => setShowPassword((current) => !current)}
                      onChange={(value) => setAdminForm((current) => ({ ...current, password: value }))}
                    />
                    <Button type="submit" className="h-11 w-full" disabled={loading}>
                      {loading ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
                      Sign In
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="space-y-4 pt-2">
            <div className="relative flex items-center justify-center">
              <div className="h-px flex-1 bg-border/40" />
              <div className="mx-3 h-1.5 w-1.5 rounded-full bg-primary/40" />
              <div className="h-px flex-1 bg-border/40" />
            </div>

            <div className="text-center text-xs leading-relaxed text-muted-foreground">
              <p>
                By signing in, you agree to the{' '}
                <button
                  type="button"
                  className="font-medium text-primary hover:underline"
                >
                  Terms of Service
                </button>{' '}
                and{' '}
                <button
                  type="button"
                  className="font-medium text-primary hover:underline"
                >
                  Privacy Policy
                </button>.
              </p>
              <p className="mt-2">
                Your information is protected and used only for academic administration purposes.
              </p>
              <p className="mt-3 font-medium text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
                College of Information and Communications Technology
              </p>
            </div>
          </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function PasswordField({
  label,
  value,
  show,
  onToggle,
  onChange,
}: {
  label: string;
  value: string;
  show: boolean;
  onToggle: () => void;
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label}>
      <div className="relative">
        <Input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete="current-password"
          required
          className="pr-11"
        />
        <button
          type="button"
          aria-label={show ? 'Hide password' : 'Show password'}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md text-muted-foreground transition-colors hover:text-primary"
          onClick={onToggle}
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </Field>
  );
}

function AcademicSelects({
  options,
  optionsLoading,
  filteredSections,
  value,
  onChange,
}: {
  options: StudentAcademicOptionsResponse;
  optionsLoading: boolean;
  filteredSections: Section[];
  value: StudentRegisterPayload;
  onChange: (updates: Partial<StudentRegisterPayload>) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Program">
        <Select
          value={value.programId}
          onValueChange={(programId) => onChange({ programId, sectionId: '' })}
          disabled={optionsLoading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={optionsLoading ? 'Loading programs...' : 'Select program'} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {options.programs.map((program) => (
                <SelectItem key={program._id} value={program._id}>
                  {program.code} - {program.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
      <Field label="Year Level">
        <Select
          value={value.yearLevelId}
          onValueChange={(yearLevelId) => onChange({ yearLevelId, sectionId: '' })}
          disabled={optionsLoading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={optionsLoading ? 'Loading year levels...' : 'Select year level'} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {options.yearLevels.map((yearLevel) => (
                <SelectItem key={yearLevel._id} value={yearLevel._id}>
                  {yearLevel.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
      <div className="sm:col-span-2">
        <Field label="Section">
          <Select
            value={value.sectionId}
            onValueChange={(sectionId) => onChange({ sectionId })}
            disabled={optionsLoading || !value.programId || !value.yearLevelId}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select section" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {filteredSections.map((section) => (
                  <SelectItem key={section._id} value={section._id}>
                    {section.displayName || section.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-svh items-center justify-center bg-canvas">
          <Loader2 className="size-8 animate-spin text-primary" />
        </main>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
