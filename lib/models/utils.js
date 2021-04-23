export const getId = (prefix = '') => {
  const id = Math.random().toString().replace('0.', '');
  return prefix + id;
};
