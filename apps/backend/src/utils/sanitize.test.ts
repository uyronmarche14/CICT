import { describe, expect, it } from 'vitest';
import { sanitizeHtmlContent } from './sanitize';

describe('sanitizeHtmlContent', () => {
  it('allows safe HTML tags', () => {
    const input = '<p>Hello <strong>world</strong></p>';
    expect(sanitizeHtmlContent(input)).toBe('<p>Hello <strong>world</strong></p>');
  });

  it('strips script tags', () => {
    const input = '<p>Hello</p><script>alert("xss")</script>';
    expect(sanitizeHtmlContent(input)).toBe('<p>Hello</p>');
  });

  it('strips on* event handlers', () => {
    const input = '<p onclick="alert(1)">Click me</p>';
    const result = sanitizeHtmlContent(input);
    expect(result).not.toContain('onclick');
    expect(result).toContain('Click me');
  });

  it('removes all iframes (no longer allowed)', () => {
    const input = '<iframe src="https://www.youtube.com/embed/abc123"></iframe>';
    const result = sanitizeHtmlContent(input);
    expect(result).not.toContain('iframe');
  });

  it('strips javascript: URLs in links', () => {
    const input = '<a href="javascript:alert(1)">link</a>';
    const result = sanitizeHtmlContent(input);
    expect(result).toContain('link');
    expect(result).not.toContain('javascript');
  });

  it('allows style attributes with safe values', () => {
    const input = '<p style="text-align: center;">Centered</p>';
    expect(sanitizeHtmlContent(input)).toContain('text-align');
  });

  it('removes unsafe style values', () => {
    const input = '<div style="background-image: url(javascript:alert(1))">XSS</div>';
    const result = sanitizeHtmlContent(input);
    expect(result).toContain('XSS');
    expect(result).not.toContain('background-image');
  });
});
