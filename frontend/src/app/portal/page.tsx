/**
 * Borrower portal entry point (server component).
 *
 * Routes based on session + profile role:
 *   - no session              → redirect to /portal/sign-in
 *   - role = 'admin'          → redirect to /portal/admin
 *   - role = 'borrower'       → fetch their deal, render dashboard
 *   - role = 'lead' or 'broker' or no matching deal
 *                             → render "no deal on file" screen
 *
 * RLS is gating the data: a borrower can only read their own deal, docs,
 * and messages thanks to public.is_borrower_of() in the SQL migration.
 */

import { redirect } from 'next/navigation';
import { createSupabaseServer } from '../../lib/supabase/server';
import BorrowerDashboard from './_components/BorrowerDashboard';
import NoDealOnFile from './_components/NoDealOnFile';

export const dynamic = 'force-dynamic'; // session-dependent — never cache

export default async function PortalPage() {
  const supabase = await createSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/portal/sign-in');

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, full_name, role')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.role === 'admin') redirect('/portal/admin');

  if (profile?.role !== 'borrower') {
    return <NoDealOnFile email={profile?.email || user.email || ''} reason="not_borrower" />;
  }

  // Fetch the borrower's deal (RLS scopes this to borrower_auth_user_id = auth.uid()).
  const { data: deal } = await supabase
    .from('deals')
    .select('*')
    .eq('borrower_auth_user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!deal) {
    return <NoDealOnFile email={profile.email} reason="no_deal" />;
  }

  const [{ data: required_documents }, { data: messages }] = await Promise.all([
    supabase.from('deal_required_documents').select('*').eq('deal_id', deal.id).order('sort_order'),
    supabase.from('deal_messages').select('*').eq('deal_id', deal.id).order('created_at', { ascending: true }),
  ]);

  return (
    <BorrowerDashboard
      deal={deal}
      requiredDocuments={required_documents || []}
      messages={messages || []}
      signedInAs={profile.email}
    />
  );
}
