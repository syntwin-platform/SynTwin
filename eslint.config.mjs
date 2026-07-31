import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    files: [
      "lib/demo/**/*.{ts,tsx}",
      "components/demo/**/*.{ts,tsx}",
      "app/dashboard/demo/**/*.{ts,tsx}",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/lib/api",
                "@/lib/api/**",
                "@/lib/company-context",
                "@/hooks/useFleetSnapshot",
                "@/lib/operations",
                "@/lib/operations/**",
              ],
              message:
                "Demo phải dùng dữ liệu cố định và không được nhập API sản phẩm hoặc ngữ cảnh công ty.",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
