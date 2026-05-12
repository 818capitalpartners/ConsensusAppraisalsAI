/**
 * Admin landing in the Next.js portal.
 *
 * Intentionally minimal for v1 of the port — confirms admin sign-in works and
 * lists deals via RLS. Full admin functionality (edit deals, manage docs,
 * threaded messaging) still lives in the Vite loan-portal running locally;
 * we'll port more here incrementally.
 */

import { redirect } from 'next/navigation';
import { createSupabaseServer } from '../../../lib/supabase/server';
import AdminLanding from './_components/AdminLanding';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const supabase = await createSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/portal/sign-in');

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, full_name, role')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.role !== 'admin') redirect('/portal');

  // is_admin() RLS lets admins see all deals.
  const { data: deals } = await supabase
    .from('deals')
    .select('id, borrower_name, borrower_email, product, loan_status, loan_amount, property_address, created_at')
    .order('created_at', { ascending: false })
    .limit(50);

  return <AdminLanding profile={profile} deals={deals || []} />;
}
