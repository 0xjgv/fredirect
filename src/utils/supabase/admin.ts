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
  const ipsToUpsert: Ips[] = urls.map(({ ip }: { ip: string }) => ({ ip }));
  const domainsToUpsert: Domains[] = Object.entries(records).map(
    ([domain, metadata]: [string, any]) =>
      ({
        metadata,
        domain
      } as Domains)
  );
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

export const upsertDomain = async (
  host: string,
  metadata: any
): Promise<void> => {
  const domainData = {
    domain: host,
    metadata
  };
  const { error: upsertError } = await supabaseAdmin
    .from("domains")
    .upsert(domainData);

  if (upsertError)
    throw new Error(`Product insert/update failed: ${upsertError.message}`);

  console.log(`Product inserted/updated: ${domainData.domain}`);
};
