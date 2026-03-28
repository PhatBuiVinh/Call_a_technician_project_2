export default function PostBody({ content = [] }) {
  // Helper to extract text from Portable Text block
  const extractText = (block) => {
    if (!block.children || !Array.isArray(block.children)) return ''
    return block.children.map(child => child.text || '').join('')
  }

  return (
    <article className="prose prose-slate max-w-none">
      {content.map((block, i) => {
        // Handle Sanity Portable Text format (_type) or legacy format (type)
        const blockType = block._type || block.type
        
        switch (blockType) {
          case "block":
            // Render based on style (h2, h3, normal, etc.)
            const style = block.style || 'normal'
            const text = extractText(block)
            
            if (style === 'h2') {
              return <h2 key={i} className="text-2xl font-semibold mt-6 mb-4">{text}</h2>
            } else if (style === 'h3') {
              return <h3 key={i} className="text-xl font-semibold mt-5 mb-3">{text}</h3>
            } else {
              // Normal paragraph
              return <p key={i} className="mb-4 leading-relaxed">{text}</p>
            }
          
          case "h2":
            return <h2 key={i}>{block.text}</h2>
          case "h3":
            return <h3 key={i}>{block.text}</h3>
          case "p":
            return <p key={i}>{block.text}</p>
          case "quote":
            return (
              <blockquote key={i}>
                {block.text}
              </blockquote>
            )
          case "ul":
            return (
              <ul key={i}>
                {block.items?.map((it, idx) => <li key={idx}>{it}</li>)}
              </ul>
            )
          case "img":
            return (
              <img
                key={i}
                src={block.src}
                alt={block.alt || ""}
                className="rounded-lg"
                loading="lazy"
              />
            )
          default:
            return null
        }
      })}
    </article>
  )
}
