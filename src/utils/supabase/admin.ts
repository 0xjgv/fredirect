import { createClient } from "@supabase/supabase-js";
import type { Database, Tables } from "./types_db";

type Domains = Tables<"domains">;
type Ips = Tables<"ips">;

// Note: supabaseAdmin uses the SERVICE_ROLE_KEY which you must only use in a secure server-side context
// as it has admin privileges and overwrites RLS policies!
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export const upsertRedirects = async ({
  records,
  urls
}: {
  records: any;
  urls: any;
}): Promise<void> => {
  const metadataByDomain: Record<string, any> = Object.entries(records).reduce(
    (acc: Record<string, any>, [domain, metadata]) => {
      return { ...acc, [domain]: metadata };
    },
    {}
  );
  const domainsToUpsert: Domains[] = Object.entries(metadataByDomain).map(
    ([domain, metadata]: [string, any]) => ({ metadata, domain } as Domains)
  );

  const ipsToUpsert: Ips[] = [
    ...new Set(urls.map(({ ip }: { ip: string }) => ip))
  ].map(ip => ({ ip } as Ips));

  const ipDomainRelToUpsert = urls.map(
    ({ ip, url }: { ip: string; url: string }) => ({
      domain: new URL(url).hostname,
      ip
    })
  );

  const [domainsData, ipsData] = await Promise.all([
    supabaseAdmin.from("domains").upsert(domainsToUpsert),
    supabaseAdmin.from("ips").upsert(ipsToUpsert)
  ]);
  const ipDomainRelData = await supabaseAdmin
    .from("ip_domain_rel")
    .upsert(ipDomainRelToUpsert);

  console.log({ domainsData, ipsData, ipDomainRelData });
};
