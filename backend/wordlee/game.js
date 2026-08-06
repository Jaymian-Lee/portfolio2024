const DAILY_WORDS = require('./dailyWords');

const WORD_LENGTH = 5;
const COMBINING_MARKS_REGEX = /[\u0300-\u036f]/g;

function normalizeLanguage(language) {
  return language === 'nl' ? 'nl' : 'en';
}

function normalizeWord(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(COMBINING_MARKS_REGEX, '');
}

function isDateKey(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''));
}

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function hashString(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getDailyWord(language, dateKey) {
  const normalizedLanguage = normalizeLanguage(language);
  const pool = DAILY_WORDS[normalizedLanguage] || [];
  if (!pool.length || !isDateKey(dateKey)) return '';
  return normalizeWord(pool[hashString(`${dateKey}:${normalizedLanguage}`) % pool.length]);
}

function evaluateGuess(guess, answer) {
  const result = new Array(WORD_LENGTH).fill('absent');
  const answerChars = normalizeWord(answer).split('');
  const guessChars = normalizeWord(guess).split('');

  guessChars.forEach((char, index) => {
    if (char === answerChars[index]) {
      result[index] = 'correct';
      answerChars[index] = null;
      guessChars[index] = null;
    }
  });

  guessChars.forEach((char, index) => {
    if (!char) return;
    const foundIndex = answerChars.indexOf(char);
    if (foundIndex >= 0) {
      result[index] = 'present';
      answerChars[foundIndex] = null;
    }
  });

  return result;
}

module.exports = { WORD_LENGTH, evaluateGuess, getDailyWord, getTodayKey, isDateKey, normalizeLanguage, normalizeWord };
