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
            <Input label="City" name="city" placeholder="Nashville" />
          </div>
          <Select label="Property Type" name="propertyType" options={PROPERTY_TYPES} required />
        </div>

        <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100 space-y-4">
          <h3 className="text-gray-900 font-semibold text-sm uppercase tracking-wider">STR Numbers</h3>
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
          {loading ? 'Running STR Signal...' : 'Run STR Analysis'}
        </Button>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">{error}</div>
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

        {result && typeof result.dealId === 'string' && (
          <div className="mt-6">
            <AppraisalCard dealId={result.dealId} lane="str" />
          </div>
        )}

        {!result && !error && (
          <div className="bg-gray-50/50 rounded-2xl p-12 border border-gray-100 text-center h-full flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#007ACC]/10 to-indigo-500/10 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" />
              </svg>
            </div>
            <h3 className="text-gray-900 font-semibold text-lg mb-2">STR Signal</h3>
            <p className="text-gray-500 text-sm max-w-sm">
              We normalize Airbnb/VRBO revenue into underwriting-ready DSCR. Enter your T12 numbers and we&apos;ll score the deal.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
