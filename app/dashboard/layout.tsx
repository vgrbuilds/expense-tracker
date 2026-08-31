import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Navbar from '@/components/dashboard/Navbar';
import { getCustomOptions } from '@/app/actions/custom-option-actions';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch profile details
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, report_frequency')
    .eq('id', user.id)
    .single();

  const userName = profile?.full_name || user.email?.split('@')[0] || 'User';
  const reportFrequency = profile?.report_frequency || 'Monthly';

  // Fetch custom categories and vendors
  const { categories, vendors } = await getCustomOptions();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar
        userName={userName}
        userEmail={user.email}
        reportFrequency={reportFrequency}
        userCustomCategories={categories}
        userCustomVendors={vendors}
      />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
