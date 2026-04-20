'use client';

import { useEffect, useState } from 'react';
import FUNDED_DEALS from '@/data/fundedDeals';

const ROTATE_MS = 5000;

export default function LiveDealTicker() {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (!FUNDED_DEALS?.length) return;
    const t = setInterval(() => {
      setI((prev) => (prev + 1) % FUNDED_DEALS.length);
    }, ROTATE_MS);
    return () => clearInterval(t);
  }, []);

  if (!FUNDED_DEALS?.length) return null;
  const d = FUNDED_DEALS[i];

  return (
    <div className="flex items-center gap-2 min-w-0" aria-label="Recently funded deals">
      <span className="relative flex h-2 w-2 flex-shrink-0" aria-hidden="true">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-60" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
      </span>
      <span className="text-[11px] md:text-xs font-sans tracking-wide truncate">
        <span className="text-accent-light font-semibold">Funded</span>
        <span className="text-navy-200 mx-1.5">·</span>
        <span className="tabular-nums">{d.dealValue}</span>
        <span className="text-navy-200 mx-1.5">·</span>
        <span className="hidden sm:inline">{d.loanType}</span>
        <span className="hidden sm:inline text-navy-200 mx-1.5">·</span>
        <span>{d.city}, {d.state}</span>
      </span>
    </div>
  );
}
