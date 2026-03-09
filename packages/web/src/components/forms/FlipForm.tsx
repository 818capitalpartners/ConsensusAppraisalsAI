'use client';

import { useState, FormEvent } from 'react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import ScoreCard from '../ui/ScoreCard';

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
  const lenders = ((result?.matchingLenders || triage?.matchingLenders || []) as Record<string, unknown>[]).map((l) => ({
    name: l.name as string,
    rateRange: l.rateRange as string | undefined,
    maxLtv: l.maxLtv as number | undefined,
    minDscr: l.minDscr as number | undefined,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Contact Info */}
        <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-800 space-y-4">
          <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Your Info</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" name="firstName" required placeholder="Ravi" />
            <Input label="Last Name" name="lastName" required placeholder="Patel" />
          </div>
          <Input label="Email" name="email" type="email" required placeholder="ravi@example.com" />
          <Input label="Phone" name="phone" type="tel" placeholder="(818) 555-1234" />
        </div>

        {/* Property */}
        <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-800 space-y-4">
          <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Property</h3>
          <div className="grid grid-cols-2 gap-4">
            <Select label="State" name="state" options={STATES} required />
            <Input label="City" name="city" placeholder="Atlanta" />
          </div>
        </div>

        {/* Financials */}
        <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-800 space-y-4">
          <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Flip Numbers</h3>
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
          {loading ? 'Running Flip Lab...' : 'Run Flip Analysis →'}
        </Button>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
            {error}
          </div>
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

        {!result && !error && (
          <div className="bg-slate-900/30 rounded-2xl p-12 border border-slate-800/30 text-center h-full flex flex-col items-center justify-center">
            <div className="text-6xl mb-4">🔨</div>
            <h3 className="text-white font-semibold text-lg mb-2">Flip Lab</h3>
            <p className="text-slate-400 text-sm max-w-sm">
              Enter purchase price, rehab, and ARV. We&apos;ll run 3 profit scenarios and find the right lender for your flip.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
