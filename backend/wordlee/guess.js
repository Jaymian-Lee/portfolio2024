const nspell = require('nspell');
const { WORD_LENGTH, evaluateGuess, getDailyWord, isDateKey, normalizeLanguage, normalizeWord } = require('./game');

const spellcheckers = { en: null, nl: null };

async function loadDictionary(language) {
  const dictionaryName = language === 'nl' ? 'dictionary-nl' : 'dictionary-en';
  const dictionaryModule = await import(dictionaryName);
  return nspell(dictionaryModule?.default || dictionaryModule);
}

async function isValidWord(language, word) {
  if (word.length !== WORD_LENGTH || !/^[a-z]+$/.test(word)) return false;
  if (!spellcheckers[language]) spellcheckers[language] = await loadDictionary(language);
  return spellcheckers[language].correct(word);
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const language = normalizeLanguage(req.query?.language);
    const dateKey = String(req.query?.date || '');
    const guess = normalizeWord(req.query?.guess);

    if (!isDateKey(dateKey)) return res.status(400).json({ error: 'Ongeldige datum.' });
    if (!(await isValidWord(language, guess))) return res.status(200).json({ language, valid: false });

    const answer = getDailyWord(language, dateKey);
    return res.status(200).json({
      language,
      valid: true,
      evaluation: evaluateGuess(guess, answer),
      solved: guess === answer
    });
  } catch (error) {
    console.error('Wordlee guess error:', error);
    return res.status(500).json({ error: 'Kon deze gok niet controleren.' });
  }
};
