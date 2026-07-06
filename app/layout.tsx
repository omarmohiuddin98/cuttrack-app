import './globals.css';

export const metadata = {
  title: 'CutTrack',
  description: 'Job tickets & sheet inventory for the fabrication floor',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
