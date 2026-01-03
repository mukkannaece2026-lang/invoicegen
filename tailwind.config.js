/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#2563eb", // Blue-600
                secondary: "#64748b", // Slate-500
                accent: "#0f172a", // Slate-900
            }
        },
    },
    plugins: [],
}
