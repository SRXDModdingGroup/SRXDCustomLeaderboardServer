/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,ts,jsx,tsx}"],
    darkMode:"class",
    theme: {
        extend: {
            colors: {
                primary: "#e84db1",
                secondary: "#714fac",
                error: "#ff3863",
                success: "#3dfb84"
            }
        },
    },
    plugins: [],
};
