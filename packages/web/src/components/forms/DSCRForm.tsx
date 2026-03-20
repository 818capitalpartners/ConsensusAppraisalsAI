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

const PROPERTY_TYPES = [
  { value: 'single_family', label: 'Single Family' },
  { value: 'condo', label: 'Condo / Townhome' },
  { value: 'duplex', label: 'Duplex (2 units)' },
  { value: 'triplex', label: 'Triplex (3 units)' },
  { value: 'fourplex', label: 'Fourplex (4 units)' },
];

export default function DSCRForm() {
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
          productLane: 'dscr',
          propertyState: fd.get('state'),
          propertyCity: fd.get('city'),
          propertyType: fd.get('propertyType'),
          units: Number(fd.get('units')) || 1,
          channel: 'web',
          financials: {
            purchasePrice: Number(fd.get('purchasePrice')),
            monthlyRent: Number(fd.get('monthlyRent')),
            downPayment: Number(fd.get('downPayment')),
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
            <Input label="City" name="city" placeholder="Los Angeles" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Property Type" name="propertyType" options={PROPERTY_TYPES} required />
            <Input label="Units" name="units" type="number" defaultValue="1" min="1" max="4" />
          </div>
        </div>

        <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100 space-y-4">
          <h3 className="text-gray-900 font-semibold text-sm uppercase tracking-wider">Deal Numbers</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Purchase Price" name="purchasePrice" type="number" required prefix="$" placeholder="450000" />
            <Input label="Monthly Rent" name="monthlyRent" type="number" required prefix="$" placeholder="3200" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Down Payment" name="downPayment" type="number" required prefix="$" placeholder="112500" hint="Typically 20-25%" />
            <Input label="FICO Score" name="fico" type="number" required placeholder="720" min="500" max="850" />
          </div>
        </div>

        <Button type="submit" size="lg" loading={loading} className="w-full">
          {loading ? 'Analyzing Deal...' : 'Run DSCR Analysis'}
        </Button>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">{error}</div>
        )}
      </form>

      <div>
        {result && score && metrics && (
          <ScoreCard
            score={score}
            lane="dscr"
            metrics={[
              { label: 'DSCR Ratio', value: metrics.dscr, highlight: true },
              { label: 'Loan-to-Value', value: `${metrics.ltv}%` },
              { label: 'Loan Amount', value: metrics.loanAmount },
              { label: 'Monthly Rent', value: metrics.monthlyRent },
              { label: 'Est. PITI', value: metrics.estimatedPITI },
              { label: 'Est. FICO', value: metrics.estimatedFico || metrics.fico },
            ]}
            lenders={lenders}
            narrative={narrative}
          />
        )}

        {result && result.dealId && (
          <div className="mt-6">
            <AppraisalCard dealId={result.dealId as string} lane="dscr" />
          </div>
        )}

        {!result && !error && (
          <div className="bg-gray-50/50 rounded-2xl p-12 border border-gray-100 text-center h-full flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#007ACC]/10 to-indigo-500/10 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <h3 className="text-gray-900 font-semibold text-lg mb-2">DSCR Analysis</h3>
            <p className="text-gray-500 text-sm max-w-sm">
              Enter your deal numbers and we&apos;ll instantly calculate your DSCR ratio, identify qualifying programs, and score the deal.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
