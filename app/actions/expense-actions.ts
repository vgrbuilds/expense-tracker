'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { ExpenseCategory, PaymentMethod } from '@/types';

export async function addExpense(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: 'Unauthorized user session.' };
  }

  const title = formData.get('title') as string;
  const amountStr = formData.get('amount') as string;
  const date = formData.get('date') as string;
  const category = formData.get('category') as ExpenseCategory;
  const paymentMethod = formData.get('payment_method') as PaymentMethod;

  if (!title || !amountStr || !date || !category || !paymentMethod) {
    return { error: 'All fields are required.' };
  }

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    return { error: 'Amount must be a positive number.' };
  }

  const { error } = await supabase.from('expenses').insert({
    user_id: user.id,
    title,
    amount,
    date,
    category,
    payment_method: paymentMethod,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard');
  return { success: true };
}

export async function deleteExpense(expenseId: string) {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: 'Unauthorized user session.' };
  }

  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', expenseId)
    .eq('user_id', user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard');
  return { success: true };
}
