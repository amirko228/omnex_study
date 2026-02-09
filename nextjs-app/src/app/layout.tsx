import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { ClientLayout } from "./client-layout";

export const metadata: Metadata = {
  title: "Omnex Study - AI-Powered Learning Platform",
  description: "Персональная AI-платформа для обучения с адаптивным контентом, интерактивными курсами и умным репетитором",
  keywords: ["AI", "обучение", "курсы", "образование", "онлайн-обучение"],
  authors: [{ name: "Omnex Study" }],
  openGraph: {
    title: "Omnex Study - AI-Powered Learning Platform",
    description: "Персональная AI-платформа для обучения",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>
          <ClientLayout>
            {children}
          </ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
