import type { Config } from "tailwindcss";

// Mesmas cores do site PHP: azul #007BFF, laranja #FF8C00, fundo #050b14.
// As classes arbitrárias (bg-[#050b14], text-[#007BFF]...) foram mantidas
// iguais ao index.php pra facilitar a comparação lado a lado.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["var(--font-inter)", "Inter", "sans-serif"] },
      colors: { brand: { blue: "#007BFF", orange: "#FF8C00", bg: "#050b14" } },
    },
  },
  plugins: [],
};
export default config;
