import level1 from './level1.js';

function replacer(key, value) {
  if (parseInt(key).toString() === key && value && value.type) {
    // Ensure all fields are available
    value = { state: 'inactive', visibility: [], data: {}, internalData: {}, behaviors: {}, ...value };
  }

  // Filtering out properties
  if (typeof value === 'function') {
    return value.toString();
  }
  return value;
}

export const toJSON = function toJSON(components) {
  return JSON.stringify(components, replacer);
};

export default [toJSON(level1)];
