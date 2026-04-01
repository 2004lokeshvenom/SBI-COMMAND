import next from "eslint-config-next";

/** @type {import("eslint").Linter.Config[]} */
const config = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "dist/**",
      "next-env.d.ts",
    ],
  },
  ...next,
  {
    rules: {
      // Standard client data-fetch / hydration patterns; flagging them is noise in this app
      "react-hooks/set-state-in-effect": "off",
      "import/no-anonymous-default-export": "off",
      "@next/next/no-img-element": "warn",
    },
  },
];

export default config;
