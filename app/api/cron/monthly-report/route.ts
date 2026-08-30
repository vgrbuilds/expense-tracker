import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    // 1. Verify CRON_SECRET via Authorization Header
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      console.warn('Unauthorized cron request attempt');
      return NextResponse.json(
        { error: 'Unauthorized. Invalid cron authorization token.' },
        { status: 401 }
      );
    }

    // 2. Initialize Supabase Admin Client (Bypasses RLS)
    const supabaseAdmin = createAdminClient();

    // 3. Compute Previous Month Date Range
    const now = new Date();
    // First day of previous month
    const firstDayPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    // Last day of previous month
    const lastDayPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const startDateStr = firstDayPrevMonth.toISOString().split('T')[0];
    const endDateStr = lastDayPrevMonth.toISOString().split('T')[0];

    console.log(`[CRON] Aggregating monthly expense reports from ${startDateStr} to ${endDateStr}...`);

    // 4. Fetch All Expenses for Previous Month
    const { data: expenses, error: expenseError } = await supabaseAdmin
      .from('expenses')
      .select('user_id, amount, category, payment_method')
      .gte('date', startDateStr)
      .lte('date', endDateStr);

    if (expenseError) {
      console.error('[CRON] Database error fetching expenses:', expenseError);
      return NextResponse.json(
        { error: `Database error: ${expenseError.message}` },
        { status: 500 }
      );
    }

    // 5. Fetch User Profiles / Email Information
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email');

    if (profileError) {
      console.error('[CRON] Database error fetching profiles:', profileError);
      return NextResponse.json(
        { error: `Profile error: ${profileError.message}` },
        { status: 500 }
      );
    }

    const profileMap = new Map(profiles.map((p) => [p.id, p]));

    // 6. Aggregate Expense Data Grouped By User
    const userAggregates = new Map<
      string,
      {
        totalSpent: number;
        count: number;
        categories: Record<string, number>;
      }
    >();

    (expenses || []).forEach((item) => {
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

      // Simulated Resend / Nodemailer Email Dispatch Logic
      /*
      // Example Resend implementation:
      await resend.emails.send({
        from: 'Expense Tracker <reports@yourdomain.com>',
        to: summary.email,
        subject: `Monthly Expense Report - ${summary.period}`,
        html: `
          <h1>Monthly Expense Report</h1>
          <p>Hi ${summary.fullName},</p>
          <p>Here is your spending summary for <strong>${summary.period}</strong>:</p>
          <ul>
            <li><strong>Total Spent:</strong> $${summary.totalSpent}</li>
            <li><strong>Total Transactions:</strong> ${summary.transactionCount}</li>
            <li><strong>Top Category:</strong> ${summary.topCategory}</li>
          </ul>
        `
      });
      */
      console.log(
        `[CRON EMAIL DISPATCH SIMULATION] Sent report email to ${summary.email} (${summary.fullName}) -> Total Spent: $${summary.totalSpent}, Transactions: ${summary.transactionCount}, Top Category: ${summary.topCategory}`
      );
    }

    return NextResponse.json({
      success: true,
      message: `Monthly reports generated and dispatched for ${profiles.length} users.`,
      period: {
        start: startDateStr,
        end: endDateStr,
      },
      processedUsersCount: profiles.length,
      summaries: reportSummaries,
    });
  } catch (err: any) {
    console.error('[CRON] Unexpected error handling monthly report:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
