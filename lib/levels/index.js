import level1 from './level1.js';

function replacer(key, value) {
  // Filtering out properties
  if (typeof value === 'function') {
    return `__function__:${value.toString()}`;
  }
  return value;
}

function toJSON(components) {
  return JSON.stringify(components, replacer);
}

export default [toJSON(level1)];
