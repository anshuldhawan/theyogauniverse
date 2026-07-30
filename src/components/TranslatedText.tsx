import { localizedContent, type TranslatedContent } from "@/lib/localization";

export function TranslatedText({
  content,
  requestedLanguage,
}: {
  content: TranslatedContent;
  requestedLanguage: string;
}) {
  const displayed = localizedContent(content, requestedLanguage);
  return (
    <div>
      {displayed.label && (
        <p className="mb-1 text-xs text-faint" aria-label="Translation method">
          {displayed.label}
        </p>
      )}
      <p>{displayed.text}</p>
      {displayed.original && (
        <details className="mt-2 text-sm">
          <summary className="cursor-pointer text-leaf">
            Show original ({content.originalLanguage})
          </summary>
          <p lang={content.originalLanguage} className="mt-2 text-body">
            {displayed.original}
          </p>
        </details>
      )}
    </div>
  );
}
