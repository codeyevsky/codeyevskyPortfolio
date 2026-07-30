import Image from "next/image";
import type { ReactNode } from "react";
import {
  apparatus,
  author,
  chapters,
  colophon,
  correspondence,
  epigraph,
  notes,
  profiles,
  site,
  ventures,
  works,
} from "@/content/site";

export type PageDef = {
  id: string;
  /** Announced to screen readers and shown in the reader's page counter. */
  label: string;
  node: ReactNode;
  /** Cloth, not paper. On the scroll these become the rolled-up state. */
  board?: boolean;
};

/** Cycles the twelve separately drawn rules so no two lines repeat. */
const hr = (n: number, top = false) =>
  `${top ? "hr-top " : ""}hr-${(n % 12) + 1}`;

/* ─── the furniture every printed page carries ────────────────────── */

function Sheet({
  head,
  folio,
  children,
  justified = false,
  bodyStyle,
}: {
  head?: string;
  folio?: string | number;
  children: ReactNode;
  justified?: boolean;
  bodyStyle?: React.CSSProperties;
}) {
  return (
    <div className="paper">
      <div className="page-inner">
        {head !== undefined && (
          <div className="running-head">
            <span className="smallcaps">{head}</span>
            <span className="smallcaps">{site.title}</span>
          </div>
        )}
        <div
          className={`page-body ${justified ? "justified" : ""}`}
          style={bodyStyle}
        >
          {children}
        </div>
        {folio !== undefined && (
          <div className="folio">
            <span className="smallcaps">{folio}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/** Plain cloth: a board with nothing stamped on it. */
function Board() {
  return <div className="board" />;
}

/** A tipped-in plate: a drawn fillet outside, a heavy rule on the image. */
function Plate({
  src,
  alt,
  ratio,
  folio,
  framed = true,
}: {
  src: string;
  alt: string;
  ratio: string;
  folio?: string | number;
  /** Off for images that already carry a border of their own. */
  framed?: boolean;
}) {
  const image = (
    <div
      className={`plate-image plate-image-mini${framed ? " plate-image-ruled" : ""}`}
      style={{ aspectRatio: ratio }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 900px) 70vw, 32vw"
        style={{ objectFit: "cover" }}
        draggable={false}
      />
    </div>
  );

  return (
    <div className="paper">
      <div
        className="page-inner plate-page"
        style={{ justifyContent: "center", alignItems: "center" }}
      >
        <figure className="plate">
          {framed ? <div className="plate-frame">{image}</div> : image}
        </figure>
        {folio !== undefined && (
          <div className="folio" style={{ marginTop: 0, width: "100%" }}>
            <span className="smallcaps">{folio}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/** The GitHub mark, struck in ink beside anything that links to a repo. */
function GithubMark() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="1em"
      height="1em"
      aria-hidden="true"
      focusable="false"
      style={{ flexShrink: 0, fill: "currentColor", opacity: 0.85 }}
    >
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

function ChapterOpening({
  index,
  compact = false,
}: {
  index: number;
  compact?: boolean;
}) {
  const chapter = chapters[index];
  return (
    <>
      <p className="smallcaps" style={{ color: "var(--rubric)" }}>
        Chapter {chapter.numeral}
      </p>
      <h2
        className="chapter-title"
        style={{ marginTop: compact ? "1cqh" : "1.6cqh" }}
      >
        {chapter.title}
      </h2>
      <div
        className="ornament"
        style={{
          marginTop: compact ? "1.4cqh" : "2.2cqh",
          marginBottom: compact ? "2.2cqh" : "3.4cqh",
        }}
      >
        <span className="smallcaps">{chapter.subtitle}</span>
      </div>
    </>
  );
}

/**
 * One contents entry, with an equal share of the leaf beneath it for a
 * plate. Both entries on a page get the same remaining height, whatever
 * the screen size - see `flex: 1` on the slot.
 */
function ContentsEntry({
  index,
  rule,
  go,
}: {
  index: number;
  rule: number;
  go: (pageIndex: number) => void;
}) {
  const chapter = chapters[index];
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      <button
        type="button"
        onClick={() => go(chapter.page)}
        className={hr(rule)}
        style={{
          display: "flex",
          alignItems: "baseline",
          width: "100%",
          padding: "0 0 1.4cqh",
          background: "none",
          cursor: "pointer",
          textAlign: "left",
          color: "inherit",
          font: "inherit",
        }}
      >
        <span
          className="smallcaps"
          style={{ width: "2.8em", flexShrink: 0, color: "var(--rubric)" }}
        >
          {chapter.numeral}
        </span>
        <span style={{ minWidth: 0 }}>
          <span style={{ display: "block", lineHeight: 1.2 }}>
            {chapter.title}
          </span>
          <span
            className="smallcaps"
            style={{ display: "block", marginTop: "0.4cqh" }}
          >
            {chapter.subtitle}
          </span>
        </span>
        <span className="leader" aria-hidden="true" />
        <span className="smallcaps" style={{ flexShrink: 0 }}>
          {chapter.folio}
        </span>
      </button>

      <figure className="toc-plate" style={{ flex: 1 }}>
        {chapter.image ? (
          <Image
            src={chapter.image}
            alt=""
            fill
            sizes="(max-width: 900px) 70vw, 26vw"
            style={{ objectFit: "cover" }}
            draggable={false}
          />
        ) : null}
      </figure>
    </div>
  );
}

/* ─── the leaves, in the order they are bound ─────────────────────── */

export function buildPages(go: (pageIndex: number) => void): PageDef[] {
  return [
    /* 0 - the front board */
    {
      id: "cover",
      label: "Front board",
      board: true,
      node: (
        <div className="board">
          <div
            className="page-inner"
            style={{ alignItems: "center", justifyContent: "center" }}
          >
            <div
              className="gilt-rule"
              style={{
                position: "absolute",
                inset: "5cqh 5cqw",
                border: "1px solid",
                borderRadius: 2,
              }}
              aria-hidden="true"
            />
            <div
              className="gilt-rule"
              style={{
                position: "absolute",
                inset: "6.6cqh 6.4cqw",
                border: "3px double",
                borderRadius: 1,
                opacity: 0.5,
              }}
              aria-hidden="true"
            />

            <div
              style={{
                margin: "auto",
                textAlign: "center",
                position: "relative",
                zIndex: 2,
              }}
            >
              <p
                className="smallcaps gilt"
                style={{ opacity: 0.85, marginBottom: "4cqh" }}
              >
                {site.tagline}
              </p>

              <h1
                className="gilt"
                style={{
                  fontSize: "clamp(1.7rem, 11cqw, 4.6rem)",
                  lineHeight: 0.94,
                  letterSpacing: "-0.02em",
                }}
              >
                {site.title}
              </h1>

              <div
                className="gilt-rule"
                style={{
                  width: "42%",
                  margin: "5cqh auto",
                  borderTop: "1px solid",
                }}
                aria-hidden="true"
              />

              <p
                className="gilt"
                style={{
                  fontSize: "clamp(0.7rem, 3.4cqw, 1.15rem)",
                  letterSpacing: "0.05em",
                  opacity: 0.92,
                }}
              >
                {author.name}
              </p>

              <p
                className="smallcaps gilt"
                style={{ marginTop: "2.6cqh", opacity: 0.7 }}
              >
                {colophon.year}
              </p>
            </div>
          </div>
        </div>
      ),
    },

    /* 1 - the inside of the front board: the cover, lying open on the left */
    {
      id: "cover-inside",
      label: "Front board, inside",
      board: true,
      node: <Board />,
    },

    /* 2 - the epigraph, standing alone as it does in a book */
    {
      id: "epigraph",
      label: "Epigraph",
      node: (
        <Sheet folio="i">
          <div className="centred">
            <blockquote
              style={{
                fontStyle: "italic",
                fontSize: "clamp(0.85rem, 3.6cqw, 1.3rem)",
                lineHeight: 1.55,
                color: "var(--ink-soft)",
              }}
            >
              “{epigraph.text}”
            </blockquote>
            <p className="smallcaps" style={{ marginTop: "3.4cqh" }}>
              {epigraph.source}
            </p>
            <p
              className="smallcaps"
              style={{ marginTop: "0.8cqh", opacity: 0.75 }}
            >
              {epigraph.work}
            </p>
          </div>
        </Sheet>
      ),
    },

    /* 3 - the title page */
    {
      id: "title",
      label: "Title page",
      node: (
        <Sheet folio="ii">
          <div className="centred">
            <h2
              style={{
                fontSize: "clamp(1.6rem, 10cqw, 3.8rem)",
                lineHeight: 0.96,
                letterSpacing: "-0.025em",
              }}
            >
              {site.title}
            </h2>

            <div
              className="ornament"
              style={{ marginTop: "3.4cqh", marginBottom: "3.4cqh" }}
            >
              <span style={{ color: "var(--rubric)" }}>✻</span>
            </div>

            <p style={{ fontSize: "clamp(0.8rem, 3.4cqw, 1.2rem)" }}>
              {author.name}
            </p>
            <p className="smallcaps" style={{ marginTop: "1.6cqh" }}>
              {author.role}
            </p>
            <p
              className="smallcaps"
              style={{ marginTop: "0.7cqh", opacity: 0.8 }}
            >
              {author.location}
            </p>

            <div className="ornament" style={{ marginTop: "4.4cqh" }}>
              <span style={{ color: "var(--rubric)" }}>✻</span>
            </div>

            <ul
              style={{
                listStyle: "none",
                margin: "3.6cqh 0 0",
                padding: 0,
                display: "flex",
                flexDirection: "column",
                gap: "1.5cqh",
              }}
            >
              {profiles.map((profile) => (
                <li key={profile.label}>
                  <a
                    className="smallcaps"
                    href={profile.href}
                    draggable={false}
                    target="_blank"
                    rel="noreferrer noopener"
                    style={{ color: "var(--rubric)", textDecoration: "none" }}
                  >
                    {profile.value}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </Sheet>
      ),
    },

    /* 4 - the plate, tipped in facing the title */
    {
      id: "portrait",
      label: "Frontispiece",
      node: (
        <div className="paper">
          <div
            className="page-inner plate-page"
            style={{ justifyContent: "center", alignItems: "center" }}
          >
            <figure className="plate">
              <div className="plate-mount">
                <div className="plate-image">
                  <Image
                    src="/plate.webp"
                    alt={`Painted portrait of ${author.name}`}
                    fill
                    sizes="(max-width: 900px) 70vw, 32vw"
                    style={{ objectFit: "cover" }}
                    draggable={false}
                    priority
                  />
                </div>
              </div>
            </figure>
            <div className="folio" style={{ marginTop: 0, width: "100%" }}>
              <span className="smallcaps">iii</span>
            </div>
          </div>
        </div>
      ),
    },

    /* 5 - contents, first half */
    {
      id: "contents-a",
      label: "Contents",
      node: (
        <Sheet
          head="Contents"
          folio="iv"
          bodyStyle={{ display: "flex", flexDirection: "column", gap: "3cqh" }}
        >
          <ContentsEntry index={0} rule={0} go={go} />
          <ContentsEntry index={1} rule={4} go={go} />
        </Sheet>
      ),
    },

    /* 6 - contents, second half */
    {
      id: "contents-b",
      label: "Contents, continued",
      node: (
        <Sheet
          head="Contents"
          folio="v"
          bodyStyle={{ display: "flex", flexDirection: "column", gap: "3cqh" }}
        >
          <ContentsEntry index={2} rule={7} go={go} />
          <ContentsEntry index={3} rule={10} go={go} />
        </Sheet>
      ),
    },

    /* 7 - the miniature, facing the opening of Chapter I */
    {
      id: "miniature",
      label: "Plate",
      node: (
        <Plate
          src="/miniature.webp"
          alt="An Ottoman miniature of a young man riding a donkey"
          ratio="1082 / 1454"
          folio={1}
        />
      ),
    },

    /* 8 - Chapter I, entire */
    {
      id: "notes",
      label: "Chapter I · Note from a Founder",
      node: (
        <Sheet head="Note from a Founder" folio={2} justified>
          <ChapterOpening index={0} />
          <p className="dropcap">{notes.opening}</p>
          {notes.body.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </Sheet>
      ),
    },

    /* 9 - Chapter II: the companies, all on one leaf */
    {
      id: "ventures",
      label: "Chapter II · The Ventures",
      node: (
        <Sheet head="The Ventures" folio={3}>
          <ChapterOpening index={1} compact />
          <VentureList />
        </Sheet>
      ),
    },

    /* 10 - Chapter II: the works, facing them */
    {
      id: "works",
      label: "Chapter II · Works",
      node: (
        <Sheet head="The Ventures" folio={4}>
          <div className="ornament" style={{ marginBottom: "3.4cqh" }}>
            <span className="smallcaps">Works</span>
          </div>

          {works.length === 0 ? (
            <p style={{ fontStyle: "italic", color: "var(--ink-soft)" }}>
              This section is still at the compositor.
            </p>
          ) : (
            <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {works.map((work, i) => (
                <li
                  key={work.title}
                  className={hr(i + 2)}
                  style={{ marginBottom: "3cqh" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: "0.8em",
                    }}
                  >
                    <h3 style={{ flex: 1, lineHeight: 1.2 }}>
                      {work.href ? (
                        <a
                          href={work.href}
                          draggable={false}
                          target="_blank"
                          rel="noreferrer noopener"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.42em",
                            color: "inherit",
                            textDecoration: "none",
                          }}
                        >
                          <GithubMark />
                          {work.title}
                        </a>
                      ) : (
                        work.title
                      )}
                    </h3>
                    <span className="smallcaps">{work.year}</span>
                  </div>

                  <p style={{ margin: "1cqh 0", color: "var(--ink-soft)" }}>
                    {work.summary}
                  </p>

                  <p
                    className="smallcaps"
                    style={{ marginBottom: "2.4cqh", opacity: 0.8 }}
                  >
                    {work.tags.join(" · ")}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </Sheet>
      ),
    },

    /* 11 - Chapter III */
    {
      id: "apparatus",
      label: "Chapter III · The Apparatus",
      node: (
        <Sheet head="The Apparatus" folio={5}>
          <ChapterOpening index={2} />
          <dl style={{ margin: 0 }}>
            {apparatus.map((group, i) => (
              <div key={group.group} style={{ marginBottom: "2.6cqh" }}>
                <dt
                  className={`smallcaps ${hr(i + 6)}`}
                  style={{ color: "var(--rubric)" }}
                >
                  {group.group}
                </dt>
                <dd style={{ margin: "1.2cqh 0 0", color: "var(--ink-soft)" }}>
                  {group.items.join(" · ")}
                </dd>
              </div>
            ))}
          </dl>
        </Sheet>
      ),
    },

    /* 12 - the mosaic, facing the Apparatus */
    {
      id: "mosaic",
      label: "Plate",
      node: (
        <Plate
          src="/mosaic.webp"
          alt="A mosaic of a kneeling figure before the marks of several programming languages"
          ratio="1085 / 1449"
          folio={6}
          framed={false}
        />
      ),
    },

    /* 13 - Chapter IV */
    {
      id: "correspondence",
      label: "Chapter IV · Correspondence",
      node: (
        <Sheet head="Correspondence" folio={7}>
          <ChapterOpening index={3} />
          <p className="dropcap">{correspondence.opening}</p>

          <ul style={{ listStyle: "none", margin: "3cqh 0 0", padding: 0 }}>
            {correspondence.links.map((link, i) => (
              <li key={link.label} className={hr(i + 3, true)}>
                <a
                  href={link.href}
                  draggable={false}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    link.href.startsWith("http")
                      ? "noreferrer noopener"
                      : undefined
                  }
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "0.9em",
                    padding: "1.9cqh 0",
                    color: "inherit",
                    textDecoration: "none",
                  }}
                >
                  <span
                    className="smallcaps"
                    style={{ width: "5.4em", flexShrink: 0 }}
                  >
                    {link.label}
                  </span>
                  <span
                    style={{
                      flex: 1,
                      minWidth: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      color: "var(--rubric)",
                    }}
                  >
                    {link.value}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Sheet>
      ),
    },

    /* 14 - the inside of the back board */
    {
      id: "back-cover-inside",
      label: "Back board, inside",
      board: true,
      node: <Board />,
    },

    /* 15 - the outside of the back board, seen once the volume is shut */
    {
      id: "back-cover",
      label: "Back board",
      board: true,
      node: (
        <div className="board">
          <div
            className="page-inner"
            style={{ alignItems: "center", justifyContent: "center" }}
          >
            <p
              className="gilt"
              style={{
                margin: "auto",
                textAlign: "center",
                fontStyle: "italic",
                /* Sized off the leaf width so the line never breaks. */
                fontSize: "clamp(0.5rem, 3.6cqw, 1.25rem)",
                whiteSpace: "nowrap",
                opacity: 0.82,
              }}
            >
              You must be pretty desperate to hire me :)
            </p>
          </div>
        </div>
      ),
    },
  ];
}

function VentureList() {
  return (
    <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
      {ventures.map((venture, i) => (
        <li
          key={venture.name}
          className={hr(i * 3 + 1)}
          style={{ marginBottom: "1.3cqh" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "0.6em",
              flexWrap: "wrap",
            }}
          >
            <h3 style={{ flex: 1, lineHeight: 1.2 }}>{venture.name}</h3>
            {venture.current && (
              <span className="smallcaps" style={{ color: "var(--rubric)" }}>
                Current
              </span>
            )}
          </div>

          <p className="smallcaps" style={{ margin: "0.4cqh 0 1.1cqh" }}>
            {venture.role} · {venture.period}
          </p>
        </li>
      ))}
    </ol>
  );
}
