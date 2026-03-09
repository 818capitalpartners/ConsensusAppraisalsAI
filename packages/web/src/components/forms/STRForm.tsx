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

const PROPERTY_TYPES = [
  { value: 'single_family', label: 'Single Family' },
  { value: 'condo', label: 'Condo / Townhome' },
  { value: 'cabin', label: 'Cabin / Vacation' },
  { value: 'duplex', label: 'Duplex (2 units)' },
];

export default function STRForm() {
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
          productLane: 'str',
          propertyState: fd.get('state'),
          propertyCity: fd.get('city'),
          propertyType: fd.get('propertyType'),
          units: 1,
          channel: 'web',
          financials: {
            purchasePrice: Number(fd.get('purchasePrice')),
            downPayment: Number(fd.get('downPayment')),
            monthlyRevenue: Number(fd.get('monthlyRevenue')),
            occupancyRate: Number(fd.get('occupancyRate')),
            managementFeePercent: Number(fd.get('managementFeePercent')),
            fico: Number(fd.get('fico')),
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
        <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-800 space-y-4">
          <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Your Info</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" name="firstName" required placeholder="Ravi" />
            <Input label="Last Name" name="lastName" required placeholder="Patel" />
          </div>
          <Input label="Email" name="email" type="email" required placeholder="ravi@example.com" />
          <Input label="Phone" name="phone" type="tel" placeholder="(818) 555-1234" />
        </div>

        <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-800 space-y-4">
          <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Property</h3>
          <div className="grid grid-cols-2 gap-4">
            <Select label="State" name="state" options={STATES} required />
            <Input label="City" name="city" placeholder="Nashville" />
          </div>
          <Select label="Property Type" name="propertyType" options={PROPERTY_TYPES} required />
        </div>

        <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-800 space-y-4">
          <h3 className="text-white font-semibold text-sm uppercase tracking-wider">STR Numbers</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Purchase Price" name="purchasePrice" type="number" required prefix="$" placeholder="500000" />
            <Input label="Down Payment" name="downPayment" type="number" required prefix="$" placeholder="125000" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Monthly Revenue (Gross)" name="monthlyRevenue" type="number" required prefix="$" placeholder="6000" hint="From Airbnb/VRBO trailing 12" />
            <Input label="FICO Score" name="fico" type="number" required placeholder="720" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Occupancy Rate" name="occupancyRate" type="number" defaultValue="70" suffix="%" hint="Annual average" />
            <Input label="Management Fee" name="managementFeePercent" type="number" defaultValue="25" suffix="%" hint="PM company fee" />
          </div>
        </div>

        <Button type="submit" size="lg" loading={loading} className="w-full">
          {loading ? 'Running STR Signal...' : 'Run STR Analysis →'}
        </Button>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">{error}</div>
        )}
      </form>

      <div>
        {result && score && metrics && (
          <ScoreCard
            score={score}
            lane="str"
            metrics={[
              { label: 'STR-DSCR', value: metrics.strDscr || metrics.dscr, highlight: true },
              { label: 'Effective Monthly', value: metrics.effectiveMonthlyIncome },
              { label: 'Net Monthly', value: metrics.netMonthlyIncome },
              { label: 'Cap Rate', value: `${metrics.capRate}%` },
              { label: 'Est. PITI', value: metrics.estimatedPITI },
              { label: 'Occupancy', value: `${metrics.occupancyRate}%` },
            ]}
            lenders={lenders}
            narrative={narrative}
          />
        )}

        {!result && !error && (
          <div className="bg-slate-900/30 rounded-2xl p-12 border border-slate-800/30 text-center h-full flex flex-col items-center justify-center">
            <div className="text-6xl mb-4">🏖️</div>
            <h3 className="text-white font-semibold text-lg mb-2">STR Signal</h3>
            <p className="text-slate-400 text-sm max-w-sm">
              We normalize Airbnb/VRBO revenue into lender-ready DSCR. Enter your T12 numbers and we&apos;ll score the deal.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
