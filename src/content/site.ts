/**
 * ─────────────────────────────────────────────────────────────────────
 *  THE MANUSCRIPT
 *  Everything the site says lives in this file. Edit here, nowhere else.
 * ─────────────────────────────────────────────────────────────────────
 *
 *  Two things to check before you publish:
 *
 *  1. `author.name` was inferred from your email address. Correct it if
 *     the transliteration is off.
 *  2. `works` lists public GitHub repositories only. Add or remove entries
 *     freely; empty the array and the section renders its empty state.
 *
 *  Every fact in `ventures` comes from your own CV and nothing has been
 *  embellished. Where a one-line description of what each company
 *  actually builds would help a reader, add it to `detail`.
 */

export const author = {
  name: "Çınar Yıldırım",
  handle: "codeyevsky",
  role: "Founder & Engineer",
  location: "Istanbul, Türkiye",
  email: "c1n4r.yldrm@gmail.com",
} as const;

export const site = {
  title: "codeyevsky",
  tagline: "A portfolio in four chapters",
  description:
    "Çınar Yıldırım, founder and engineer in Istanbul. Co-founder and CTO at SolonGate, Emergent Ventures grantee, building at the edge of AI and infrastructure.",
  /* Set NEXT_PUBLIC_SITE_URL in Railway to the domain you actually serve.
     It is what canonical links, OpenGraph and the sitemap are built from,
     so a wrong value here is a wrong link in every share preview. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://codeyevsky.com",
};

export const epigraph = {
  // A real line, correctly attributed. Do not replace it with a paraphrase.
  text: "Taking a new step, uttering a new word, is what people fear most.",
  source: "Fyodor Dostoevsky",
  work: "Crime and Punishment",
} as const;

export type Chapter = {
  id: string;
  numeral: string;
  title: string;
  subtitle: string;
  folio: number;
};

/**
 * `folio` is the printed page number where the chapter opens; `page` is its
 * index in the physical leaf order - see buildPages in
 * src/components/pages.tsx. Keep the two in step if you add a page.
 *
 * `image` fills the plate under the entry in the contents. The slot is
 * roughly 2.6:1 landscape at full size - supply 1200x460 or larger.
 */
export const chapters: (Chapter & { page: number; image?: string })[] = [
  {
    id: "notes",
    numeral: "I",
    title: "Note from a Founder",
    subtitle: "About",
    folio: 2,
    page: 8,
    image: "/notes.webp",
  },
  {
    id: "ventures",
    numeral: "II",
    title: "The Ventures",
    subtitle: "Companies and works",
    folio: 3,
    page: 9,
    image: "/ventures.webp",
  },
  {
    id: "apparatus",
    numeral: "III",
    title: "The Apparatus",
    subtitle: "Tools of the trade",
    folio: 5,
    page: 11,
    image: "/apparatus.webp",
  },
  {
    id: "correspondence",
    numeral: "IV",
    title: "Correspondence",
    subtitle: "Contact",
    folio: 7,
    page: 13,
    image: "/correspondence.webp",
  },
];

/* ── Chapter I ─────────────────────────────────────────────────────── */

/**
 * Chapter I is a self-portrait, not a second copy of the CV - the record
 * lives in Chapter II. The claims here are INFERRED from the evidence
 * available (a pen name taken from Dostoevsky, two founding-CTO seats, an
 * Emergent Ventures grant, and a portfolio built as a seventeenth-century
 * book). Written in your voice, but not yet your voice: read it as a draft
 * and cut whatever is not true of you.
 */
export const notes = {
  opening:
    "Most of the difficulty in building something is not the building. It is deciding what the thing is, while everyone waits, with too little information and no way back.",
  body: [
    "The name is codeyevsky, a joke about Dostoevsky that never got retired. It has proved more accurate than intended: his subject was motive, and motive is most of what founding work turns out to be about. Code is the easy half. The hard half is knowing which problem deserves the next six months.",
    "Software is where that judgement gets tested quickly. A system either holds under load or it does not, and conviction has no vote. That is the appeal. It argues back, and it wins whenever it is right.",
    "What matters in a team, then, is a hard problem and people who disagree well. Title, stack and city have all turned out to be negotiable.",
    "As co-founder and CTO of two companies, an Emergent Ventures grantee, and six years into the work, I can say coding was never the job. Solving problems was.",
  ],
  marginalia: [
    "Istanbul. Şişli, when it is not remote.",
    "Two founding-CTO seats since 2025.",
    "The name is a joke that stuck.",
  ],
};

/* ── Chapter II ────────────────────────────────────────────────────── */

export type Venture = {
  name: string;
  role: string;
  period: string;
  span: string;
  location: string;
  /** One line on what the company actually builds. Yours to write. */
  detail?: string;
  blurb: string;
  tags: string[];
  current: boolean;
};

export const ventures: Venture[] = [
  {
    name: "Mercatus Center, George Mason University",
    role: "Emergent Ventures Grantee",
    period: "May 2026 – Present",
    span: "Contract",
    location: "Arlington, Virginia · Remote",
    blurb:
      "Selected for Emergent Ventures, the Mercatus Center's grant programme for founders working on unusually ambitious problems.",
    tags: ["Grant", "Research"],
    current: true,
  },
  {
    name: "SolonGate",
    role: "Co-Founder & CTO",
    period: "Nov 2025 – Present",
    span: "Self-employed",
    location: "Şişli, Istanbul · Hybrid",
    blurb:
      "Co-founded the company. I own the architecture, the first commit, and the decisions that are expensive to reverse.",
    tags: ["Founding", "Architecture", "Product"],
    current: true,
  },
  {
    name: "EraEnvision",
    role: "Co-Founder",
    period: "May 2025 – Present",
    span: "Full-time",
    location: "Remote",
    blurb:
      "Co-founder, involved from formation onward across product and engineering.",
    tags: ["Founding", "Product"],
    current: true,
  },
  {
    name: "Tactiqgen",
    role: "Co-Founder & CTO",
    period: "Nov 2025 – Feb 2026",
    span: "Self-employed",
    location: "Şişli, Istanbul · Remote",
    blurb:
      "Built and led the technical side from zero. Four months from nothing to a working system.",
    tags: ["Founding", "0→1"],
    current: false,
  },
  {
    name: "Dotweber",
    role: "Full-stack Developer",
    period: "Apr 2025 – Feb 2026",
    span: "Full-time",
    location: "Remote",
    blurb:
      "Shipped across the stack in production, interface through to data layer.",
    tags: ["Full-stack", "Production"],
    current: false,
  },
  {
    name: "Healyt",
    role: "Artificial Intelligence Engineer",
    period: "Apr 2024 – Nov 2024",
    span: "Full-time",
    location: "Remote",
    blurb:
      "Applied AI engineering: taking models out of notebooks and into something people could depend on.",
    tags: ["AI", "ML Engineering"],
    current: false,
  },
];

/* ── Chapter III ───────────────────────────────────────────────────── */

export type Work = {
  title: string;
  year: string;
  summary: string;
  tags: string[];
  href?: string;
  /** Leave true until you replace this entry with something real. */
  placeholder?: boolean;
};

/**
 * Public repositories only. The private ones stay private - listing their
 * names on a public page gives away more than it earns.
 */
export const works: Work[] = [
  {
    title: "solongate-audit",
    year: "2026",
    summary:
      "A command-line auditor for AI agent deployments, checking them against the OWASP Agentic Top 10. TypeScript, MIT licensed.",
    tags: ["TypeScript", "Security", "CLI"],
    href: "https://github.com/codeyevsky/solongate-audit",
  },
  {
    title: "trendyol-scrapper",
    year: "2025",
    summary: "A scraper for product comments on Trendyol.",
    tags: ["Python"],
    href: "https://github.com/codeyevsky/trendyol-scrapper",
  },
  {
    title: "yomi",
    year: "2025",
    summary: "Converts images into pixel art.",
    tags: ["Python"],
    href: "https://github.com/codeyevsky/yomi",
  },
];

/* ── Chapter IV ────────────────────────────────────────────────────── */

/** Adjust to what you actually reach for. */
export const apparatus: { group: string; items: string[] }[] = [
  {
    group: "Languages",
    items: ["TypeScript", "JavaScript", "C", "Assembly", "Python"],
  },
  {
    group: "Interface",
    items: ["HTML", "CSS", "Tailwind CSS"],
  },
  {
    group: "Systems",
    items: [
      "Node.js",
      "Redis",
      "Docker",
      "Kubernetes",
      "PostgreSQL",
      "NoSQL",
    ],
  },
  {
    group: "Machine Learning",
    items: ["PyTorch", "TensorFlow", "scikit-learn", "JAX"],
  },
];

/* ── Chapter IV ────────────────────────────────────────────────────── */


/* ── Chapter V ─────────────────────────────────────────────────────── */

/** The three profiles, printed on the title page and again in Chapter V. */
export const profiles = [
  {
    label: "GitHub",
    value: "github.com/codeyevsky",
    href: "https://github.com/codeyevsky",
  },
  {
    label: "Instagram",
    value: "instagram.com/c1n4r.yldrm",
    href: "https://www.instagram.com/c1n4r.yldrm",
  },
  {
    label: "LinkedIn",
    value: "linkedin.com/in/codeyevsky",
    href: "https://www.linkedin.com/in/codeyevsky/",
  },
];

export const correspondence = {
  opening:
    "Write. I answer email from founders and engineers, usually within a day or two.",
  links: [
    { label: "Email", value: author.email, href: `mailto:${author.email}` },
    ...profiles,
  ],
};

/* ── Colophon ──────────────────────────────────────────────────────── */

export const colophon = {
  text: "Set in the Fell types, cut at Oxford in the 1670s, with EB Garamond for the text. Composed in Next.js and printed on demand from Istanbul.",
  year: "MMXXVI",
};
