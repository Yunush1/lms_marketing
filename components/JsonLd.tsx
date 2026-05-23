/**
 * Tiny helper that emits a JSON-LD <script> tag from a structured-data
 * object. Rendered inside a page so the document picks it up at build time.
 */
export function JsonLd({
  data,
}: {
  data: Record<string, unknown> | Record<string, unknown>[];
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
