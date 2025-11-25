export const metadata = {
  title: 'StellarCredit',
  description: 'Decentralized Credit Platform on Stellar',
}
import "./globals.css";
import { WalletProvider } from "@/contexts/WalletContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  )
}
