import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Typography guard: sizes, line-heights, tracking and font families live in
  // panda.config.ts (`textStyles` / `fonts`) and are applied with
  // `textStyle: "<role>"`. Setting them per component is what let the site
  // drift to 70 font sizes; see TYPOGRAPHY.md. `lineHeight: 1` stays allowed
  // for icon-only controls. The website-v2 spike is exempt (throwaway).
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/app/website-v2/**"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "Property[key.name='fontSize'], Property[key.value='fontSize']",
          message: "Use `textStyle: \"<role>\"` instead of fontSize (roles are in panda.config.ts textStyles; see TYPOGRAPHY.md).",
        },
        {
          selector: "Property[key.name='lineHeight']:not([value.value=1])",
          message: "Line height comes from the textStyle role; do not set it per component (TYPOGRAPHY.md).",
        },
        {
          selector: "Property[key.name='letterSpacing']",
          message: "Tracking comes from the textStyle role (use `textStyle: \"eyebrow\"` for uppercase labels); do not set it per component (TYPOGRAPHY.md).",
        },
        {
          selector: "Property[key.name='fontFamily']",
          message: "The site has one font, set in src/app/layout.tsx and inherited everywhere; for aligned figures use `fontVariantNumeric: \"tabular-nums\"` (TYPOGRAPHY.md).",
        },
        // The same four as styled-system/jsx props: <Box fontSize="15px">.
        {
          selector: "JSXAttribute[name.name=/^(fontSize|lineHeight|letterSpacing|fontFamily)$/]",
          message: "Use `textStyle=\"<role>\"` on styled-system/jsx elements instead of fontSize / lineHeight / letterSpacing / fontFamily (TYPOGRAPHY.md).",
        },
      ],
    },
  },
]);

export default eslintConfig;
