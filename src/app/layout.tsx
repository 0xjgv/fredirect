import { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  description: "Follow URL redirects and get DNS records.",
  title: "Fredirect | Follow URLs redirects.",
  classification: "Cybersecurity",
  category: "Cybersecurity tools",
  openGraph: {
    description: "Follow URL redirects and get DNS records.",
    siteName: "Fredirect | Follow URLs redirects.",
    url: "https://fredirect.vercel.app",
    type: "website",
    locale: "en_US"
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <main className="flex-grow flex flex-col justify-center p-3">
          {children}
        </main>
        <footer className="align-end bottom-0 w-full text-center p-6">
          <p>
            Created with ❤️ + <a href="https://vercel.com">vercel</a> + ☕.{" "}
            <a href="https://github.com/0xjgv/fredirect">Fredirect</a> |{" "}
            {new Date().getFullYear()}
          </p>
        </footer>
      </body>

      <Script src="https://tally.so/widgets/embed.js" strategy="afterInteractive" />
      <Script
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=G-155TMH014N"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-155TMH014N');
            `
        }}
      />
    </html>
  );
}
