'use client';

import { useState, memo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from 'react-simple-maps';

/* ── Types ──────────────────────────────────────────────────────────── */

interface MarketInfo {
  city: string;
  state: string;
  coordinates: [number, number]; // [lng, lat]
  desc: string;
  products: string[];
}

/* ── Data ───────────────────────────────────────────────────────────── */

const GEO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

const MARKETS: MarketInfo[] = [
  { city: 'New York', state: 'NY', coordinates: [-74.006, 40.7128], desc: 'NYC metro, Long Island, Westchester, Hudson Valley', products: ['DSCR', 'Multifamily', 'STR'] },
  { city: 'Miami', state: 'FL', coordinates: [-80.1918, 25.7617], desc: 'Miami-Dade, Broward, Palm Beach', products: ['STR', 'DSCR', 'Fix & Flip'] },
  { city: 'Dallas', state: 'TX', coordinates: [-96.797, 32.7767], desc: 'DFW metroplex, Fort Worth, Arlington', products: ['DSCR', 'Multifamily', 'Bridge'] },
  { city: 'Los Angeles', state: 'CA', coordinates: [-118.2437, 34.0522], desc: 'LA County, Orange County, Inland Empire', products: ['DSCR', 'Fix & Flip', 'STR', 'Multifamily'] },
  { city: 'Phoenix', state: 'AZ', coordinates: [-112.074, 33.4484], desc: 'Phoenix, Scottsdale, Mesa, Tempe', products: ['DSCR', 'STR', 'Multifamily'] },
  { city: 'Atlanta', state: 'GA', coordinates: [-84.388, 33.749], desc: 'Metro Atlanta, Marietta, Decatur', products: ['DSCR', 'Fix & Flip', 'Bridge'] },
  { city: 'Nashville', state: 'TN', coordinates: [-86.7816, 36.1627], desc: 'Davidson County, Music City metro', products: ['STR', 'DSCR', 'Fix & Flip'] },
  { city: 'Chicago', state: 'IL', coordinates: [-87.6298, 41.8781], desc: 'Chicagoland, Cook County, suburbs', products: ['DSCR', 'Multifamily'] },
  { city: 'Denver', state: 'CO', coordinates: [-104.9903, 39.7392], desc: 'Denver metro, Front Range', products: ['DSCR', 'STR'] },
  { city: 'Austin', state: 'TX', coordinates: [-97.7431, 30.2672], desc: 'Austin metro, tech hub', products: ['STR', 'DSCR', 'Fix & Flip'] },
];

// States we actively lend in (FIPS lookup)
const COVERAGE_FIPS = new Set([
  '36', // NY
  '34', // NJ
  '09', // CT
  '25', // MA
  '42', // PA
  '24', // MD
  '51', // VA
  '11', // DC
  '12', // FL
  '13', // GA
  '37', // NC
  '45', // SC
  '47', // TN
  '01', // AL
  '39', // OH
  '17', // IL
  '18', // IN
  '26', // MI
  '29', // MO
  '27', // MN
  '55', // WI
  '48', // TX
  '04', // AZ
  '35', // NM
  '32', // NV
  '08', // CO
  '06', // CA
  '41', // OR
  '53', // WA
  '49', // UT
  '16', // ID
]);

/* ── Styled Pin (animated) ──────────────────────────────────────────── */

function AnimatedPin({ isHovered }: { isHovered: boolean }) {
  return (
    <g>
      {/* Pulse ring */}
      <circle r={12} fill="none" stroke="#1B69D4" strokeWidth={1} opacity={0.4}>
        <animate attributeName="r" from="6" to="18" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="0.5" to="0" dur="2s" repeatCount="indefinite" />
      </circle>
      {/* Pin dot */}
      <circle
        r={isHovered ? 7 : 5}
        fill="#1B69D4"
        stroke="white"
        strokeWidth={2}
        style={{ transition: 'r 0.15s ease' }}
      />
    </g>
  );
}

/* ── FIPS-based state name lookup (for tooltip) ──────────────────── */

const FIPS_TO_NAME: Record<string, string> = {
  '01': 'Alabama', '02': 'Alaska', '04': 'Arizona', '05': 'Arkansas',
  '06': 'California', '08': 'Colorado', '09': 'Connecticut', '10': 'Delaware',
  '11': 'District of Columbia', '12': 'Florida', '13': 'Georgia', '15': 'Hawaii',
  '16': 'Idaho', '17': 'Illinois', '18': 'Indiana', '19': 'Iowa',
  '20': 'Kansas', '21': 'Kentucky', '22': 'Louisiana', '23': 'Maine',
  '24': 'Maryland', '25': 'Massachusetts', '26': 'Michigan', '27': 'Minnesota',
  '28': 'Mississippi', '29': 'Missouri', '30': 'Montana', '31': 'Nebraska',
  '32': 'Nevada', '33': 'New Hampshire', '34': 'New Jersey', '35': 'New Mexico',
  '36': 'New York', '37': 'North Carolina', '38': 'North Dakota', '39': 'Ohio',
  '40': 'Oklahoma', '41': 'Oregon', '42': 'Pennsylvania', '44': 'Rhode Island',
  '45': 'South Carolina', '46': 'South Dakota', '47': 'Tennessee', '48': 'Texas',
  '49': 'Utah', '50': 'Vermont', '51': 'Virginia', '53': 'Washington',
  '54': 'West Virginia', '55': 'Wisconsin', '56': 'Wyoming',
};

/* ── Component ──────────────────────────────────────────────────────── */

function USMapInner() {
  const [activeMarket, setActiveMarket] = useState<MarketInfo | null>(null);
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  return (
    <div className="relative">
      <ComposableMap
        projection="geoAlbersUsa"
        projectionConfig={{ scale: 1000 }}
        width={800}
        height={500}
        style={{ width: '100%', height: 'auto' }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const fips = geo.id as string;
              const isActive = COVERAGE_FIPS.has(fips);
              const isHovered = hoveredState === fips;

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onMouseEnter={() => setHoveredState(fips)}
                  onMouseLeave={() => setHoveredState(null)}
                  style={{
                    default: {
                      fill: isActive ? '#BCCCDC' : '#F0F4F8',
                      stroke: '#D9E2EC',
                      strokeWidth: 0.5,
                      outline: 'none',
                      transition: 'fill 0.2s ease',
                    },
                    hover: {
                      fill: isActive ? '#9FB3C8' : '#E2E8F0',
                      stroke: '#9FB3C8',
                      strokeWidth: 0.75,
                      outline: 'none',
                      cursor: isActive ? 'pointer' : 'default',
                    },
                    pressed: {
                      fill: isActive ? '#627D98' : '#F0F4F8',
                      stroke: '#627D98',
                      strokeWidth: 0.75,
                      outline: 'none',
                    },
                  }}
                />
              );
            })
          }
        </Geographies>

        {/* Market pins */}
        {MARKETS.map((market) => (
          <Marker
            key={market.city}
            coordinates={market.coordinates}
            onMouseEnter={() => setActiveMarket(market)}
            onMouseLeave={() => setActiveMarket(null)}
            onClick={() => setActiveMarket(activeMarket?.city === market.city ? null : market)}
            style={{ cursor: 'pointer' }}
          >
            <AnimatedPin isHovered={activeMarket?.city === market.city} />
            <text
              textAnchor="middle"
              y={-12}
              style={{
                fontFamily: 'Montserrat, system-ui, sans-serif',
                fontSize: '8px',
                fontWeight: 600,
                fill: '#1A2B42',
                pointerEvents: 'none',
              }}
            >
              {market.city}
            </text>
          </Marker>
        ))}
      </ComposableMap>

      {/* "Active in 48 States" badge */}
      <div className="flex justify-center mt-4">
        <span className="inline-flex items-center gap-2 bg-accent text-white text-sm font-sans font-bold px-6 py-2.5 rounded-full shadow-md">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
          </svg>
          Active in 48 States
        </span>
      </div>

      {/* Tooltip card */}
      {activeMarket && (
        <div className="absolute top-4 right-4 w-72 bg-white rounded-lg border border-navy-100 shadow-lg p-5 z-10 animate-in fade-in">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-h4 text-navy-900">{activeMarket.city}, {activeMarket.state}</h3>
            <button
              onClick={() => setActiveMarket(null)}
              className="text-navy-400 hover:text-navy-700 text-lg leading-none"
              aria-label="Close tooltip"
            >
              &times;
            </button>
          </div>
          <p className="text-sm text-navy-500 font-body leading-relaxed mb-3">{activeMarket.desc}</p>
          <div className="flex flex-wrap gap-1.5">
            {activeMarket.products.map((p) => (
              <span key={p} className="bg-accent/10 text-accent text-xs font-sans font-semibold px-2.5 py-1 rounded">
                {p}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Hovered state name tooltip (subtle) */}
      {hoveredState && !activeMarket && FIPS_TO_NAME[hoveredState] && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-navy-900/90 text-white text-xs font-sans px-3 py-1.5 rounded-md pointer-events-none z-10">
          {FIPS_TO_NAME[hoveredState]}
          {COVERAGE_FIPS.has(hoveredState) && (
            <span className="text-accent-light ml-1.5">• We lend here</span>
          )}
        </div>
      )}
    </div>
  );
}

const USMap = memo(USMapInner);
export default USMap;
