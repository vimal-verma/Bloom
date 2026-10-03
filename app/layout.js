import "./globals.css";

export const metadata = {
  title: "Bloom & Nurture — Pregnancy & Daily Wellness Companion",
  description: "A private, compassionate pregnancy companion powered by Gemma 2. Track week-by-week milestones, hydration, prenatal medications, and care tools.",
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
