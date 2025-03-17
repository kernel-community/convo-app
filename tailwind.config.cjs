/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      padding: {
        DEFAULT: "1rem",
        sm: "1rem",
        lg: "1rem",
        xl: "12rem",
        "2xl": "12rem",
      },
    },
    borderRadius: {
      xl: "calc(var(--radius) + 2px)",
      lg: "var(--radius)",
      md: "calc(var(--radius) - 2px)",
      sm: "calc(var(--radius) - 4px)",
      full: "9999px",
    },
    extend: {
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          muted: "var(--primary-muted)",
          foreground: "var(--primary-foreground)"
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)"
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          active: "var(--destructive-active)",
          disabled: "var(--destructive-disabled)",
          foreground: "var(--destructive-foreground)"
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)"
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)"
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)"
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          active: "var(--secondary-active)",
          disabled: "var(--secondary-disabled)",
          foreground: "var(--secondary-foreground)",
          muted: "var(--secondary-muted)"
        },
        highlight: {
          DEFAULT: "var(--highlight)",
          active: "var(--highlight-active)",
          disabled: "var(--highlight-disabled)",
          foreground: "var(--highlight-foreground)"
        },
        success: {
          DEFAULT: "var(--success)",
          active: "var(--success-active)",
          disabled: "var(--success-disabled)",
          foreground: "var(--success-foreground)"
        },
        info: {
          DEFAULT: "var(--info)",
          active: "var(--info-active)",
          disabled: "var(--info-disabled)",
          foreground: "var(--info-foreground)"
        },
        warn: {
          DEFAULT: "var(--warn)",
          active: "var(--warn-active)",
          disabled: "var(--warn-disabled)",
          foreground: "var(--warn-foreground)"
        }
      },
      typography: {
        invert: {
          css: {
            "--tw-prose-invert-links": "#c0c0c0",
            "--tw-prose-invert-bold": "#c0c0c0",
            "--tw-prose-invert-headings": "#c0c0c0",
          },
        },
      },
      fontFamily: {
        fancy: ["Licorice", "sans-serif"],
        brand: ["Nephilm", "sans-serif"],
        secondary: ["Lato", "sans-serif"],
        primary: ["Lora", "serif"],
      },
      fontSize: {
        xxs: "0.69rem",
      },
      backgroundSize: {
        "200": "200% 200%",
      },
      boxShadow: {
        dark: "0px 30px 41px rgba(33, 33, 68, 0.24)",
        outline: "rgba(6, 24, 44, 0.4) 0px 0px 0px 2px, rgba(6, 24, 44, 0.65) 0px 4px 6px -1px, rgba(255, 255, 255, 0.08) 0px 1px 0px inset",
      },
      keyframes: {
        shimmer: {
          "100%": {
            transform: "translateX(100%)",
          },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-subtle": {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.85 },
        },
        "gradient-rotate": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-subtle": "pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "gradient-rotate": "gradient-rotate 3s ease infinite",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("tailwindcss-animate"),
  ],
};
