"use client";

import { trackEvent } from "@/components/analytics/tracking";
import styles from "./landing.module.css";

import { WEDDING_FAQ_ITEMS } from "@/lib/boda-trial/faq";

export function WeddingFaq() {
  return (
    <div className={styles.faqList}>
      {WEDDING_FAQ_ITEMS.map((item) => (
        <details
          className={styles.faqItem}
          key={item.question}
          onToggle={(event) => {
            if (event.currentTarget.open) {
              trackEvent("wedding_faq_open", { question: item.question, page: "/boda" });
            }
          }}
        >
          <summary>
            <span>{item.question}</span>
            <span className={styles.faqIcon} aria-hidden="true" />
          </summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
