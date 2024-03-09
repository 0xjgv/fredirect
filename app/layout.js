import Script from "next/script";
import Head from "next/head";
import "@/styles/global.css";

export const metadata = {
  description: "Follow URL redirects and get DNS records.",
  title: "Fredirect | Follow URLs redirects."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <main>
          {children}
          <footer>
            <div>
              <p>
                Created with ❤️ + <a href="https://vercel.com">vercel</a> + ☕.{" "}
                <a href="https://github.com/juan-villamizar/fredirect">
                  Fredirect
                </a>{" "}
                | {new Date().getFullYear()}
              </p>
            </div>
          </footer>
        </main>
      </body>

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
