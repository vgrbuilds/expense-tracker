'use server';

import { createClient } from '@/lib/supabase/server';
import { CustomOption } from '@/types';
import { revalidatePath } from 'next/cache';

export async function getCustomOptions() {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { categories: [], vendors: [] };
  }

  const { data, error } = await supabase
    .from('custom_options')
    .select('*')
    .eq('user_id', user.id)
    .order('option_value', { ascending: true });

  if (error || !data) {
    return { categories: [], vendors: [] };
  }

  const categories = data
    .filter((item: CustomOption) => item.field_name === 'category')
    .map((item: CustomOption) => item.option_value);

  const vendors = data
    .filter((item: CustomOption) => item.field_name === 'vendor')
    .map((item: CustomOption) => item.option_value);

  return { categories, vendors };
}

export async function saveCustomOption(fieldName: 'category' | 'vendor', optionValue: string) {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return;

  const trimmed = optionValue.trim();
  if (!trimmed) return;

  await supabase.from('custom_options').upsert(
    {
      user_id: user.id,
      field_name: fieldName,
      option_value: trimmed,
    },
    { onConflict: 'user_id,field_name,option_value' }
  );

  revalidatePath('/dashboard');
}
