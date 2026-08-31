'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { PaymentMethod } from '@/types';

const DEFAULT_CATEGORIES = [
  'Grocery',
  'Utilities',
  'Rent',
  'Dining Out',
  'Transportation',
  'Entertainment',
  'Healthcare',
  'Shopping',
];

const DEFAULT_VENDORS = [
  'Amazon',
  'Flipkart',
  'Swiggy',
  'Zomato',
  'Uber',
  'Ola',
  'D-Mart',
  'Supermarket',
  'Electricity Board',
];

async function ensureCustomOption(userId: string, fieldName: string, optionValue: string | null) {
  if (!optionValue || !optionValue.trim()) return;
  const val = optionValue.trim();

  const isDefault =
    fieldName === 'category'
      ? DEFAULT_CATEGORIES.includes(val) || val === 'Others'
      : DEFAULT_VENDORS.includes(val) || val === 'Others';

  if (!isDefault) {
    const supabase = createClient();
    await supabase.from('custom_options').upsert(
      {
        user_id: userId,
        field_name: fieldName,
        option_value: val,
      },
      { onConflict: 'user_id,field_name,option_value' }
    );
  }
}

export async function addExpense(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: 'SpendWise says: Unauthorized user session.' };
  }

  // Compulsory Fields
  const category = (formData.get('category') as string)?.trim();
  const amountStr = formData.get('amount') as string;
  const date = formData.get('date') as string;

  if (!category || !amountStr || !date) {
    return { error: 'SpendWise says: Category, Amount, and Date are compulsory fields.' };
  }

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    return { error: 'SpendWise says: Amount must be a positive number in Rupees.' };
  }

  // Optional Fields
  const description = (formData.get('description') as string)?.trim() || null;
  const vendor = (formData.get('vendor') as string)?.trim() || null;
  const spentFor = (formData.get('spent_for') as string)?.trim() || 'Self';
  const paymentMethod = (formData.get('payment_method') as PaymentMethod) || 'Online';
  const isRecurring = formData.get('is_recurring') === 'true';

  // Save custom options if non-default category or vendor was used
  await ensureCustomOption(user.id, 'category', category);
  await ensureCustomOption(user.id, 'vendor', vendor);

  const { error } = await supabase.from('expenses').insert({
    user_id: user.id,
    category,
    amount,
    date,
    description,
    title: description,
    vendor,
    payment_method: paymentMethod,
    spent_for: spentFor,
    is_recurring: isRecurring,
  });

  if (error) {
    return { error: `SpendWise says: ${error.message}` };
  }

  // Check Milestone Trigger (10, 100, etc.)
  let milestoneMessage = null;
  const { count } = await supabase
    .from('expenses')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id);

  if (count && (count === 10 || count === 100 || count % 50 === 0)) {
    milestoneMessage = `🎉 Milestone Reached! You have logged ${count} transactions! Milestone report email sent to ${user.email}.`;
    console.log(
      `[MILESTONE EMAIL DISPATCH] SpendWise says: User ${user.email} reached ${count} transactions milestone!`
    );
  }

  revalidatePath('/dashboard');
  return {
    success: true,
    message: milestoneMessage
      ? `SpendWise says: Expense saved. ${milestoneMessage}`
      : 'SpendWise says: Expense saved successfully!',
  };
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

  // Compulsory Fields
  const category = (formData.get('category') as string)?.trim();
  const amountStr = formData.get('amount') as string;
  const date = formData.get('date') as string;

  if (!category || !amountStr || !date) {
    return { error: 'SpendWise says: Category, Amount, and Date are compulsory fields.' };
  }

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    return { error: 'SpendWise says: Amount must be a positive number in Rupees.' };
  }

  // Optional Fields
  const description = (formData.get('description') as string)?.trim() || null;
  const vendor = (formData.get('vendor') as string)?.trim() || null;
  const spentFor = (formData.get('spent_for') as string)?.trim() || 'Self';
  const paymentMethod = (formData.get('payment_method') as PaymentMethod) || 'Online';
  const isRecurring = formData.get('is_recurring') === 'true';

  // Save custom options if non-default category or vendor was used
  await ensureCustomOption(user.id, 'category', category);
  await ensureCustomOption(user.id, 'vendor', vendor);

  const { error } = await supabase
    .from('expenses')
    .update({
      category,
      amount,
      date,
      description,
      title: description,
      vendor,
      payment_method: paymentMethod,
      spent_for: spentFor,
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
