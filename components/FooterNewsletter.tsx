"use client";

import { usePathname } from "next/navigation";
import NewsletterForm from "@/components/NewsletterForm";
import { newsletterCopyForPath } from "@/lib/subscription/newsletterCopy";

/** Footer bülteni — pathname’e göre başlık/açıklama (DB tag ile uyumlu). */
export default function FooterNewsletter() {
  const pathname = usePathname() ?? "/";
  const copy = newsletterCopyForPath(pathname);

  return (
    <NewsletterForm
      variant="footer"
      source={`footer:${pathname}`}
      heading={copy.heading}
      description={copy.description}
      buttonLabel={copy.buttonLabel}
    />
  );
}
