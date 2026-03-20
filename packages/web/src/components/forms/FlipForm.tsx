'use client';

import { useState, FormEvent } from 'react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import ScoreCard from '../ui/ScoreCard';
import AppraisalCard from '../ui/AppraisalCard';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
].map((s) => ({ value: s, label: s }));

export default function FlipForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    const fd = new FormData(e.currentTarget);

    try {
      const res = await fetch(`${API_URL}/api/deals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: fd.get('firstName'),
          lastName: fd.get('lastName'),
          email: fd.get('email'),
          phone: fd.get('phone'),
          productLane: 'flip',
          propertyState: fd.get('state'),
          propertyCity: fd.get('city'),
          channel: 'web',
          financials: {
            purchasePrice: Number(fd.get('purchasePrice')),
            rehabBudget: Number(fd.get('rehabBudget')),
            arv: Number(fd.get('arv')),
            fico: Number(fd.get('fico')),
            timelineMonths: Number(fd.get('timelineMonths')) || 6,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection error');
    } finally {
      setLoading(false);
    }
  };

  const triage = result?.triageResult as Record<string, unknown> | undefined;
  const metrics = triage?.metrics as Record<string, number> | undefined;
  const scenarios = triage?.scenarios as Array<{ label: string; profit: number; roi: number }> | undefined;
  const score = result?.dealScore as 'green' | 'yellow' | 'red' | undefined;
  const narrative = triage?.narrative as { headline: string; analysis: string; strengths: string[]; risks: string[]; nextSteps: string[]; aiGenerated: boolean } | null | undefined;
  const lenders = ((triage?.programs || triage?.matchingLenders || []) as Record<string, unknown>[]).map((l) => ({
    name: l.name as string,
    rateRange: l.rateRange as string | undefined,
    maxLtv: l.maxLtv as number | undefined,
    minDscr: l.minDscr as number | undefined,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100 space-y-4">
          <h3 className="text-gray-900 font-semibold text-sm uppercase tracking-wider">Your Info</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" name="firstName" required placeholder="Ravi" />
            <Input label="Last Name" name="lastName" required placeholder="Patel" />
          </div>
          <Input label="Email" name="email" type="email" required placeholder="ravi@example.com" />
          <Input label="Phone" name="phone" type="tel" placeholder="(818) 555-1234" />
        </div>

        <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100 space-y-4">
          <h3 className="text-gray-900 font-semibold text-sm uppercase tracking-wider">Property</h3>
          <div className="grid grid-cols-2 gap-4">
            <Select label="State" name="state" options={STATES} required />
            <Input label="City" name="city" placeholder="Atlanta" />
          </div>
        </div>

        <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100 space-y-4">
          <h3 className="text-gray-900 font-semibold text-sm uppercase tracking-wider">Flip Numbers</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Purchase Price" name="purchasePrice" type="number" required prefix="$" placeholder="200000" />
            <Input label="Rehab Budget" name="rehabBudget" type="number" required prefix="$" placeholder="50000" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="After Repair Value (ARV)" name="arv" type="number" required prefix="$" placeholder="320000" />
            <Input label="FICO Score" name="fico" type="number" required placeholder="700" min="500" max="850" />
          </div>
          <Input label="Timeline (months)" name="timelineMonths" type="number" defaultValue="6" min="1" max="24" hint="How long until you sell?" />
        </div>

        <Button type="submit" size="lg" loading={loading} className="w-full">
          {loading ? 'Running Flip Lab...' : 'Run Flip Analysis'}
        </Button>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">{error}</div>
        )}
      </form>

      <div>
        {result && score && metrics && (
          <ScoreCard
            score={score}
            lane="flip"
            metrics={[
              { label: 'All-In Cost', value: metrics.totalCost },
              { label: 'LTC', value: `${metrics.ltc}%`, highlight: true },
              { label: 'Rehab Budget', value: metrics.rehabBudget },
              { label: 'ARV', value: metrics.arv },
              { label: 'Est. FICO', value: metrics.fico },
              { label: 'Timeline', value: `${metrics.timelineMonths || 6} mo` },
            ]}
            lenders={lenders}
            scenarios={scenarios}
            narrative={narrative}
          />
        )}

        {result && typeof result.dealId === 'string' && (
          <div className="mt-6">
            <AppraisalCard dealId={result.dealId} lane="flip" />
          </div>
        )}

        {!result && !error && (
          <div className="bg-gray-50/50 rounded-2xl p-12 border border-gray-100 text-center h-full flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#007ACC]/10 to-indigo-500/10 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085" />
              </svg>
            </div>
            <h3 className="text-gray-900 font-semibold text-lg mb-2">Flip Lab</h3>
            <p className="text-gray-500 text-sm max-w-sm">
              Enter purchase price, rehab, and ARV. We&apos;ll run 3 profit scenarios and identify the right program for your flip.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
