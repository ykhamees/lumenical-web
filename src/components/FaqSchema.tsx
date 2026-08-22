import type { Faq } from "@/content/faq";

/**
 * JSON-LD FAQPage schema, same rule as the other schema components: only
 * the questions and answers actually shown on the page, verbatim.
 */
export function FaqSchema({ faqs }: { faqs: Faq[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
