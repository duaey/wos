import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ice: "#7dd3fc",
        frost: "#0f172a",
      },
    },
  },
  plugins: [],
};

export default config;
