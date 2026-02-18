const WORD_LENGTH = 5;

export const getTodayKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const hashString = (value) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

export const getDailyWord = (language, words, dateKey = getTodayKey()) => {
  const pool = words?.[language] || [];
  if (!pool.length) return '';
  const index = hashString(`${dateKey}:${language}`) % pool.length;
  return pool[index].toLowerCase();
};

export const evaluateGuess = (guess, answer) => {
  const result = new Array(WORD_LENGTH).fill('absent');
  const answerChars = answer.split('');
  const guessChars = guess.split('');

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
};

export const buildStorageKey = (language, dateKey) => `daily-word:${language}:${dateKey}`;

export const WORD_RULES = {
  WORD_LENGTH,
  MAX_GUESSES: 6
};
