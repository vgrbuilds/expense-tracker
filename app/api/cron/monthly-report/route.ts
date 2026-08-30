import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    // 1. Verify CRON_SECRET via Authorization Header
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      console.warn('SpendWise says: Unauthorized cron request attempt');
      return NextResponse.json(
        { error: 'SpendWise says: Unauthorized. Invalid cron authorization token.' },
        { status: 401 }
      );
    }

    // 2. Initialize Supabase Admin Client (Bypasses RLS)
    const supabaseAdmin = createAdminClient();

    // 3. Compute Previous Month Date Range
    const now = new Date();
    const firstDayPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const startDateStr = firstDayPrevMonth.toISOString().split('T')[0];
    const endDateStr = lastDayPrevMonth.toISOString().split('T')[0];

    console.log(`[CRON] SpendWise says: Aggregating monthly expense reports from ${startDateStr} to ${endDateStr}...`);

    // 4. Fetch All Expenses (Including Recurring Expenses created on or before last day of previous month)
    const { data: expenses, error: expenseError } = await supabaseAdmin
      .from('expenses')
      .select('user_id, amount, category, payment_method, date, is_recurring')
      .lte('date', endDateStr);

    if (expenseError) {
      console.error('[CRON] SpendWise says: Database error fetching expenses:', expenseError);
      return NextResponse.json(
        { error: `SpendWise says: Database error: ${expenseError.message}` },
        { status: 500 }
      );
    }

    // Filter expenses that apply to the previous month
    const prevMonthExpenses = (expenses || []).filter((e) => {
      const expDate = new Date(e.date);
      const isExactMonth = expDate >= firstDayPrevMonth && expDate <= lastDayPrevMonth;
      const isRecurringActive = e.is_recurring && expDate <= lastDayPrevMonth;
      return isExactMonth || isRecurringActive;
    });

    // 5. Fetch User Profiles / Email Information
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email');

    if (profileError) {
      console.error('[CRON] SpendWise says: Database error fetching profiles:', profileError);
      return NextResponse.json(
        { error: `SpendWise says: Profile error: ${profileError.message}` },
        { status: 500 }
      );
    }

    // 6. Aggregate Expense Data Grouped By User
    const userAggregates = new Map<
      string,
      {
        totalSpent: number;
        count: number;
        categories: Record<string, number>;
      }
    >();

    prevMonthExpenses.forEach((item) => {
      const existing = userAggregates.get(item.user_id) || {
        totalSpent: 0,
        count: 0,
        categories: {},
      };
      existing.totalSpent += Number(item.amount);
      existing.count += 1;
      existing.categories[item.category] =
        (existing.categories[item.category] || 0) + Number(item.amount);
      userAggregates.set(item.user_id, existing);
    });

    const reportSummaries = [];

    // 7. Iterate through users and simulate sending email notifications (Resend / Nodemailer Syntax)
    for (const profile of profiles) {
      const agg = userAggregates.get(profile.id) || {
        totalSpent: 0,
        count: 0,
        categories: {},
      };

      // Determine top spending category
      let topCategory = 'None';
      let maxCatSpent = 0;
      Object.entries(agg.categories).forEach(([cat, amount]) => {
        if (amount > maxCatSpent) {
          maxCatSpent = amount;
          topCategory = cat;
        }
      });

      const summary = {
        userId: profile.id,
        email: profile.email || 'N/A',
        fullName: profile.full_name || 'User',
        period: `${firstDayPrevMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}`,
        totalSpent: agg.totalSpent.toFixed(2),
        transactionCount: agg.count,
        topCategory,
      };

      reportSummaries.push(summary);

      console.log(
        `[CRON EMAIL DISPATCH SIMULATION] SpendWise says: Sent report email to ${summary.email} (${summary.fullName}) -> Total Spent: ₹${summary.totalSpent}, Transactions: ${summary.transactionCount}, Top Category: ${summary.topCategory}`
      );
    }

    return NextResponse.json({
      success: true,
      message: `SpendWise says: Monthly reports generated and dispatched for ${profiles.length} users.`,
      period: {
        start: startDateStr,
        end: endDateStr,
      },
      processedUsersCount: profiles.length,
      summaries: reportSummaries,
    });
  } catch (err: any) {
    console.error('[CRON] SpendWise says: Unexpected error handling monthly report:', err);
    return NextResponse.json(
      { error: err.message || 'SpendWise says: Internal server error' },
      { status: 500 }
    );
  }
}
