import sanitizeHtml from 'sanitize-html';

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'figure', 'figcaption', 'span', 'div', 'br', 'hr',
    'u', 's', 'sub', 'sup', 'pre', 'code', 'iframe',
  ]),
  allowedAttributes: {
    '*': ['style', 'class', 'id'],
    'a': ['href', 'target', 'rel'],
    'img': ['src', 'alt', 'width', 'height'],
    'td': ['colspan', 'rowspan'],
    'th': ['colspan', 'rowspan'],
    'table': ['border', 'cellpadding', 'cellspacing'],
    'iframe': ['src', 'width', 'height', 'frameborder', 'allowfullscreen'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesByTag: {
    iframe: ['https'],
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
  exclusiveFilter: (frame) => {
    return frame.tag === 'iframe' && !frame.attribs?.src?.startsWith('https://');
  },
};

export const sanitizeHtmlContent = (html: string): string => {
  return sanitizeHtml(html, SANITIZE_OPTIONS);
};
