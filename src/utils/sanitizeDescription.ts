import DOMPurify from "isomorphic-dompurify";

export const sanitizeDescription = (
  description: string | null | undefined
): string => {
  const cleanDescription = description?.trim() || "";

  // Sanitize HTML
  const sanitized = DOMPurify.sanitize(cleanDescription, {
    ALLOWED_TAGS: ["h1", "h2", "h3", "p", "a", "ul", "li", "hr"],
    ALLOWED_ATTR: ["href"],
  });

  return sanitized;
};
