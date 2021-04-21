import lvl1 from './1.js';
const rawLevels = [null, lvl1];

const defaultComponent = {
  type: 'text',
  state: 'inactive',
  visibility: [],
  data: {},
  behaviors: {},
};

// Levels needs to be "jsonified" before use
const levels = rawLevels.map((level) => {
  if (!level) {
    return null;
  }
  // Properly build each component
  level.components = level.components.map((component) => ({ ...defaultComponent, ...component }));
  level.state = 'GATHERING_PLAYERS';
  level.players = [];

  function replacer(key, value) {
    // Stringify fat arrow functions
    if (typeof value === 'function') {
      return value.toString();
    }
    return value;
  }

  const s = JSON.stringify(level, replacer);
  return s;
});

export default levels;
