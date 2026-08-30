'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { PaymentMethod } from '@/types';

export async function addExpense(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: 'SpendWise says: Unauthorized user session.' };
  }

  const title = formData.get('title') as string;
  const amountStr = formData.get('amount') as string;
  const date = formData.get('date') as string;
  const category = formData.get('category') as string;
  const paymentMethod = (formData.get('payment_method') as PaymentMethod) || 'Online';
  const spentFor = (formData.get('spent_for') as string) || 'Self';
  const isRecurring = formData.get('is_recurring') === 'true';

  if (!title || !amountStr || !date || !category) {
    return { error: 'SpendWise says: Title, amount, date, and category are required.' };
  }

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    return { error: 'SpendWise says: Amount must be a positive number in Rupees.' };
  }

  const { error } = await supabase.from('expenses').insert({
    user_id: user.id,
    title: title.trim(),
    amount,
    date,
    category: category.trim(),
    payment_method: paymentMethod,
    spent_for: spentFor.trim() || 'Self',
    is_recurring: isRecurring,
  });

  if (error) {
    return { error: `SpendWise says: ${error.message}` };
  }

  revalidatePath('/dashboard');
  return { success: true, message: 'SpendWise says: Expense saved successfully!' };
}

export async function updateExpense(expenseId: string, formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: 'SpendWise says: Unauthorized user session.' };
  }

  const title = formData.get('title') as string;
  const amountStr = formData.get('amount') as string;
  const date = formData.get('date') as string;
  const category = formData.get('category') as string;
  const paymentMethod = (formData.get('payment_method') as PaymentMethod) || 'Online';
  const spentFor = (formData.get('spent_for') as string) || 'Self';
  const isRecurring = formData.get('is_recurring') === 'true';

  if (!title || !amountStr || !date || !category) {
    return { error: 'SpendWise says: Title, amount, date, and category are required.' };
  }

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    return { error: 'SpendWise says: Amount must be a positive number in Rupees.' };
  }

  const { error } = await supabase
    .from('expenses')
    .update({
      title: title.trim(),
      amount,
      date,
      category: category.trim(),
      payment_method: paymentMethod,
      spent_for: spentFor.trim() || 'Self',
      is_recurring: isRecurring,
    })
    .eq('id', expenseId)
    .eq('user_id', user.id);

  if (error) {
    return { error: `SpendWise says: ${error.message}` };
  }

  revalidatePath('/dashboard');
  return { success: true, message: 'SpendWise says: Expense updated successfully!' };
}

export async function deleteExpense(expenseId: string) {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: 'SpendWise says: Unauthorized user session.' };
  }

  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', expenseId)
    .eq('user_id', user.id);

  if (error) {
    return { error: `SpendWise says: ${error.message}` };
  }

  revalidatePath('/dashboard');
  return { success: true, message: 'SpendWise says: Expense deleted.' };
}
