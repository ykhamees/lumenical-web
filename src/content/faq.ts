export type Faq = {
  question: string;
  answer: string;
};

export const faqs: Faq[] = [
  {
    question: "What size of business do you work with?",
    answer:
      "Our consulting engagements are scoped specifically for businesses of 5 to 100 people — it's where we've built our process to fit. If you're outside that range, get in touch and we'll tell you honestly whether it's still a good fit.",
  },
  {
    question: "Do I need to know exactly what I want before reaching out?",
    answer:
      "No. Most engagements start with a short conversation about where things stand today — the specific plan comes after that, not before.",
  },
  {
    question: "Can you build just one thing, or do we need the whole stack?",
    answer:
      "Either. Mix and match from the six consulting disciplines, or hand us the whole stack — the engagement is scoped to what you actually need.",
  },
  {
    question: "What happens after launch?",
    answer:
      "The same team that built it stays on to maintain it. We don't hand off to a separate agency or support desk once something ships.",
  },
  {
    question: "Can your platforms run entirely on our own infrastructure?",
    answer:
      "Yes — that's the point of them. Depending on the product, they run on-premises, self-hosted, or fully air-gapped. See each platform's page for its specific deployment modes.",
  },
  {
    question: "Who hosts the platform once it's deployed?",
    answer:
      "You do, on your own infrastructure. We build and deploy it there and stay on to support it — we don't run it for you in our own cloud.",
  },
  {
    question: "Do you publish case studies or client names?",
    answer:
      "Not without explicit sign-off from that client — we don't publish names, logos, or case studies otherwise. If you want to know about relevant experience, ask us directly.",
  },
  {
    question: "Do you publish pricing?",
    answer:
      "Not a standard rate card — consulting engagements and platform deployments both vary too much by size and scope for one number to be honest. Tell us what you're working with and we'll give you a straightforward read on cost.",
  },
  {
    question: "How do I get in touch?",
    answer:
      "Through the contact form, or by emailing hello@lumenical.com — see the contact page for details.",
  },
];
