/**
 * Booster-style cup: yellow body, purple branding, fruit graphic per flavour.
 */

type SmoothieCupProps = {
  slug: string;
  flavour?: string;
  name?: string;
  className?: string;
  /** Larger fruit / logo for detail pages */
  size?: "card" | "hero";
};

const FLAVOUR_THEMES: Record<string, CupTheme> = {
  mango: { fill: "#F4A020", fruit: "mango" },
  tropical: { fill: "#E8913A", fruit: "tropical" },
  banana: { fill: "#F5D76E", fruit: "banana" },
  strawberry: { fill: "#E85A6B", fruit: "strawberry" },
  berry: { fill: "#9B2D5B", fruit: "berry" },
  classic: { fill: "#7B3FA0", fruit: "classic" },
  nut: { fill: "#C48A3A", fruit: "nut" },
  coconut: { fill: "#E8D5B5", fruit: "coconut" },
  pineapple: { fill: "#F0C040", fruit: "pineapple" },
};

function getCupTheme(slug: string, flavour?: string): CupTheme {
  if (slug in THEMES) return THEMES[slug];
  if (flavour && flavour in FLAVOUR_THEMES) return FLAVOUR_THEMES[flavour];
  return { fill: "#7B3FA0", fruit: "classic" };
}

type CupTheme = {
  fill: string;
  fruit: "mango" | "tropical" | "banana" | "strawberry" | "berry" | "classic" | "nut" | "coconut" | "pineapple" | "monkey" | "colada" | "pawpaw";
};

const THEMES: Record<string, CupTheme> = {
  "regular-mango-hurrican": { fill: "#F4A020", fruit: "mango" },
  "mango-hurrican-tropical": { fill: "#E8913A", fruit: "tropical" },
  "regular-tropical-tornado": { fill: "#E07830", fruit: "tropical" },
  "regular-breezy-banana": { fill: "#F5D76E", fruit: "banana" },
  "regular-strawbery-sunshine": { fill: "#E85A6B", fruit: "strawberry" },
  "straybery-sunshine-berry": { fill: "#C94B6A", fruit: "berry" },
  "regular-very-berry": { fill: "#9B2D5B", fruit: "berry" },
  "regular-the-original": { fill: "#7B3FA0", fruit: "classic" },
  "regular-banana-a-whey": { fill: "#E8C84A", fruit: "banana" },
  "regular-ripped-berry": { fill: "#A33A5C", fruit: "berry" },
  "regular-strawberry-storm": { fill: "#D6455A", fruit: "strawberry" },
  "regular-nuttin-butter": { fill: "#C48A3A", fruit: "nut" },
  "regular-coco-crush": { fill: "#E8D5B5", fruit: "coconut" },
  "regular-pineapple-freeze": { fill: "#F0C040", fruit: "pineapple" },
  "regular-funky-monkey": { fill: "#8B5A2B", fruit: "monkey" },
  "canada-colada": { fill: "#F2D08A", fruit: "colada" },
  "berry-cream-sensation": { fill: "#B85A7A", fruit: "berry" },
  "paw-paw-passion": { fill: "#F0A040", fruit: "pawpaw" },
};

function FruitGraphic({ fruit }: { fruit: CupTheme["fruit"] }) {
  switch (fruit) {
    case "mango":
      return (
        <g transform="translate(100,118)">
          <ellipse cx="28" cy="32" rx="22" ry="28" fill="#FFB000" transform="rotate(-25 28 32)" />
          <ellipse cx="28" cy="32" rx="16" ry="22" fill="#FFC933" transform="rotate(-25 28 32)" />
          <path d="M18 8 Q22 0 30 4" fill="none" stroke="#2D6A3E" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="24" cy="4" rx="8" ry="4" fill="#3D8B4F" transform="rotate(-20 24 4)" />
        </g>
      );
    case "tropical":
      return (
        <g transform="translate(88,112)">
          {/* passion fruit */}
          <circle cx="18" cy="28" r="14" fill="#6B2D5B" />
          <circle cx="18" cy="28" r="9" fill="#F5E6A3" />
          <circle cx="15" cy="25" r="1.5" fill="#6B2D5B" />
          <circle cx="21" cy="26" r="1.5" fill="#6B2D5B" />
          <circle cx="18" cy="31" r="1.5" fill="#6B2D5B" />
          {/* pineapple */}
          <ellipse cx="52" cy="36" rx="12" ry="16" fill="#F0C040" />
          <path d="M52 12 L46 22 L52 20 L58 22 Z" fill="#3D8B4F" />
          <path d="M52 14 L48 24 L52 22 L56 24 Z" fill="#2D6A3E" />
          <line x1="44" y1="30" x2="60" y2="30" stroke="#D4A017" strokeWidth="1" />
          <line x1="44" y1="36" x2="60" y2="36" stroke="#D4A017" strokeWidth="1" />
          <line x1="44" y1="42" x2="60" y2="42" stroke="#D4A017" strokeWidth="1" />
        </g>
      );
    case "banana":
      return (
        <g transform="translate(95,115)">
          <path
            d="M12 48 Q8 28 18 12 Q28 4 42 10 Q50 16 48 28 Q46 42 32 50 Q20 54 12 48"
            fill="#F5D76E"
          />
          <path
            d="M16 46 Q12 28 20 14 Q28 8 40 12"
            fill="none"
            stroke="#E8C84A"
            strokeWidth="2"
          />
          <ellipse cx="42" cy="10" rx="4" ry="3" fill="#6B4F1D" />
        </g>
      );
    case "strawberry":
      return (
        <g transform="translate(100,112)">
          <path
            d="M28 12 C18 12 8 22 10 36 C12 50 28 58 28 58 C28 58 44 50 46 36 C48 22 38 12 28 12"
            fill="#E23D4A"
          />
          <path d="M18 14 L28 6 L38 14 L32 18 L28 10 L24 18 Z" fill="#3D8B4F" />
          <circle cx="20" cy="28" r="1.8" fill="#FFEB99" />
          <circle cx="30" cy="24" r="1.8" fill="#FFEB99" />
          <circle cx="36" cy="32" r="1.8" fill="#FFEB99" />
          <circle cx="24" cy="38" r="1.8" fill="#FFEB99" />
          <circle cx="34" cy="42" r="1.8" fill="#FFEB99" />
        </g>
      );
    case "berry":
      return (
        <g transform="translate(90,118)">
          <circle cx="22" cy="28" r="14" fill="#7B1E3A" />
          <circle cx="18" cy="24" r="2" fill="#9B2D5B" />
          <circle cx="26" cy="26" r="2" fill="#9B2D5B" />
          <circle cx="22" cy="32" r="2" fill="#9B2D5B" />
          <circle cx="48" cy="34" r="12" fill="#4A1A6B" />
          <circle cx="44" cy="30" r="1.8" fill="#6B2D8B" />
          <circle cx="52" cy="32" r="1.8" fill="#6B2D8B" />
          <circle cx="48" cy="38" r="1.8" fill="#6B2D8B" />
          <circle cx="36" cy="18" r="10" fill="#C94B6A" />
          <circle cx="33" cy="15" r="1.5" fill="#E85A7A" />
          <circle cx="39" cy="17" r="1.5" fill="#E85A7A" />
        </g>
      );
    case "classic":
      return (
        <g transform="translate(92,115)">
          <circle cx="20" cy="34" r="11" fill="#E23D4A" />
          <ellipse cx="42" cy="30" rx="10" ry="13" fill="#FFB000" transform="rotate(-20 42 30)" />
          <circle cx="58" cy="38" r="10" fill="#7B1E3A" />
          <path d="M34 12 Q38 4 44 10 Q40 16 34 12" fill="#3D8B4F" />
        </g>
      );
    case "nut":
      return (
        <g transform="translate(95,118)">
          <ellipse cx="36" cy="34" rx="20" ry="16" fill="#C48A3A" />
          <ellipse cx="36" cy="34" rx="14" ry="11" fill="#D4A05A" />
          <path d="M22 28 Q36 22 50 28" fill="none" stroke="#A06A2A" strokeWidth="1.5" />
          <ellipse cx="18" cy="42" rx="8" ry="10" fill="#F5D76E" transform="rotate(30 18 42)" />
        </g>
      );
    case "coconut":
      return (
        <g transform="translate(98,115)">
          <circle cx="30" cy="32" r="20" fill="#6B4F3A" />
          <circle cx="30" cy="32" r="15" fill="#F5EDE0" />
          <circle cx="30" cy="32" r="10" fill="#FFF8F0" />
          <ellipse cx="26" cy="28" rx="3" ry="2" fill="#E8D5B5" />
          <path d="M48 18 Q58 8 62 18" fill="none" stroke="#3D8B4F" strokeWidth="2.5" />
        </g>
      );
    case "pineapple":
      return (
        <g transform="translate(100,108)">
          <path d="M28 8 L20 22 L28 18 L36 22 Z" fill="#2D6A3E" />
          <path d="M28 10 L22 26 L28 22 L34 26 Z" fill="#3D8B4F" />
          <path d="M28 12 L24 28 L28 24 L32 28 Z" fill="#4CAF50" />
          <ellipse cx="28" cy="42" rx="16" ry="22" fill="#F0C040" />
          <path d="M14 34 L42 34 M12 42 L44 42 M14 50 L42 50" stroke="#D4A017" strokeWidth="1.5" />
          <path d="M20 28 L24 56 M28 26 L28 58 M36 28 L32 56" stroke="#D4A017" strokeWidth="1" />
        </g>
      );
    case "monkey":
      return (
        <g transform="translate(92,115)">
          <path
            d="M8 44 Q6 26 16 12 Q26 4 38 12 Q46 22 44 36 Q40 48 28 52 Q14 52 8 44"
            fill="#F5D76E"
          />
          <circle cx="52" cy="36" r="12" fill="#5C3A21" />
          <circle cx="52" cy="36" r="8" fill="#3D2412" />
          <circle cx="49" cy="33" r="1.5" fill="#F5D76E" />
        </g>
      );
    case "colada":
      return (
        <g transform="translate(88,112)">
          <ellipse cx="18" cy="38" rx="10" ry="14" fill="#F0C040" />
          <path d="M18 16 L14 26 L18 24 L22 26 Z" fill="#3D8B4F" />
          <circle cx="42" cy="28" r="12" fill="#6B4F3A" />
          <circle cx="42" cy="28" r="8" fill="#FFF8F0" />
          <path
            d="M54 44 Q52 32 58 24 Q64 20 70 26"
            fill="#F5D76E"
            stroke="#E8C84A"
            strokeWidth="1"
          />
        </g>
      );
    case "pawpaw":
      return (
        <g transform="translate(95,112)">
          <ellipse cx="28" cy="34" rx="18" ry="24" fill="#F0A040" />
          <ellipse cx="28" cy="34" rx="12" ry="18" fill="#FFB85C" />
          <ellipse cx="28" cy="36" rx="4" ry="10" fill="#E87830" opacity="0.5" />
          <circle cx="50" cy="40" r="10" fill="#6B2D5B" />
          <circle cx="50" cy="40" r="6" fill="#F5E6A3" />
          <circle cx="48" cy="38" r="1.2" fill="#6B2D5B" />
          <circle cx="52" cy="40" r="1.2" fill="#6B2D5B" />
        </g>
      );
    default:
      return null;
  }
}

export function SmoothieCup({ slug, flavour, name, className, size = "card" }: SmoothieCupProps) {
  const theme = getCupTheme(slug, flavour);
  const uid = slug.replace(/[^a-z0-9]/gi, "") || "cup";
  const fruitTop = size === "hero" ? 14 : 11;
  const fruitBottom = size === "hero" ? 13 : 11;

  return (
    <svg
      viewBox="0 0 220 320"
      className={className}
      role="img"
      aria-label={name ? `${name} smoothie cup` : "Smoothie cup"}
    >
      <defs>
        <pattern id={`dimple-${uid}`} width="10" height="10" patternUnits="userSpaceOnUse">
          <circle cx="5" cy="5" r="1.2" fill="#E8A800" opacity="0.45" />
        </pattern>
        <linearGradient id={`smoothie-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={theme.fill} />
          <stop offset="100%" stopColor={theme.fill} stopOpacity="0.88" />
        </linearGradient>
        <linearGradient id={`cup-shine-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="40%" stopColor="#fff" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.06" />
        </linearGradient>
      </defs>

      <ellipse cx="110" cy="302" rx="58" ry="10" fill="#4B1B5C" opacity="0.18" />

      <path d="M48 88 L58 278 Q110 298 162 278 L172 88 Z" fill="#FFD100" />
      <path d="M48 88 L58 278 Q110 298 162 278 L172 88 Z" fill={`url(#dimple-${uid})`} />

      <path d="M54 88 L166 88 L162 108 L58 108 Z" fill="#4B1B5C" />
      <path
        d="M60 248 L58 278 Q110 298 162 278 L160 248 Q110 258 60 248 Z"
        fill="#4B1B5C"
      />

      <path
        d="M58 90 L66 250 Q88 260 90 248 L78 88 Z"
        fill={`url(#cup-shine-${uid})`}
      />

      <path
        d="M48 72 Q80 38 110 34 Q140 38 172 72 L168 98 Q110 108 52 98 Z"
        fill={`url(#smoothie-${uid})`}
      />
      <path
        d="M54 76 Q82 48 110 44 Q138 48 166 76"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
        opacity="0.35"
      />

      <ellipse cx="110" cy="88" rx="62" ry="14" fill="#F7F7F7" />
      <ellipse cx="110" cy="86" rx="56" ry="10" fill="#FFFFFF" />

      <text
        x="110"
        y="128"
        textAnchor="middle"
        fill="#4B1B5C"
        fontFamily="Georgia, serif"
        fontWeight="800"
        fontSize={fruitTop}
        letterSpacing="0.5"
      >
        Fruit
      </text>

      <g transform="translate(15, 58) scale(1.15)">
        <FruitGraphic fruit={theme.fruit} />
      </g>

      <text
        x="110"
        y="272"
        textAnchor="middle"
        fill="#FFD100"
        fontFamily="Georgia, serif"
        fontWeight="800"
        fontSize={fruitBottom}
        letterSpacing="0.5"
      >
        Booster
      </text>

      {[
        [72, 118],
        [88, 152],
        [142, 136],
        [156, 178],
        [98, 198],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="1.8" fill="#fff" opacity="0.55" />
      ))}
    </svg>
  );
}

export function hasSmoothieCupArt(_slug: string, _flavour?: string) {
  return false;
}
