import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SpendWise - Personal Expense Tracker',
  description: 'Clean, robust personal expense tracking and monthly analytics.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
