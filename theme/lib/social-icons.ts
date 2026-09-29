/**
 * Inline SVG markup for social links that Rspress ships no preset icon for.
 *
 * Values are injected verbatim as innerHTML by the theme's `SocialLink`
 * component, so each must be a complete `<svg>` element. Match the shape
 * Rspress uses for its presets so the icons sit consistently in the nav bar:
 *
 *   <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 24 24">
 *     <path fill="currentColor" d="…" />
 *   </svg>
 *
 * `width="100%"` lets the nav bar size the glyph; the viewBox carries the
 * aspect ratio, so keep whatever coordinate system the source artwork uses.
 * `fill="currentColor"` is essential — the presets all set it, and without it
 * a path defaults to solid black and disappears in dark mode.
 *
 * Rspress's built-in set covers Weibo, Bilibili, Zhihu, Juejin, QQ and WeChat,
 * but not Douyin. Adding such an icon to the preset registry is not possible
 * from userland — `getSocialIcons` throws on any name it does not recognise —
 * so a literal SVG string is the supported route.
 */

/**
 * Official Douyin mark.
 *
 * The source artwork is authored on a 1024×1024 grid and fills it exactly
 * (the glyph runs from y=0 to y=1024), so the viewBox is carried through
 * unchanged. Editor attributes from the export (`t`, `class`, `version`,
 * `p-id`, the fixed pixel `width`/`height`) have been dropped; `width="100%"`
 * and `fill="currentColor"` are set here instead.
 */
export const DOUYIN_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 1024 1024"><path fill="currentColor" d="M937.4 423.9c-84 0-165.7-27.3-232.9-77.8v352.3c0 179.9-138.6 325.6-309.6 325.6S85.3 878.3 85.3 698.4c0-179.9 138.6-325.6 309.6-325.6 17.1 0 33.7 1.5 49.9 4.3v186.6c-15.5-6.1-32-9.2-48.6-9.2-76.3 0-138.2 65-138.2 145.3 0 80.2 61.9 145.3 138.2 145.3 76.2 0 138.1-65.1 138.1-145.3V0H707c0 134.5 103.7 243.5 231.6 243.5v180.3l-1.2 0.1"/></svg>`
