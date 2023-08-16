/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
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
          dark: "#0f172a",
        },
        secondary: {
          DEFAULT: "#02E2AC",
          light: "#87E4DB",
        },
        highlight: "#CBF0C1",
        skin: {
          muted: "#FAFCFC",
          DEFAULT: "#E5EEEF",
        },
        card: {
          one: "#212144",
          two: "#3838B4"
        },
        warn: "#EF6262"
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        robotoSlab: ["Roboto Slab", "serif"],
        roboto: ["Roboto", "sans-serif"],
        noto: ["Noto Sans"],
        alegreya: ["Alegreya Sans SC", "sans-serif"],
        heading: ["Nanum Myeongjo", "serif"],
        secondary: ["Futura", "sans-serif"],
        primary: ["Libre Franklin", "sans-serif"],
        fancy: ["Licorice", "sans-serif"],
        /** another handwritten alternative: "Cedarville_Cursive" **/
        handwritten: ["Holland_Land", "sans-serif"],
      },
      fontSize: {
        xxs: "0.69rem",
      },
      boxShadow: {
        dark: "0px 30px 41px rgba(33, 33, 68, 0.24)",
        outline:
          "rgba(6, 24, 44, 0.4) 0px 0px 0px 2px, rgba(6, 24, 44, 0.65) 0px 4px 6px -1px, rgba(255, 255, 255, 0.08) 0px 1px 0px inset",
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
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
