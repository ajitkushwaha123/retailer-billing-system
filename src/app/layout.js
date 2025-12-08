import { Poppins } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/global/app-shell";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "Kravy Billing Software",
  description:
    "Smart billing, inventory tracking, QR payments, and GST-ready billing for retail stores.",
  keywords: [
    "Billing Software",
    "POS Software",
    "Retail Billing",
    "Kravy",
    "QR Payment Billing",
    "Inventory",
    "Invoice Generator",
  ],
  authors: [{ name: "Kravy Team" }],
  viewport: "width=device-width, initial-scale=1",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  themeColor: "#000000",
  openGraph: {
    title: "Kravy Billing Software",
    description:
      "Smart billing for retail stores with QR payments, On-the-spot invoices & customer receipts.",
    url: "https://kravy.in",
    siteName: "Kravy Billing",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Kravy Billing Software",
      },
    ],
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="antialiased bg-gray-50 text-gray-900">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
