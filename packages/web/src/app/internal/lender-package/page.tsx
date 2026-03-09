'use client';

import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface ViewerResponse {
  success: boolean;
  view: 'internal' | 'borrower';
  lenderLoanId: string;
  dealId: string;
  package: Record<string, unknown>;
  borrowerSummary?: Record<string, unknown>;
  pdfDocument: {
    title: string;
    sections: Array<{
      key: string;
      title: string;
      textBlocks: Array<{
        type: 'paragraph' | 'bullets';
        heading?: string;
        content: string | string[];
      }>;
      tables: Array<{
        heading: string;
        columns: string[];
        rows: Array<Array<string | number | null>>;
      }>;
    }>;
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function prettyJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

export default function LenderPackageViewerPage() {
  const [dealId, setDealId] = useState('');
  const [lenderLoanId, setLenderLoanId] = useState('');
  const [view, setView] = useState<'internal' | 'borrower'>('internal');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ViewerResponse | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(
        `${API_URL}/api/deals/${encodeURIComponent(dealId)}/lender-package?lenderLoanId=${encodeURIComponent(lenderLoanId)}&view=${view}`,
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(typeof data.error === 'string' ? data.error : 'Unable to load lender package');
      }

      setResult(data as ViewerResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  const packageMetadata = isRecord(result?.package) && isRecord(result.package.metadata)
    ? result.package.metadata
    : null;
  const packageValuation = isRecord(result?.package) && isRecord(result.package.valuation)
    ? result.package.valuation
    : null;
  const packageRiskSummary = isRecord(result?.package) && isRecord(result.package.riskSummary)
    ? result.package.riskSummary
    : null;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.18),_transparent_35%),linear-gradient(180deg,_#111827_0%,_#030712_100%)] text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-orange-300">818 Capital Internal</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">Lender Package Viewer</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-300">
              Pull the lender JSON package and PDF-ready layout for any stored deal, then inspect the internal or borrower-facing view in the browser.
            </p>
          </div>
          <a
            href="/internal/match"
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-orange-300/50 hover:bg-orange-400/10"
          >
            Back to Match Tool
          </a>
        </div>

        <div className="grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
          <form onSubmit={handleSubmit} className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                  Deal ID
                </label>
                <input
                  value={dealId}
                  onChange={(event) => setDealId(event.target.value)}
                  placeholder="UUID from deals table"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm outline-none transition focus:border-orange-300/60"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                  Lender Loan ID
                </label>
                <input
                  value={lenderLoanId}
                  onChange={(event) => setLenderLoanId(event.target.value)}
                  placeholder="Example: LN-44721"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm outline-none transition focus:border-orange-300/60"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                  View
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['internal', 'borrower'] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setView(option)}
                      className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
                        view === option
                          ? 'bg-orange-400 text-slate-950'
                          : 'border border-white/10 bg-slate-950/70 text-slate-300 hover:border-orange-300/40'
                      }`}
                    >
                      {option === 'internal' ? 'Internal' : 'Borrower'}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !dealId || !lenderLoanId}
                className="w-full rounded-2xl bg-orange-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-orange-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Loading package...' : 'Load Lender Package'}
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-xs text-slate-400">
              API request:
              <div className="mt-2 break-all font-mono text-[11px] text-slate-200">
                {`${API_URL}/api/deals/${dealId || ':dealId'}/lender-package?lenderLoanId=${lenderLoanId || 'LN-44721'}&view=${view}`}
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
                {error}
              </div>
            )}
          </form>

          <div className="space-y-6">
            {!result && !error && (
              <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-10 text-center text-slate-400">
                Load a deal to preview the lender package, borrower summary, and PDF section map.
              </div>
            )}

            {result && (
              <>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Deal</div>
                    <div className="mt-3 text-sm text-slate-200">{result.dealId}</div>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Loan ID</div>
                    <div className="mt-3 text-sm text-slate-200">{result.lenderLoanId}</div>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <div className="text-xs uppercase tracking-[0.25em] text-slate-400">View</div>
                    <div className="mt-3 text-sm capitalize text-slate-200">{result.view}</div>
                  </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                  <div className="space-y-6">
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                      <h2 className="text-lg font-semibold">Package Snapshot</h2>
                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl bg-slate-950/60 p-4">
                          <div className="text-xs uppercase tracking-[0.25em] text-slate-500">Metadata</div>
                          <pre className="mt-3 overflow-x-auto text-xs text-slate-200">{prettyJson(packageMetadata)}</pre>
                        </div>
                        <div className="rounded-2xl bg-slate-950/60 p-4">
                          <div className="text-xs uppercase tracking-[0.25em] text-slate-500">Valuation</div>
                          <pre className="mt-3 overflow-x-auto text-xs text-slate-200">{prettyJson(packageValuation)}</pre>
                        </div>
                        <div className="rounded-2xl bg-slate-950/60 p-4 md:col-span-2">
                          <div className="text-xs uppercase tracking-[0.25em] text-slate-500">Risk Summary</div>
                          <pre className="mt-3 overflow-x-auto text-xs text-slate-200">{prettyJson(packageRiskSummary)}</pre>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                      <h2 className="text-lg font-semibold">Raw JSON</h2>
                      <pre className="mt-4 max-h-[540px] overflow-auto rounded-2xl bg-slate-950/70 p-4 text-xs text-slate-200">
                        {prettyJson(result.package)}
                      </pre>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                    <h2 className="text-lg font-semibold">PDF Layout Preview</h2>
                    <p className="mt-2 text-sm text-slate-400">{result.pdfDocument.title}</p>

                    <div className="mt-5 space-y-4">
                      {result.pdfDocument.sections.map((section) => (
                        <div key={section.key} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <h3 className="font-medium text-slate-100">{section.title}</h3>
                            <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.25em] text-slate-400">
                              {section.key}
                            </span>
                          </div>

                          {section.textBlocks.length > 0 && (
                            <div className="mt-3 space-y-2 text-sm text-slate-300">
                              {section.textBlocks.map((block, index) => (
                                <div key={`${section.key}-text-${index}`}>
                                  {block.heading && (
                                    <div className="mb-1 text-[11px] uppercase tracking-[0.25em] text-slate-500">
                                      {block.heading}
                                    </div>
                                  )}
                                  {Array.isArray(block.content) ? (
                                    <ul className="space-y-1">
                                      {block.content.map((item, itemIndex) => (
                                        <li key={`${section.key}-item-${itemIndex}`} className="list-disc pl-4">
                                          {item}
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p>{block.content}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {section.tables.length > 0 && (
                            <div className="mt-4 space-y-3">
                              {section.tables.map((table) => (
                                <div key={`${section.key}-${table.heading}`} className="overflow-hidden rounded-2xl border border-white/10">
                                  <div className="border-b border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.25em] text-slate-400">
                                    {table.heading}
                                  </div>
                                  <div className="overflow-x-auto">
                                    <table className="min-w-full text-left text-xs text-slate-300">
                                      <thead className="bg-slate-950/60 text-slate-500">
                                        <tr>
                                          {table.columns.map((column) => (
                                            <th key={column} className="px-3 py-2 font-medium">
                                              {column}
                                            </th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {table.rows.slice(0, 4).map((row, rowIndex) => (
                                          <tr key={`${table.heading}-${rowIndex}`} className="border-t border-white/5">
                                            {row.map((cell, cellIndex) => (
                                              <td key={`${table.heading}-${rowIndex}-${cellIndex}`} className="px-3 py-2">
                                                {cell == null ? 'N/A' : String(cell)}
                                              </td>
                                            ))}
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
