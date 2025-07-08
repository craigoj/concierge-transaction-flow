
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { 
    ignores: [
      "dist", 
      "api/", 
      "supabase/functions/", 
      "testing/ui-documentation/",
      "tailwind.config.ts",
      "src/components/__tests__/DashboardStats.enhanced.test.tsx",
      "src/components/__tests__/TransactionCard.enhanced.test.tsx",
      "src/test/__tests__/",
      "src/types/common.ts"
    ] 
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      // Type Safety Rules
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      
      // Code Quality Rules
      "prefer-const": "error",
      "no-case-declarations": "error",
      
      // React Hook Rules
      "react-hooks/exhaustive-deps": "warn",
    },
  }
);
