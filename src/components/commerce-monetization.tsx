import Script from "next/script";

function validSovrnKey(value: string | undefined) {
  return value && /^[a-zA-Z0-9_-]{12,160}$/.test(value) ? value : null;
}

function validSkimlinksUrl(value: string | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    const allowedHost = url.hostname === "s.skimresources.com" || url.hostname.endsWith(".skimresources.com");
    return url.protocol === "https:" && allowedHost ? url.toString() : null;
  } catch {
    return null;
  }
}

export function CommerceMonetization() {
  const provider = process.env.NEXT_PUBLIC_COMMERCE_PROVIDER?.toLowerCase();

  if (provider === "sovrn") {
    const key = validSovrnKey(process.env.NEXT_PUBLIC_SOVRN_COMMERCE_KEY);
    if (!key) return null;
    return (
      <>
        <Script id="sovrn-commerce-config" strategy="afterInteractive">
          {`window.vglnk = { key: ${JSON.stringify(key)} };`}
        </Script>
        <Script id="sovrn-commerce" src="https://cdn.viglink.com/api/vglnk.js" strategy="afterInteractive" />
      </>
    );
  }

  if (provider === "skimlinks") {
    const scriptUrl = validSkimlinksUrl(process.env.NEXT_PUBLIC_SKIMLINKS_SCRIPT_URL);
    if (!scriptUrl) return null;
    return <Script id="skimlinks-commerce" src={scriptUrl} strategy="afterInteractive" />;
  }

  return null;
}
