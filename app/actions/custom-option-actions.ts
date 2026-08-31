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
    return { categories: [], vendors: [], hiddenCategories: [], hiddenVendors: [] };
  }

  const { data, error } = await supabase
    .from('custom_options')
    .select('*')
    .eq('user_id', user.id)
    .order('option_value', { ascending: true });

  if (error || !data) {
    return { categories: [], vendors: [], hiddenCategories: [], hiddenVendors: [] };
  }

  const categories = data
    .filter((item: CustomOption) => item.field_name === 'category')
    .map((item: CustomOption) => item.option_value);

  const vendors = data
    .filter((item: CustomOption) => item.field_name === 'vendor')
    .map((item: CustomOption) => item.option_value);

  const hiddenCategories = data
    .filter((item: CustomOption) => item.field_name === 'hidden_category')
    .map((item: CustomOption) => item.option_value);

  const hiddenVendors = data
    .filter((item: CustomOption) => item.field_name === 'hidden_vendor')
    .map((item: CustomOption) => item.option_value);

  return { categories, vendors, hiddenCategories, hiddenVendors };
}

export async function saveCustomOption(fieldName: 'category' | 'vendor', optionValue: string) {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return { error: 'SpendWise says: Unauthorized.' };

  const trimmed = optionValue.trim();
  if (!trimmed) return { error: 'SpendWise says: Option name cannot be empty.' };

  const { error } = await supabase.from('custom_options').upsert(
    {
      user_id: user.id,
      field_name: fieldName,
      option_value: trimmed,
    },
    { onConflict: 'user_id,field_name,option_value' }
  );

  if (error) return { error: `SpendWise says: ${error.message}` };

  revalidatePath('/dashboard');
  return { success: true };
}

export async function hideDefaultOption(fieldName: 'category' | 'vendor', optionValue: string) {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return { error: 'SpendWise says: Unauthorized.' };

  const { error } = await supabase.from('custom_options').upsert(
    {
      user_id: user.id,
      field_name: `hidden_${fieldName}`,
      option_value: optionValue,
    },
    { onConflict: 'user_id,field_name,option_value' }
  );

  if (error) return { error: `SpendWise says: ${error.message}` };

  revalidatePath('/dashboard');
  return { success: true };
}

export async function deleteCustomOption(fieldName: 'category' | 'vendor' | 'hidden_category' | 'hidden_vendor', optionValue: string) {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return { error: 'SpendWise says: Unauthorized.' };

  const { error } = await supabase
    .from('custom_options')
    .delete()
    .eq('user_id', user.id)
    .eq('field_name', fieldName)
    .eq('option_value', optionValue);

  if (error) return { error: `SpendWise says: ${error.message}` };

  revalidatePath('/dashboard');
  return { success: true };
}
