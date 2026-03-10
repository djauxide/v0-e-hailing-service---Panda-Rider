export const metadata = {
  title: 'Panda Rider Admin',
  description: 'Multi-service e-hailing admin dashboard',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
