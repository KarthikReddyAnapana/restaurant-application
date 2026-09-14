import { useState } from 'react';

// Local food photos served from /public/food. If a file is missing the image
// silently falls back to the rich inline SVG food art below, so the UI always
// looks like a polished food site.
const BY_NAME: Record<string, string> = {
  'Margherita Pizza': '/food/margherita-pizza.jpg',
  'Chicken Tikka Pizza': '/food/chicken-tikka-pizza.jpg',
  'Chicken Burger': '/food/chicken-burger.jpg',
  'Chicken Biryani': '/food/chicken-biryani.jpg',
};

const BY_CATEGORY: Record<string, string> = {
  Pizza: '/food/margherita-pizza.jpg',
};

function photoUrl(name: string, category: string): string | null {
  return BY_NAME[name] ?? BY_CATEGORY[category] ?? null;
}

type ArtKind = 'pizza' | 'burger' | 'rice' | 'dessert' | 'plate';

function artKind(name: string, category: string): ArtKind {
  const c = category.toLowerCase();
  const n = name.toLowerCase();
  if (c.includes('pizza') || n.includes('pizza')) return 'pizza';
  if (c.includes('burger') || n.includes('burger')) return 'burger';
  if (c.includes('biryani') || n.includes('rice') || n.includes('biryani')) return 'rice';
  if (c.includes('dessert') || n.includes('jamun') || n.includes('cake') || n.includes('sweet'))
    return 'dessert';
  return 'plate';
}

function FoodArt({ name, category }: { name: string; category: string }) {
  const kind = artKind(name, category);
  return (
    <svg viewBox="0 0 200 128" preserveAspectRatio="xMidYMid slice" role="img" aria-label={name}>
      <defs>
        <linearGradient id="fa-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffd9a0" />
          <stop offset="1" stopColor="#ff9a62" />
        </linearGradient>
        <linearGradient id="fa-bun" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4c076" />
          <stop offset="1" stopColor="#e09b45" />
        </linearGradient>
        <radialGradient id="fa-plate" cx="0.5" cy="0.45" r="0.6">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e7e9f0" />
        </radialGradient>
      </defs>
      <rect width="200" height="128" fill="url(#fa-bg)" />
      <circle cx="30" cy="24" r="26" fill="#ffffff" opacity="0.14" />
      <circle cx="176" cy="108" r="34" fill="#ffffff" opacity="0.12" />

      {kind === 'pizza' && (
        <g transform="translate(100 66)">
          <circle r="46" fill="#f2c14e" />
          <circle r="40" fill="#e2451f" />
          <circle r="34" fill="#f7d9a0" />
          <circle cx="-14" cy="-8" r="6" fill="#c0392b" />
          <circle cx="12" cy="-14" r="6" fill="#c0392b" />
          <circle cx="16" cy="12" r="6" fill="#c0392b" />
          <circle cx="-10" cy="16" r="6" fill="#c0392b" />
          <circle cx="0" cy="0" r="6" fill="#c0392b" />
          <path d="M-6-22 q4 4 0 8 q-4 4 0 8" stroke="#2e7d32" strokeWidth="3" fill="none" />
          <path d="M18-2 q4 3 0 7" stroke="#2e7d32" strokeWidth="3" fill="none" />
        </g>
      )}

      {kind === 'burger' && (
        <g transform="translate(100 64)">
          <path d="M-46 -14 a46 30 0 0 1 92 0 z" fill="url(#fa-bun)" />
          <circle cx="-24" cy="-24" r="2.2" fill="#fff5dc" />
          <circle cx="-6" cy="-30" r="2.2" fill="#fff5dc" />
          <circle cx="14" cy="-27" r="2.2" fill="#fff5dc" />
          <circle cx="28" cy="-20" r="2.2" fill="#fff5dc" />
          <path d="M-48 -12 q48 16 96 0 v6 q-48 14 -96 0 z" fill="#6ab04c" />
          <rect x="-48" y="-4" width="96" height="12" rx="4" fill="#ffcf3f" />
          <rect x="-46" y="6" width="92" height="14" rx="7" fill="#7b3f16" />
          <path d="M-46 20 a46 12 0 0 0 92 0 z" fill="url(#fa-bun)" />
        </g>
      )}

      {kind === 'rice' && (
        <g transform="translate(100 70)">
          <ellipse cx="0" cy="18" rx="52" ry="16" fill="#c98a3a" />
          <path d="M-52 8 a52 26 0 0 0 104 0 z" fill="#e3a94e" />
          <ellipse cx="0" cy="4" rx="48" ry="20" fill="#f4e3b6" />
          {Array.from({ length: 22 }).map((_, i) => (
            <rect
              key={i}
              x={-42 + (i % 11) * 8}
              y={-6 + Math.floor(i / 11) * 9}
              width="6"
              height="3"
              rx="1.5"
              fill="#fffaf0"
              transform={`rotate(${(i * 37) % 90} ${-39 + (i % 11) * 8} ${-4 + Math.floor(i / 11) * 9})`}
            />
          ))}
          <circle cx="-18" cy="0" r="4" fill="#d94f2b" />
          <circle cx="16" cy="6" r="4" fill="#d94f2b" />
          <path d="M6-6 q4 4 0 9" stroke="#2e7d32" strokeWidth="3" fill="none" />
        </g>
      )}

      {kind === 'dessert' && (
        <g transform="translate(100 72)">
          <ellipse cx="0" cy="10" rx="52" ry="18" fill="url(#fa-plate)" />
          <ellipse cx="0" cy="6" rx="40" ry="13" fill="#7a3b12" opacity="0.35" />
          <circle cx="-18" cy="0" r="11" fill="#8a4a1c" />
          <circle cx="4" cy="-4" r="12" fill="#7a3f16" />
          <circle cx="24" cy="2" r="11" fill="#8a4a1c" />
          <circle cx="-18" cy="-3" r="3" fill="#c9863f" opacity="0.7" />
          <circle cx="4" cy="-8" r="3" fill="#c9863f" opacity="0.7" />
          <circle cx="24" cy="-1" r="3" fill="#c9863f" opacity="0.7" />
        </g>
      )}

      {kind === 'plate' && (
        <g transform="translate(100 64)">
          <ellipse cx="0" cy="6" rx="46" ry="30" fill="url(#fa-plate)" />
          <ellipse cx="0" cy="6" rx="30" ry="19" fill="#eef0f6" />
          <path d="M-2-30 v20 M2-30 v20" stroke="#c9ccd8" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}

type Props = {
  name: string;
  category: string;
  className?: string;
};

export default function FoodImage({ name, category, className }: Props) {
  const url = photoUrl(name, category);
  const [showPhoto, setShowPhoto] = useState(Boolean(url));

  return (
    <div className={`food-img ${className ?? ''}`}>
      <div className="food-art">
        <FoodArt name={name} category={category} />
      </div>
      {url && showPhoto && (
        <img
          src={url}
          alt={name}
          loading="lazy"
          className="food-photo"
          onError={() => setShowPhoto(false)}
        />
      )}
    </div>
  );
}
