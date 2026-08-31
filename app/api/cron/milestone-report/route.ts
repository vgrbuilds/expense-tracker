import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    // 1. Verify CRON_SECRET via Authorization Header
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      console.warn('SpendWise says: Unauthorized milestone cron request attempt');
      return NextResponse.json(
        { error: 'SpendWise says: Unauthorized. Invalid cron authorization token.' },
        { status: 401 }
      );
    }

    // 2. Initialize Supabase Admin Client
    const supabaseAdmin = createAdminClient();

    // 3. Fetch All Profiles
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email, report_frequency, last_milestone_notified');

    if (profileError) {
      console.error('[CRON MILESTONE] Database error fetching profiles:', profileError);
      return NextResponse.json(
        { error: `SpendWise says: Profile error: ${profileError.message}` },
        { status: 500 }
      );
    }

    const milestoneNotifications = [];

    // 4. Iterate Profiles & Check Transaction Counts for 10, 100 Milestones
    for (const profile of profiles || []) {
      const { count } = await supabaseAdmin
        .from('expenses')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', profile.id);

      const totalTxCount = count || 0;
      const lastNotified = profile.last_milestone_notified || 0;

      // Detect milestone triggers (10, 100, 200, 500, etc.)
      const milestones = [10, 100, 200, 500, 1000];
      const reachedMilestone = milestones.reverse().find((m) => totalTxCount >= m && lastNotified < m);

      if (reachedMilestone) {
        // Update profile last_milestone_notified
        await supabaseAdmin
          .from('profiles')
          .update({ last_milestone_notified: reachedMilestone })
          .eq('id', profile.id);

        const emailInfo = {
          userId: profile.id,
          email: profile.email || 'N/A',
          fullName: profile.full_name || 'User',
          milestone: reachedMilestone,
          totalTransactions: totalTxCount,
          reportFrequency: profile.report_frequency || 'Monthly',
        };

        milestoneNotifications.push(emailInfo);

        console.log(
          `[MILESTONE CRON DISPATCH] SpendWise says: Sent ${reachedMilestone} Transactions Milestone Email to ${emailInfo.email} (${emailInfo.fullName})!`
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `SpendWise says: Transaction milestone check completed. Sent ${milestoneNotifications.length} milestone notifications.`,
      notifications: milestoneNotifications,
    });
  } catch (err: any) {
    console.error('[CRON MILESTONE] Unexpected error:', err);
    return NextResponse.json(
      { error: err.message || 'SpendWise says: Internal server error' },
      { status: 500 }
    );
  }
}
