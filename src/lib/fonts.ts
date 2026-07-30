import { EB_Garamond, IM_Fell_English } from "next/font/google";

/**
 * The Fell types were cut in the 1670s and given to Oxford University Press
 * by Bishop John Fell. Their digital revival keeps every wobble, ink trap
 * and broken serif of the originals - so the "handmade" look is in the
 * letterforms themselves rather than painted on afterwards.
 *
 * Coverage warning: IM Fell carries Latin-1 plus U+0131 (ı), but NOT
 * U+015F (ş) or U+011F (ğ). EB Garamond sits behind it in every stack and
 * picks those up per glyph.
 */
export const display = IM_Fell_English({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-fell",
});

/** The text face: readable at length, and the fallback for Turkish glyphs. */
export const serif = EB_Garamond({
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-eb",
});
