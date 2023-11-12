import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  daisyui: {
    logs: false,
    darkTheme: "dark",
    themes: [
      "light",
      "dark",
      "acid",
      "halloween",
      "valentine",
      "forest",
      "aqua",
      "pastel",
      "dracula",
    ],
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
} satisfies Config;
