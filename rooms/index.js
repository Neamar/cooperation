import lvl1 from './1.js';
const rawLevels = [null, lvl1];

// Levels needs to be "jsonified" before use
const levels = rawLevels.map((level) => {
  function replacer(key, value) {
    // Stringify fat arrow functions
    if (typeof value === 'function') {
      return value.toString();
    }
    return value;
  }

  const s = JSON.stringify(level, replacer, 2);
  return s;
});

export default levels;
