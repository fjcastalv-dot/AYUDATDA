import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'TDAH Focus Shield | Ceguera Temporal & Foco Único',
  description: 'Aplicación web diseñada para mitigar la ceguera temporal (time blindness) y el efecto cascada de distracción (yak shaving) con temporizador semáforo, modo foco único y Google Calendar.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <head>
        {/* Google Identity Services para OAuth 2.0 Client-side */}
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
        />
      </head>
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
