/**
 * HTML Sanitization Utilities
 * Prevents XSS attacks by sanitizing user-generated and database content
 */

/**
 * Allowed HTML tags for rich text content
 */
const ALLOWED_TAGS = [
  "b",
  "i",
  "em",
  "strong",
  "a",
  "p",
  "br",
  "ul",
  "ol",
  "li",
  "blockquote",
  "code",
  "pre",
];

/**
 * Allowed attributes for HTML tags
 */
const ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  a: ["href", "title", "target"],
  code: ["class"],
  pre: ["class"],
};

/**
 * Simple HTML sanitizer - removes all HTML tags
 * Use this for plain text content that shouldn't have any HTML
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== "string") {
    return "";
  }

  // Remove all HTML tags
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&");
}

/**
 * Escape HTML special characters
 * Use this when you need to display user content as plain text
 */
export function escapeHtml(text: string): string {
  if (!text || typeof text !== "string") {
    return "";
  }

  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };

  return text.replace(/[&<>"'\/]/g, (char) => map[char]);
}

/**
 * Sanitize URL to prevent javascript: and data: protocols
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== "string") {
    return "";
  }

  const trimmed = url.trim().toLowerCase();

  // Block dangerous protocols
  if (
    trimmed.startsWith("javascript:") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("vbscript:")
  ) {
    return "";
  }

  // Allow relative URLs and safe protocols
  if (trimmed.startsWith("/") || trimmed.startsWith("#")) {
    return url;
  }

  // Allow http, https, mailto, tel
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("mailto:") ||
    trimmed.startsWith("tel:")
  ) {
    return url;
  }

  // Default to empty for unknown protocols
  return "";
}

/**
 * Sanitize user-generated content (like turn.content)
 * Removes all HTML tags and escapes special characters
 */
export function sanitizeUserContent(content: string): string {
  if (!content || typeof content !== "string") {
    return "";
  }

  // First remove all HTML tags
  const withoutTags = sanitizeText(content);

  // Then escape any remaining special characters
  return escapeHtml(withoutTags);
}

/**
 * Sanitize database content (like definitions, descriptions)
 * Removes potentially dangerous HTML but allows safe formatting
 */
export function sanitizeDatabaseContent(content: string): string {
  if (!content || typeof content !== "string") {
    return "";
  }

  // For now, treat database content same as user content
  // In the future, could allow safe HTML tags if needed
  return sanitizeUserContent(content);
}

/**
 * Sanitize JSON content to prevent injection
 */
export function sanitizeJson(json: any): any {
  if (typeof json === "string") {
    return sanitizeText(json);
  }

  if (Array.isArray(json)) {
    return json.map(sanitizeJson);
  }

  if (json !== null && typeof json === "object") {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(json)) {
      // Sanitize key to prevent prototype pollution
      const sanitizedKey = sanitizeText(key);
      sanitized[sanitizedKey] = sanitizeJson(value);
    }
    return sanitized;
  }

  return json;
}

/**
 * Validate and sanitize email
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== "string") {
    return "";
  }

  const trimmed = email.trim().toLowerCase();

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return "";
  }

  return trimmed;
}

/**
 * Sanitize filename to prevent directory traversal
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== "string") {
    return "";
  }

  // Remove path separators and dangerous characters
  return filename
    .replace(/\.\./g, "")
    .replace(/[\/\\]/g, "")
    .replace(/[<>:"|?*]/g, "")
    .trim();
}

/**
 * Create a Content Security Policy compliant string
 */
export function createSafeHtml(text: string): string {
  return escapeHtml(text);
}

/**
 * Check if string contains potentially dangerous content
 */
export function containsDangerousContent(text: string): boolean {
  if (!text || typeof text !== "string") {
    return false;
  }

  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // Event handlers like onclick=
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /eval\(/i,
    /expression\(/i,
  ];

  return dangerousPatterns.some((pattern) => pattern.test(text));
}
