import Image from "next/image";

const ventures = [
  {
    name: "SolonGate",
    role: "Co-Founder & CTO",
    period: "Nov 2025 – Present",
  },
  {
    name: "Mercatus Center, GMU",
    role: "Emergent Ventures Grantee",
    period: "May 2026 – Present",
  },
  {
    name: "EraEnvision",
    role: "Co-Founder",
    period: "May 2025 – Present",
  },
  {
    name: "Dotweber",
    role: "Full-stack Developer",
    period: "Apr 2025 – Feb 2026",
  },
  {
    name: "Healyt",
    role: "AI Engineer",
    period: "Apr 2024 – Nov 2024",
  },
];

const repos = [
  "solongate/agent-security",
  "solongate/psirtmap",
  "solongate/solongate-audit",
];

type Repo = {
  full_name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
};

const languageColors: Record<string, string> = {
  Go: "#00ADD8",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  C: "#555555",
  JavaScript: "#f1e05a",
};

async function getRepos(): Promise<Repo[]> {
  const results = await Promise.all(
    repos.map(async (name) => {
      try {
        const res = await fetch(`https://api.github.com/repos/${name}`, {
          next: { revalidate: 3600 },
        });
        if (!res.ok) return null;
        return (await res.json()) as Repo;
      } catch {
        return null;
      }
    }),
  );
  return results.filter((r): r is Repo => r !== null);
}

async function getNpmPackage(): Promise<{
  name: string;
  description: string;
  version: string;
  downloads: number;
} | null> {
  try {
    const [meta, dl] = await Promise.all([
      fetch("https://registry.npmjs.org/@solongate/proxy/latest", {
        next: { revalidate: 3600 },
      }).then((r) => (r.ok ? r.json() : null)),
      fetch(
        "https://api.npmjs.org/downloads/point/last-week/@solongate/proxy",
        { next: { revalidate: 3600 } },
      ).then((r) => (r.ok ? r.json() : null)),
    ]);
    if (!meta) return null;
    return {
      name: "@solongate/proxy",
      description: meta.description ?? "",
      version: meta.version ?? "",
      downloads: dl?.downloads ?? 0,
    };
  } catch {
    return null;
  }
}

export default async function Home() {
  const [pinned, npmPkg] = await Promise.all([getRepos(), getNpmPackage()]);
  return (
    <main className="flex min-h-screen flex-col">
      {/* about */}
      <section className="mx-auto grid w-full max-w-5xl items-center gap-12 px-8 py-20 md:grid-cols-2">
        <div className="relative flex justify-center">
          <svg
            viewBox="-30 -20 270 250"
            className="absolute top-[38%] left-1/2 -z-10 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 opacity-40"
            aria-hidden
          >
            <path
              fill="#6b6b6b"
              d="M137.2,127.0 L141.1,179.5 Q108.9,122.9 108.5,131.7 L89.4,203.2 Q91.4,130.6 81.8,138.2 L26.5,160.0 Q78.8,112.1 69.5,111.2 L-6.3,109.9 Q77.6,97.4 71.6,90.3 L28.3,19.3 Q79.8,70.7 78.1,57.9 L76.9,17.7 Q94.9,74.9 95.8,66.1 L123.9,9.4 Q108.7,75.8 114.4,68.9 L177.7,43.4 Q132.7,82.2 146.4,82.3 L221.1,88.3 Q135.4,103.2 145.7,112.9 L194.8,166.3 Q118.3,119.6 118.4,130.7 L158.1,170.6 Q125.1,123.6 137.2,127.0 Z"
            />
          </svg>
          <Image
            src="/portrait.png"
            alt="Çınar Yıldırım"
            width={280}
            height={368}
          />
        </div>

        <div className="space-y-6">
          <h2 className="inline-block bg-neutral-100 px-3 py-1 text-2xl font-semibold text-neutral-900">
            Hi. I&apos;m Codeyevsky
          </h2>
          <p className="text-lg leading-relaxed text-neutral-200">
            I&apos;m Çınar &quot;Sycamore&quot; Yıldırım, Co-founder of{" "}
            <a
              href="https://solongate.org/"
              className="underline underline-offset-4 transition-opacity hover:opacity-70"
            >
              SolonGate
            </a>{" "}
            and{" "}
            <a
              href="https://solongate.org/"
              className="underline underline-offset-4 transition-opacity hover:opacity-70"
            >
              Solongate Organization
            </a>{" "}
            and an{" "}
            <a
              href="https://www.mercatus.org/emergent-ventures"
              className="underline underline-offset-4 transition-opacity hover:opacity-70"
            >
              Emergent Ventures
            </a>{" "}
            grantee.
          </p>
          <p className="text-lg leading-relaxed text-neutral-200">
            I do work on AI Safety as a researcher and AI Agent Security as a
            engineer. I do have{" "}
            <a
              href="https://github.com/solongate"
              className="underline underline-offset-4 transition-opacity hover:opacity-70"
            >
              repos 1K+ stars
            </a>{" "}
            and{" "}
            <a
              href="https://www.npmjs.com/package/@solongate/proxy"
              className="underline underline-offset-4 transition-opacity hover:opacity-70"
            >
              npm packages
            </a>{" "}
            500k+ downloads.
          </p>
          <p className="text-lg leading-relaxed text-neutral-200">
            Say hi:{" "}
            <a
              href="mailto:cinar@solongate.com"
              className="underline underline-offset-4 transition-opacity hover:opacity-70"
            >
              cinar@solongate.com
            </a>
          </p>
        </div>
      </section>


      {/* ventures */}
      <section className="mx-auto w-full max-w-5xl px-8 py-20">
        <h2 className="mb-10 inline-block bg-neutral-100 px-3 py-1 text-2xl font-semibold text-neutral-900">
          Experience
        </h2>
        <ul className="divide-y divide-neutral-500/30">
          {ventures.map((v) => (
            <li
              key={v.name}
              className="flex flex-col gap-1 py-4 md:flex-row md:items-baseline md:justify-between"
            >
              <span className="text-lg text-neutral-100">{v.name}</span>
              <span className="text-sm text-neutral-400">
                {v.role} · {v.period}
              </span>
            </li>
          ))}
        </ul>
      </section>


      {/* works */}
      <section className="mx-auto w-full max-w-5xl px-8 py-20">
        <h2 className="mb-10 inline-block bg-neutral-100 px-3 py-1 text-2xl font-semibold text-neutral-900">
          Things I&apos;ve built
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {pinned.map((r) => (
            <a
              key={r.full_name}
              href={r.html_url}
              className="flex flex-col gap-2 border border-neutral-500/30 p-5 transition-colors hover:border-neutral-300"
            >
              <div className="text-lg text-neutral-100">{r.full_name}</div>
              <div className="flex-1 text-sm text-neutral-400">
                {r.description}
              </div>
              <div className="flex items-center gap-5 text-xs text-neutral-400">
                {r.language && (
                  <span className="flex items-center gap-1.5">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{
                        background: languageColors[r.language] ?? "#8a8a8a",
                      }}
                    />
                    {r.language}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                    <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25z" />
                  </svg>
                  {r.stargazers_count}
                </span>
                {r.forks_count > 0 && (
                  <span className="flex items-center gap-1">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                      <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0zM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0z" />
                    </svg>
                    {r.forks_count}
                  </span>
                )}
              </div>
            </a>
          ))}
          {npmPkg && (
            <a
              href="https://www.npmjs.com/package/@solongate/proxy"
              className="flex flex-col gap-2 border border-neutral-500/30 p-5 transition-colors hover:border-neutral-300"
            >
              <div className="text-lg text-neutral-100">{npmPkg.name}</div>
              <div className="flex-1 text-sm text-neutral-400">
                {npmPkg.description}
              </div>
              <div className="flex items-center gap-5 text-xs text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <span className="bg-neutral-100 px-1 text-[10px] font-bold text-neutral-900">
                    npm
                  </span>
                  v{npmPkg.version}
                </span>
                <span className="flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                    <path d="M7.25 1.75a.75.75 0 0 1 1.5 0v6.69l2.22-2.22a.75.75 0 1 1 1.06 1.06l-3.5 3.5a.75.75 0 0 1-1.06 0l-3.5-3.5a.75.75 0 0 1 1.06-1.06l2.22 2.22V1.75zM2.5 12.25a.75.75 0 0 1 .75.75v.5h9.5v-.5a.75.75 0 0 1 1.5 0v1.25a.75.75 0 0 1-.75.75H2.75a.75.75 0 0 1-.75-.75V13a.75.75 0 0 1 .5-.75z" />
                  </svg>
                  {npmPkg.downloads.toLocaleString("en-US")}/week
                </span>
              </div>
            </a>
          )}
        </div>
        <a
          href="https://github.com/codeyevsky"
          className="mt-8 inline-block text-sm text-neutral-300 underline underline-offset-4 transition-opacity hover:opacity-70"
        >
          More on GitHub →
        </a>
      </section>

      {/* footer */}
      <footer className="flex items-center justify-center gap-6 py-8 text-neutral-400">
        <a href="https://github.com/codeyevsky" aria-label="GitHub" className="transition-opacity hover:opacity-70">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.78 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.04.77 2.1 0 1.52-.01 2.74-.01 3.11 0 .31.2.68.8.56A10.52 10.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
          </svg>
        </a>
        <a href="https://www.linkedin.com/in/codeyevsky/" aria-label="LinkedIn" className="transition-opacity hover:opacity-70">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57v11.45z" />
          </svg>
        </a>
        <a href="https://www.instagram.com/codeyevsky" aria-label="Instagram" className="transition-opacity hover:opacity-70">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
          </svg>
        </a>
        <a href="mailto:cinar@solongate.com" aria-label="Email" className="transition-opacity hover:opacity-70">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
            <path d="m3.5 6.5 8.5 7 8.5-7" />
          </svg>
        </a>
      </footer>
    </main>
  );
}
