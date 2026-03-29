/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./applied-ai/**/*.html", "./research/**/*.html", "./src/**/*.js"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        surface: "hsl(var(--surface))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        border: "hsl(var(--border))",
        accent: "hsl(var(--accent))"
      },
      fontFamily: {
        sans: ['"Geist"', '"Avenir Next"', '"Helvetica Neue"', "Helvetica", "Arial", "sans-serif"],
        mono: ['"Geist Mono"', '"SFMono-Regular"', "Menlo", "Monaco", "Consolas", '"Liberation Mono"', "monospace"]
      }
    }
  },
  plugins: []
};
