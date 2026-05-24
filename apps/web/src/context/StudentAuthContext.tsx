'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { studentAuthAPI } from '@/lib/api/student';

interface StudentUser {
  _id: string;
  studentNumber: string;
  firstName: string;
  lastName: string;
  email?: string;
}

interface StudentAuthContextType {
  student: StudentUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (studentNumber: string, password: string, redirectTo?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const StudentAuthContext = createContext<StudentAuthContextType | undefined>(undefined);

export function StudentAuthProvider({ children }: { children: ReactNode }) {
  const [student, setStudent] = useState<StudentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('student_access_token');
    if (!token) {
      setLoading(false);
      return;
    }
    studentAuthAPI.me()
      .then((s) => setStudent(s))
      .catch(() => {
        localStorage.removeItem('student_access_token');
        localStorage.removeItem('student_refresh_token');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (studentNumber: string, password: string, redirectTo?: string) => {
    const data = await studentAuthAPI.login(studentNumber, password);
    localStorage.setItem('student_access_token', data.accessToken);
    localStorage.setItem('student_refresh_token', data.refreshToken);
    setStudent({
      _id: data.student._id,
      studentNumber: data.student.studentNumber,
      firstName: data.student.firstName,
      lastName: data.student.lastName,
      email: data.student.email,
    });
    router.push(redirectTo || '/student/events');
  }, [router]);

  const logout = useCallback(async () => {
    try {
      await studentAuthAPI.logout();
    } catch {
      // ignore
    }
    localStorage.removeItem('student_access_token');
    localStorage.removeItem('student_refresh_token');
    setStudent(null);
    router.push('/student/login');
  }, [router]);

  return (
    <StudentAuthContext.Provider
      value={{
        student,
        loading,
        isAuthenticated: !!student,
        login,
        logout,
      }}
    >
      {children}
    </StudentAuthContext.Provider>
  );
}

export function useStudentAuth() {
  const context = useContext(StudentAuthContext);
  if (!context) throw new Error('useStudentAuth must be used within StudentAuthProvider');
  return context;
}
