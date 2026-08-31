'use server';

import { createClient } from '@/lib/supabase/server';
import { ReportFrequency } from '@/types';
import { revalidatePath } from 'next/cache';

export async function updateProfile(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: 'SpendWise says: Unauthorized user session.' };
  }

  const fullName = (formData.get('fullName') as string)?.trim();
  const reportFrequency = (formData.get('reportFrequency') as ReportFrequency) || 'Monthly';

  if (!fullName) {
    return { error: 'SpendWise says: Full name cannot be empty.' };
  }

  const { error } = await supabase.from('profiles').upsert({
    id: user.id,
    full_name: fullName,
    email: user.email,
    report_frequency: reportFrequency,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    return { error: `SpendWise says: ${error.message}` };
  }

  revalidatePath('/dashboard');
  return { success: true, message: 'SpendWise says: Profile and report settings updated successfully!' };
}

export async function updatePassword(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: 'SpendWise says: Unauthorized user session.' };
  }

  const newPassword = formData.get('newPassword') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!newPassword || newPassword.length < 6) {
    return { error: 'SpendWise says: Password must be at least 6 characters long.' };
  }

  if (newPassword !== confirmPassword) {
    return { error: 'SpendWise says: Password confirmation does not match.' };
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return { error: `SpendWise says: ${error.message}` };
  }

  revalidatePath('/dashboard');
  return { success: true, message: 'SpendWise says: Password updated successfully!' };
}
