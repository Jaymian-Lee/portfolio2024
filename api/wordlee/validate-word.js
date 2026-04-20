const nspell = require('nspell');

const COMBINING_MARKS_REGEX = /[\u0300-\u036f]/g;
const SPELLCHECK_WORD_LENGTH = 5;

const wordSpellcheckers = {
  en: null,
  nl: null
};

const wordValidityCache = {
  en: new Map(),
  nl: new Map()
};

function normalizeLanguage(language) {
  return language === 'nl' ? 'nl' : 'en';
}

function normalizeSpellcheckWord(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(COMBINING_MARKS_REGEX, '');
}

async function loadDictionary(language) {
  const normalizedLanguage = normalizeLanguage(language);
  if (wordSpellcheckers[normalizedLanguage]) return wordSpellcheckers[normalizedLanguage];

  const dictionaryName = normalizedLanguage === 'nl' ? 'dictionary-nl' : 'dictionary-en';
  const module = await import(dictionaryName);
  const dict = module?.default || module;
  const spellchecker = nspell(dict);
  wordSpellcheckers[normalizedLanguage] = spellchecker;
  return spellchecker;
}

async function isValidWord(language, word) {
  const normalizedLanguage = normalizeLanguage(language);
  const normalizedWord = normalizeSpellcheckWord(word);

  if (wordValidityCache[normalizedLanguage].has(normalizedWord)) {
    return {
      normalizedWord,
      valid: wordValidityCache[normalizedLanguage].get(normalizedWord)
    };
  }

  if (normalizedWord.length !== SPELLCHECK_WORD_LENGTH || !/^[a-z]+$/.test(normalizedWord)) {
    wordValidityCache[normalizedLanguage].set(normalizedWord, false);
    return { normalizedWord, valid: false };
  }

  const spellchecker = await loadDictionary(normalizedLanguage);
  const valid = Boolean(spellchecker.correct(normalizedWord));
  wordValidityCache[normalizedLanguage].set(normalizedWord, valid);

  return {
    normalizedWord,
    valid
  };
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const language = normalizeLanguage(req.query?.language);
    const word = String(req.query?.word || '');
    const result = await isValidWord(language, word);

    return res.status(200).json({
      language,
      normalizedWord: result.normalizedWord,
      valid: result.valid
    });
  } catch (error) {
    console.error('Word validation GET error:', error);
    return res.status(500).json({ error: 'Kon het woord niet controleren.' });
  }
};
