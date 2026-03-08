export function convertHtmlToLexical(html: string): any {
  if (!html) return null

  // Split HTML into potential paragraphs/blocks based on common tags
  // This is a simplified approach without a full DOM parser to keep dependencies low
  const blocks = html
    .split(/<p>|<br\s*\/?>|<\/p>|<div>|<\/div>/gi)
    .map(block => block.replace(/<[^>]*>?/gm, '').trim()) // strip remaining tags
    .filter(block => block.length > 0)

  if (blocks.length === 0) {
    const cleanText = html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim()
    if (!cleanText) return null
    blocks.push(cleanText)
  }

  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      children: blocks.map(text => ({
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        children: [
          {
            type: 'text',
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: text,
            version: 1,
          },
        ],
      })),
    },
  }
}
