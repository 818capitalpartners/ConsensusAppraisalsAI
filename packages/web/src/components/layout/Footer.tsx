import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/50 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <Image
                src="/logo.png"
                alt="818 Capital Partners"
                width={36}
                height={36}
                className="rounded-lg"
              />
              <div>
                <div className="text-white font-bold text-sm">818 Capital Partners</div>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Investor-focused lending partner. Fast closings, no tax returns, purpose-built programs for DSCR, Fix & Flip, STR, and Multifamily.
            </p>
          </div>

          {/* Loan Programs */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Loan Programs</h4>
            <ul className="space-y-2">
              <li><Link href="/dscr" className="text-slate-400 text-sm hover:text-white transition-colors">DSCR Loans</Link></li>
              <li><Link href="/fix-and-flip" className="text-slate-400 text-sm hover:text-white transition-colors">Fix & Flip</Link></li>
              <li><Link href="/str" className="text-slate-400 text-sm hover:text-white transition-colors">STR Loans</Link></li>
              <li><Link href="/multifamily" className="text-slate-400 text-sm hover:text-white transition-colors">Multifamily</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Company</h4>
            <ul className="space-y-2">
              <li><Link href="/broker-program" className="text-slate-400 text-sm hover:text-white transition-colors">Broker Program</Link></li>
              <li><Link href="/blog" className="text-slate-400 text-sm hover:text-white transition-colors">Blog & Resources</Link></li>
              <li><Link href="/get-quote" className="text-slate-400 text-sm hover:text-white transition-colors">Get a Quote</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Contact</h4>
            <ul className="space-y-2">
              <li className="text-slate-400 text-sm">📞 (818) 555-1234</li>
              <li className="text-slate-400 text-sm">✉️ team@818capitalpartners.com</li>
              <li className="text-slate-400 text-sm">📍 Los Angeles, CA</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800/50 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-xs">
            © {new Date().getFullYear()} 818 Capital Partners. All rights reserved. NMLS #[pending].
          </p>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-slate-500 text-xs hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-slate-500 text-xs hover:text-slate-300 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
