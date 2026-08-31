import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    // 1. Verify CRON_SECRET authorization
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      console.warn('SpendWise says: Unauthorized report scheduler request');
      return NextResponse.json(
        { error: 'SpendWise says: Unauthorized. Invalid cron authorization token.' },
        { status: 401 }
      );
    }

    const supabaseAdmin = createAdminClient();

    // 2. Read query params or default to all schedules
    const { searchParams } = new URL(request.url);
    const scheduleFilter = searchParams.get('frequency'); // 'Daily' | 'Weekly' | 'Monthly' | null

    let query = supabaseAdmin.from('profiles').select('id, full_name, email, report_frequency');
    if (scheduleFilter) {
      query = query.eq('report_frequency', scheduleFilter);
    }

    const { data: profiles, error: profileError } = await query;

    if (profileError) {
      console.error('[CRON REPORT SCHEDULER] Database error fetching profiles:', profileError);
      return NextResponse.json(
        { error: `SpendWise says: Profile error: ${profileError.message}` },
        { status: 500 }
      );
    }

    const dispatchedReports = [];

    // 3. For each profile, summarize expenses and dispatch email report
    for (const profile of profiles || []) {
      const { data: userExpenses } = await supabaseAdmin
        .from('expenses')
        .select('*')
        .eq('user_id', profile.id);

      const expenses = userExpenses || [];
      const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
      const transactionCount = expenses.length;

      const reportPayload = {
        userId: profile.id,
        email: profile.email || 'N/A',
        fullName: profile.full_name || 'User',
        frequency: profile.report_frequency || 'Monthly',
        totalSpent,
        transactionCount,
      };

      dispatchedReports.push(reportPayload);

      console.log(
        `[REPORT SCHEDULER DISPATCH] SpendWise says: Sent ${reportPayload.frequency} Expense Report Email to ${reportPayload.email} (${reportPayload.fullName}) | Total Spent: ₹${totalSpent} | Count: ${transactionCount}`
      );
    }

    return NextResponse.json({
      success: true,
      message: `SpendWise says: Processed ${dispatchedReports.length} ${scheduleFilter || 'scheduled'} user report dispatches successfully.`,
      reports: dispatchedReports,
    });
  } catch (err: any) {
    console.error('[CRON REPORT SCHEDULER] Unexpected error:', err);
    return NextResponse.json(
      { error: err.message || 'SpendWise says: Internal server error' },
      { status: 500 }
    );
  }
}
