export const randomPin = (numberLength) => {
  let r = '';
  for (let i = 0; i < numberLength; i++) {
    r += Math.floor(Math.random() * 10).toString();
  }
  return r;
};
