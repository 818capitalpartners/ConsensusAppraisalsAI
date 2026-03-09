import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'Blog | 818 Capital Partners — Investor Lending Insights',
  description: 'Expert guides on DSCR loans, fix & flip financing, short-term rental investing, and multifamily deals. Written by real mortgage brokers.',
};

const CATEGORY_COLORS: Record<string, string> = {
  'DSCR': 'bg-blue-500/20 text-blue-400',
  'Fix & Flip': 'bg-orange-500/20 text-orange-400',
  'STR': 'bg-purple-500/20 text-purple-400',
  'Multifamily': 'bg-teal-500/20 text-teal-400',
  'Guides': 'bg-emerald-500/20 text-emerald-400',
  'Market': 'bg-amber-500/20 text-amber-400',
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Investor Lending <span className="text-blue-400">Insights</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Actionable guides on DSCR, fix &amp; flip, STR, and multifamily financing — from brokers who close these deals every day.
            </p>
          </div>
        </section>

        {/* Posts Grid */}
        <section className="max-w-6xl mx-auto px-4 pb-20">
          {posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-500 text-lg">Blog posts coming soon. Check back shortly.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group block bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-200"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${CATEGORY_COLORS[post.category] || 'bg-slate-700 text-slate-300'}`}>
                      {post.category}
                    </span>
                    <span className="text-xs text-slate-500">{post.readTime}</span>
                  </div>
                  <h2 className="text-lg font-semibold mb-2 group-hover:text-blue-400 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-sm text-slate-400 line-clamp-3 mb-4">
                    {post.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{post.author}</span>
                    <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
