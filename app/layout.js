import "./globals.css";
import { Fredoka, Inter } from "next/font/google";
import { StoreProvider } from "./store-context";

const fredoka = Fredoka({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-fredoka" });
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata = {
  title: "YAPA - perks people actually want",
  description: "A two-sided benefits marketplace built for Albania, ready for the world.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${fredoka.variable} ${inter.variable}`}>
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
