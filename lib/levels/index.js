import level1 from './level1.js';

/**
 * Function used to stringify all primitive values, and functions too
 * @param {String} key
 * @param {*} value
 * @returns
 */
function jsonTokenizer(key, value) {
  if (parseInt(key).toString() === key && value && value.type) {
    // When looking at an object with a type key, and that is part of an array,
    // we know it's a component. We need to make sure it has every single field, so add defaults and merge back data.
    value = { state: 'inactive', visibility: [], data: {}, internalData: {}, behaviors: {}, ...value };
  }

  // Stringify functions to string for safekeeping
  if (typeof value === 'function') {
    return value.toString();
  }
  return value;
}

export const toJSON = function toJSON(components) {
  return JSON.stringify(components, jsonTokenizer);
};

export default [toJSON(level1)];
