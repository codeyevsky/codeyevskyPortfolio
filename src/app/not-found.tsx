import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leaf not bound",
};

export default function NotFound() {
  return (
    <div className="stage">
      <div
        className="volume is-single"
        style={{ transform: "none", aspectRatio: "0.72" }}
      >
        <div className="face recto" style={{ transform: "none" }}>
          <div className="paper">
            <div
              className="page-inner"
              style={{ justifyContent: "center", textAlign: "center" }}
            >
              <p className="smallcaps" style={{ color: "var(--rubric)" }}>
                Errata
              </p>

              <h1
                style={{
                  marginTop: "3cqh",
                  fontSize: "clamp(1.4rem, 8cqw, 2.4rem)",
                  lineHeight: 1.06,
                  fontWeight: 500,
                }}
              >
                This leaf was
                <br />
                never bound
              </h1>

              <div className="ornament" style={{ margin: "4cqh 0" }}>
                <span style={{ color: "var(--rubric)" }}>✻</span>
              </div>

              <p
                style={{
                  fontStyle: "italic",
                  color: "var(--ink-soft)",
                  fontSize: "clamp(0.8rem, 3cqw, 1rem)",
                }}
              >
                The page you asked for is not in this edition.
              </p>

              <p style={{ marginTop: "5cqh" }}>
                <a
                  href="/"
                  className="smallcaps"
                  style={{ color: "var(--rubric)" }}
                >
                  Return to the front board
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
