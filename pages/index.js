import Head from 'next/head';
import Layout, {siteTitle} from '@/components/layout';
import Input from '@/components/input';
import utilStyles from '@/styles/utils.module.css';

export default function Home () {
  return (
    <Layout home>
      <Head>
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=UA-173491974-1"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'UA-173491974-1');
              `,
          }}
        />
        <title>{siteTitle}</title>
      </Head>
      <section className={utilStyles.headingMd}>
        <h3>Follow URLs redirects</h3>
      </section>
      <section className={utilStyles.Input}>
        <Input />
      </section>
    </Layout>
  );
}
