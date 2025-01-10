/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        transparent: "transparent",
        black: "#000",
        white: "#fff",
        kernel: {
          DEFAULT: "#212144",
          light: "#6666D1",
          bright: "#3838B4",
        },
        primary: {
          DEFAULT: "#1e293b",
          muted: "#cbd5e1",
          light: "#f1f5f9",
          lighter: "#D4E4E6",
          // TOCONFIRM: changed from #b0b0b0
          dark: "#c0c0c0",
        },
        secondary: {
          DEFAULT: "#02E2AC",
          light: "#87E4DB",
        },
        highlight: "#CBF0C1",
        fill:{
          dark:"#303a47"
        },
        skin: {
          muted: "#FAFCFC",
          DEFAULT: "#E5EEEF",
        },
        card: {
          one: "#212144",
          two: "#3838B4",
        },
        warn: "#EF6262",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // primary: {
        //   DEFAULT: "hsl(var(--primary))",
        //   foreground: "hsl(var(--primary-foreground))",
        // },
        // secondary: {
        //   DEFAULT: "hsl(var(--secondary))",
        //   foreground: "hsl(var(--secondary-foreground))",
        // },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        // card: {
        //   DEFAULT: "hsl(var(--card))",
        //   foreground: "hsl(var(--card-foreground))",
        // },
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        robotoSlab: ["Roboto Slab", "serif"],
        roboto: ["Roboto", "sans-serif"],
        noto: ["Noto Sans"],
        alegreya: ["Alegreya Sans SC", "sans-serif"],
        heading: ["Nanum Myeongjo", "serif"],
        secondary: ["Futura", "Montserrat", "sans-serif"],
        primary: ["Libre Franklin", "sans-serif"],
        fancy: ["Licorice", "sans-serif"],
        /** another handwritten alternative: "Cedarville_Cursive" **/
        handwritten: ["Holland_Land", "sans-serif"],
        bitter: ["Bitter", "serif"],
      },
      fontSize: {
        xxs: "0.69rem",
      },
      boxShadow: {
        dark: "0px 30px 41px rgba(33, 33, 68, 0.24)",
        outline:
          "rgba(6, 24, 44, 0.4) 0px 0px 0px 2px, rgba(6, 24, 44, 0.65) 0px 4px 6px -1px, rgba(255, 255, 255, 0.08) 0px 1px 0px inset",
      },
      keyframes: {
        shimmer: {
          "100%": {
            transform: "translateX(100%)",
          },
        },
        animation: {
          "accordion-down": "accordion-down 0.2s ease-out",
          "accordion-up": "accordion-up 0.2s ease-out",
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
    },
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
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("tailwindcss-animate"),
  ],
};
