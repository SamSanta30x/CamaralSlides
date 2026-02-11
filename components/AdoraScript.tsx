'use client';

import Script from 'next/script';

export default function AdoraScript() {
  return (
    <Script
      src="https://adora-cdn.com/adora-start.js"
      strategy="afterInteractive"
      onLoad={() => {
        if (typeof window !== 'undefined' && (window as any).adoraStart) {
          (window as any).adoraStart({
            orgId: "c5ab12e4-249d-4873-84ea-685a0c345a87",
            uid: "",
            properties: {
              "Subscription tier": "",
              "Company name": ""
            }
          });
        }
      }}
    />
  );
}
