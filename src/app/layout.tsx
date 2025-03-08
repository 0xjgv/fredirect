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
          <p className="text-gray-400 text-xs">
            Created with ❤️ + <a href="https://vercel.com">vercel</a> + ☕.{" "}
            <a href="https://github.com/0xjgv/fredirect">Fredirect</a> |{" "}
            {new Date().getFullYear()}
          </p>
        </footer>

        <Script
          src="https://tally.so/widgets/embed.js"
          strategy="afterInteractive"
        />
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-155TMH014N"
        />
        <Script
          id="posthog"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
        !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug getPageViewId captureTraceFeedback captureTraceMetric".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
            posthog.init('phc_xYEg7LoxtTjWpLVuexKksJB2NeFxZ7Ca5PzryT374PW', {
              api_host: 'https://eu.i.posthog.com',
              person_profiles: 'identified_only',
            })
          `
          }}
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
      </body>
    </html>
  );
}
