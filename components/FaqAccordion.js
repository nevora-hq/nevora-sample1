// よくあるご質問（開閉式）。データは lib/siteConfig.js の FAQS。
export default function FaqAccordion({ items }) {
  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <div className="faq-list">
      {items.map((item) => (
        <details key={item.question} className="faq-item">
          <summary className="faq-question">{item.question}</summary>
          <div className="faq-answer">
            <p>{item.answer}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
