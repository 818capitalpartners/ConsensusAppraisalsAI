import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { POSTS } from '@/lib/blog-data';

export const metadata: Metadata = {
  title: 'Blog | 818 Capital',
  description: 'Real estate investment insights, market analysis, and lending education from 818 Capital.',
};

export default function BlogPage() {
  return (
    <>
      <section className="bg-navy-900 py-16">
        <div className="mx-auto max-w-content px-6">
          <h1 className="text-h1 text-white">Blog</h1>
          <p className="mt-4 text-lg text-navy-200 font-body font-light">
            Real estate investment insights, market analysis, and lending education.
          </p>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-content px-6">
          {/* Featured */}
          <div className="mb-16">
            <Link href={`/blog/${POSTS[0].slug}`} className="group grid gap-8 lg:grid-cols-2 items-center">
              <div className="relative h-72 rounded-lg overflow-hidden">
                <Image src={POSTS[0].image} alt={POSTS[0].title} fill className="object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute top-4 left-4">
                  <span className="bg-accent text-white text-xs font-sans font-semibold uppercase tracking-wide px-3 py-1 rounded">{POSTS[0].category}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-navy-400 font-body mb-2">{POSTS[0].date} &middot; {POSTS[0].readTime}</p>
                <h2 className="text-h2 text-navy-900 group-hover:text-accent transition">{POSTS[0].title}</h2>
                <p className="mt-3 text-navy-500 font-body leading-relaxed">{POSTS[0].excerpt}</p>
                <p className="mt-4 text-sm font-sans font-semibold text-accent uppercase tracking-wide">Read Article →</p>
              </div>
            </Link>
          </div>

          {/* Grid */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {POSTS.slice(1).map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group rounded-lg border border-navy-100 bg-white shadow-sm overflow-hidden hover:shadow-md transition">
                <div className="relative h-48 overflow-hidden">
                  <Image src={post.image} alt={post.title} fill className="object-cover transition duration-500 group-hover:scale-105" />
                  <div className="absolute top-3 left-3">
                    <span className="bg-navy-900/80 text-white text-xs font-sans font-semibold uppercase tracking-wide px-2.5 py-1 rounded">{post.category}</span>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-xs text-navy-400 font-body mb-2">{post.date} &middot; {post.readTime}</p>
                  <h3 className="text-h4 text-navy-900 group-hover:text-accent transition mb-2">{post.title}</h3>
                  <p className="text-sm text-navy-500 font-body leading-relaxed line-clamp-3">{post.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
