export async function validateWord(language, word) {
  const response = await fetch(`/api/wordlee/validate-word?language=${encodeURIComponent(language)}&word=${encodeURIComponent(word)}`);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error || 'Word validation failed');
  }

  return {
    language: data?.language === 'nl' ? 'nl' : 'en',
    normalizedWord: String(data?.normalizedWord || word || ''),
    valid: Boolean(data?.valid)
  };
}
