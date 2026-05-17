import { urlFor } from "../../../lib/sanityClient";

function renderSpan(span, i) {
  const marks = span.marks || [];
  let content = span.text;

  if (marks.includes("strong") && marks.includes("em")) {
    content = <strong key={i}><em>{content}</em></strong>;
  } else if (marks.includes("strong")) {
    content = <strong key={i}>{content}</strong>;
  } else if (marks.includes("em")) {
    content = <em key={i}>{content}</em>;
  } else {
    content = <span key={i}>{content}</span>;
  }

  return content;
}

function renderBlock(block, i) {
  const style = block.style || "normal";

  // Find any link annotations from markDefs
  const markDefs = block.markDefs || [];
  const linkedChildren = (block.children || []).map((span, si) => {
    const linkDef = markDefs.find(m => span.marks?.includes(m._key) && m._type === "link");
    const text = renderSpan(span, si);
    if (linkDef?.href) {
      return (
        <a key={si} href={linkDef.href} target="_blank" rel="noopener noreferrer"
          className="text-brand-blue underline hover:text-brand-navy">
          {span.text}
        </a>
      );
    }
    return text;
  });

  switch (style) {
    case "h2":
      return <h2 key={i} className="text-2xl font-bold text-brand-navy mt-10 mb-4">{linkedChildren}</h2>;
    case "h3":
      return <h3 key={i} className="text-xl font-bold text-brand-navy mt-8 mb-3">{linkedChildren}</h3>;
    case "blockquote":
      return (
        <blockquote key={i} className="border-l-4 border-brand-blue pl-5 my-6 italic text-slate-600 text-lg leading-relaxed">
          {linkedChildren}
        </blockquote>
      );
    default: {
      // Skip empty paragraphs
      const text = (block.children || []).map(c => c.text || "").join("").trim();
      if (!text) return null;
      return <p key={i} className="mb-5 leading-relaxed text-slate-700">{linkedChildren}</p>;
    }
  }
}

export default function PostBody({ content = [] }) {
  if (!content || content.length === 0) {
    return (
      <div className="py-8 text-slate-400 text-sm italic">
        Article content coming soon.
      </div>
    );
  }

  return (
    <article className="prose-custom text-base">
      {content.map((block, i) => {
        const blockType = block._type || block.type;

        // Sanity Portable Text block
        if (blockType === "block") {
          return renderBlock(block, i);
        }

        // Sanity image block inside body
        if (blockType === "image") {
          let src = null;
          try {
            if (block.asset && urlFor) {
              src = urlFor(block).width(800).url();
            }
          } catch {
            src = null;
          }
          if (!src) return null;
          return (
            <figure key={i} className="my-8">
              <img
                src={src}
                alt={block.alt || ""}
                className="w-full rounded-xl border border-slate-100"
                loading="lazy"
              />
              {block.alt && (
                <figcaption className="text-center text-xs text-slate-400 mt-2">{block.alt}</figcaption>
              )}
            </figure>
          );
        }

        // Legacy format fallback
        switch (blockType) {
          case "h2": return <h2 key={i} className="text-2xl font-bold text-brand-navy mt-10 mb-4">{block.text}</h2>;
          case "h3": return <h3 key={i} className="text-xl font-bold text-brand-navy mt-8 mb-3">{block.text}</h3>;
          case "p": return <p key={i} className="mb-5 leading-relaxed text-slate-700">{block.text}</p>;
          case "quote":
            return (
              <blockquote key={i} className="border-l-4 border-brand-blue pl-5 my-6 italic text-slate-600 text-lg leading-relaxed">
                {block.text}
              </blockquote>
            );
          case "ul":
            return (
              <ul key={i} className="list-disc pl-6 mb-5 space-y-1 text-slate-700">
                {block.items?.map((it, idx) => <li key={idx}>{it}</li>)}
              </ul>
            );
          case "img":
            return (
              <figure key={i} className="my-8">
                <img src={block.src} alt={block.alt || ""} className="w-full rounded-xl border border-slate-100" loading="lazy" />
              </figure>
            );
          default:
            return null;
        }
      })}
    </article>
  );
}
