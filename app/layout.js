import "./globals.css";

export const metadata = {
  title: "Bloom & Nurture — Pregnancy & Daily Wellness Tracker",
  description: "Track your week-by-week pregnancy journey, baby growth milestones, customizable daily water reminders, and prenatal medicine schedules.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
