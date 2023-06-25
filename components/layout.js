import utilStyles from "@/styles/utils.module.css";
import Script from "next/script";
import Head from "next/head";
import Link from "next/link";

export const siteTitle = "Fredirect | Follow URLs redirects.";
const name = "Fredirect";

export default function Layout({ children, home }) {
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="description"
          content="Security tool to check URLs redirects."
        />
        <meta name="og:title" content={siteTitle} />
        <meta name="twitter:card" content="summary_large_image" />
        <title>{siteTitle}</title>
      </Head>

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

      <header>
        <h1 className={utilStyles.heading2Xl}>{name}</h1>
      </header>

      <main>{children}</main>
      {!home && (
        <div className={styles.backToHome}>
          <Link href="/">
            <a>← Back to home</a>
          </Link>
        </div>
      )}

      <footer>
        <div>
          <p>
            Created with ❤️ + <a href="https://vercel.com">vercel</a> + ☕.{" "}
            <a href="https://github.com/juan-villamizar/fredirect">Fredirect</a>{" "}
            | {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </>
  );
}
