import type { Metadata, Viewport } from "next";
import { author, site } from "@/content/site";
import { display, serif } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.title} · ${author.name}`,
    template: `%s · ${site.title}`,
  },
  description: site.description,
  applicationName: site.title,
  authors: [{ name: author.name }],
  creator: author.name,
  keywords: [
    "Çınar Yıldırım",
    "codeyevsky",
    "founder",
    "CTO",
    "software engineer",
    "AI engineer",
    "Istanbul",
    "SolonGate",
    "Emergent Ventures",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: site.url,
    siteName: site.title,
    title: `${site.title} · ${author.name}`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.title} · ${author.name}`,
    description: site.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#1c1611",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${serif.variable} ${display.variable}`}
    >
      <body className="antialiased">
        {/* The press. Every printed mark is displaced through this, so no
            rule is truly straight and no letter sits perfectly on its line. */}
        <svg
          aria-hidden="true"
          focusable="false"
          style={{
            position: "absolute",
            width: 0,
            height: 0,
            overflow: "hidden",
          }}
        >
          <defs>
            <filter
              id="handmade"
              x="-3%"
              y="-3%"
              width="106%"
              height="106%"
              colorInterpolationFilters="sRGB"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.78"
                numOctaves="2"
                seed="11"
                result="grain"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="grain"
                scale="1.15"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>

        {children}
      </body>
    </html>
  );
}
