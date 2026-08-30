'use server';

import { createClient } from '@/lib/supabase/server';
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

  const fullName = formData.get('fullName') as string;

  if (!fullName || fullName.trim() === '') {
    return { error: 'SpendWise says: Full name cannot be empty.' };
  }

  const { error } = await supabase.from('profiles').upsert({
    id: user.id,
    full_name: fullName.trim(),
    email: user.email,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    return { error: `SpendWise says: ${error.message}` };
  }

  revalidatePath('/dashboard');
  return { success: true, message: 'SpendWise says: Profile updated successfully!' };
}
