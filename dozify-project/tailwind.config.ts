import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      boxShadow: { card: "0 8px 30px rgba(14, 116, 144, 0.09)" },
    },
  },
  plugins: [],
};

export default config;
