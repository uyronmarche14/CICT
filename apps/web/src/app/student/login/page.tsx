'use client';

import { useState, Suspense } from 'react';
import React from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useStudentAuth } from '@/context/StudentAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, GraduationCap } from 'lucide-react';
import Link from 'next/link';

const loginSchema = z.object({
  studentNumber: z.string().min(1, 'Student number is required'),
  password: z.string().min(1, 'Password is required'),
});

type InputFieldProps = React.ComponentProps<typeof Input>;
type LoginFormValues = z.infer<typeof loginSchema>;

function LoginForm() {
  const { login } = useStudentAuth();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || undefined;
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError('');
    setLoading(true);
    try {
      await login(data.studentNumber, data.password, redirect);
    } catch {
      setError('Invalid student number or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <div className="p-3 rounded-full bg-primary/10">
              <GraduationCap className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Student Portal</CardTitle>
          <CardDescription>Sign in with your student credentials</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="studentNumber"
                render={({ field }: { field: InputFieldProps }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Student Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 2024-00001" autoFocus {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }: { field: InputFieldProps }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter your password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Sign In
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <Link href="/" className="hover:underline">← Back to home</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function StudentLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
