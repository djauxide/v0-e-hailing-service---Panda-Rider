import './globals.css';

export const metadata = {
  title: 'Panda Rider Admin',
  description: 'Multi-service e-hailing admin dashboard',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50">{children}</body>
    </html>
  );
}
