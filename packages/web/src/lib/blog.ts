/**
 * Blog utilities — loads MDX posts from filesystem.
 * Simple file-based approach without heavy MDX plugins.
 * Posts are plain .mdx files with YAML-like frontmatter parsed manually.
 */
import fs from 'fs';
import path from 'path';

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  category: string;
  tags: string[];
  readTime: string;
  content: string;
}

const CONTENT_DIR = path.join(process.cwd(), 'src', 'content', 'blog');

function parseFrontmatter(raw: string): { meta: Record<string, string>; content: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, content: raw };

  const meta: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim();
      const val = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
      meta[key] = val;
    }
  }
  return { meta, content: match[2].trim() };
}

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];

  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.mdx'));

  const posts = files.map(file => {
    const slug = file.replace('.mdx', '');
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf8');
    const { meta, content } = parseFrontmatter(raw);

    return {
      slug,
      title: meta.title || slug,
      description: meta.description || '',
      date: meta.date || '',
      author: meta.author || '818 Capital Team',
      category: meta.category || 'Guides',
      tags: (meta.tags || '').split(',').map(t => t.trim()).filter(Boolean),
      readTime: meta.readTime || `${Math.ceil(content.split(/\s+/).length / 200)} min read`,
      content,
    };
  });

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): BlogPost | null {
  const posts = getAllPosts();
  return posts.find(p => p.slug === slug) || null;
}

export function getPostsByCategory(category: string): BlogPost[] {
  return getAllPosts().filter(p => p.category.toLowerCase() === category.toLowerCase());
}
