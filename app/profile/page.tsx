import { createClient } from '@/lib/supabase/server';
import { getCustomOptions } from '@/app/actions/custom-option-actions';
import ProfileClient from './ProfileClient';

export default async function ProfilePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch profile details
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, report_frequency')
    .eq('id', user.id)
    .single();

  const userName = profile?.full_name || user.email?.split('@')[0] || 'User';
  const reportFrequency = profile?.report_frequency || 'Monthly';

  // Fetch custom categories, vendors, spent_for options
  const { categories, vendors, spentForOptions } = await getCustomOptions();

  return (
    <ProfileClient
      userName={userName}
      userEmail={user.email}
      reportFrequency={reportFrequency}
      userCustomCategories={categories}
      userCustomVendors={vendors}
      userCustomSpentForOptions={spentForOptions}
    />
  );
}
