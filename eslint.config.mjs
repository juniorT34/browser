import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    files: ["**/*.{js,ts,jsx,tsx}"],
    ignores: [
      ".next/",
      "dist/",
      "node_modules/",
      "lib/generated/",
      "prisma/generated/"
    ],
    rules: {
      // ✅ Allow unused vars if they start with `_`
      "@typescript-eslint/no-unused-vars": [
        "warn", // or "off" to completely disable
        {
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
