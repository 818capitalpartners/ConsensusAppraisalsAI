const PROPERTY_IMAGE_REPLACEMENTS: Record<string, string> = {
  // Generic house photos out, grounded investor-relevant property photos in.
  'photo-1605276374104-dee2a0ed3cd6': 'photo-1460317442991-0ec209397118',
  'photo-1572120360610-d971b9d7767c': 'photo-1504307651254-35680f356dfd',
  'photo-1600596542815-ffad4c1539a9': 'photo-1499793983690-e29da59ef1c2',
  'photo-1570129477492-45c003edd2be': 'photo-1545324418-cc1a3fa10c00',
  'photo-1564013799919-ab600027ffc6': 'photo-1499793983690-e29da59ef1c2',
  'photo-1613490493576-7fde63acd811': 'photo-1460317442991-0ec209397118',
};

type ImageLoaderProps = {
  src: string;
  width: number;
  quality?: number;
};

function groundedPropertySrc(src: string) {
  return Object.entries(PROPERTY_IMAGE_REPLACEMENTS).reduce(
    (current, [oldId, newId]) => current.replace(oldId, newId),
    src
  );
}

export default function imageLoader({ src, width, quality }: ImageLoaderProps) {
  if (src.startsWith('/')) return src;

  const url = new URL(groundedPropertySrc(src));
  url.searchParams.set('w', String(width));
  url.searchParams.set('q', String(quality || 75));
  return url.toString();
}
