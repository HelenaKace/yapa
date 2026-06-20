import "./globals.css";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import { StoreProvider } from "./store-context";

const display = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["500", "600", "700", "800"], variable: "--font-display" });
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata = {
  title: "PERX — perks people actually want",
  description: "A two-sided benefits marketplace built for Albania, ready for the world.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${inter.variable}`}>
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
