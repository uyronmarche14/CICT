import sanitizeHtml from 'sanitize-html';

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'figure', 'figcaption', 'span', 'div', 'br', 'hr',
    'u', 's', 'sub', 'sup', 'pre', 'code',
  ]),
  allowedAttributes: {
    '*': ['style'],
    'a': ['href', 'target', 'rel', 'name', 'aria-label'],
    'img': ['src', 'alt', 'title', 'width', 'height', 'loading'],
    'td': ['colspan', 'rowspan'],
    'th': ['colspan', 'rowspan'],
    'table': ['border', 'cellpadding', 'cellspacing'],
    'ol': ['start', 'type'],
    'li': ['value'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesByTag: {
    img: ['http', 'https', 'data'],
  },
  disallowedTagsMode: 'discard',
  allowedStyles: {
    '*': {
      'text-align': [/^left$/, /^right$/, /^center$/, /^justify$/],
      'color': [/^#(0x)?[0-9a-fA-F]{3,8}$/, /^rgb\(/],
      'background-color': [/^#(0x)?[0-9a-fA-F]{3,8}$/],
      'font-size': [/^\d+(?:px|em|rem|%)$/],
      'font-weight': [/^[0-9]+$/, /^bold$/, /^normal$/],
      'font-style': [/^italic$/, /^normal$/],
      'text-decoration': [/^underline$/, /^line-through$/],
    },
  },
  allowVulnerableTags: false,
};

export const sanitizeHtmlContent = (html: string): string => {
  return sanitizeHtml(html, SANITIZE_OPTIONS);
};
