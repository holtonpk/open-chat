// import "../../global-style.css";
// import {SpeedInsights} from "@vercel/speed-insights/next";
// import {Analytics} from "@vercel/analytics/react";
import "./globals.css";

export const metadata = {
  title: "Open Chat",
  description: "One place for all your ai needs",
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      {/* <SpeedInsights /> */}
      {/* <Analytics /> */}
      <body>{children}</body>
    </html>
  );
}
