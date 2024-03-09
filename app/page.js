import utilStyles from "@/styles/utils.module.css";
import Input from "@/components/input";
import Head from "next/head";

export default function Home() {
  return (
    <>
      <section className={utilStyles.headingMd}>
        <h3>Follow URLs redirects</h3>
      </section>

      <section className={utilStyles.Input}>
        <Input />
      </section>
    </>
  );
}
