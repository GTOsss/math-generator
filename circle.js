const path = require('path');
const fs = require('fs');
const {getRandomFormulation} = require('./experimental-math');

const maxCountRestart = 100;

const test = ({a, b, c, d, e}) => {
  const var0 = Math.cos(a);
  const var1 = Math.cos(b);
  const var2 = var0 * d;
  const var3 = Math.sqrt(c);
  const var4 = var2 * var3;
  const var5 = e ** var1;
  return var5 + var4;
};

const values = [
  {a: 1, b: 5, c: 24, d: 10, e: 5.1},
  {a: 1, b: -1, c: 32, d: 1, e: 1},
  {a: 1, b: 3, c: 36, d: 3, e: 4.1},
];

const start = () => {
  const numberIterations = 1000 * 1000 * 900;

  const result = getRandomFormulation({
    cases: [
      // {variables: {r: 4, x: 1.6}, result: 1.2},
      // {variables: {r: 4, x: 0.56}, result: 1.92},

      // {variables: {p: 500, translateZ: 100}, result: 0.8},
      // {variables: {p: 500, translateZ: 250}, result: 0.5},

      // {variables: {a: 1, b: 5}, result: 0.823964491331366},
      // {variables: {a: 7, b: 3}, result: -0.23609024225714081},

      {variables: values[0], result: test(values[0])},
      {variables: values[1], result: test(values[1])},
      {variables: values[2], result: test(values[2])},

      // {variables: {a: 1, b: 2.5, c: 0.5}, result: 3},
      // {variables: {a: 2, b: 2.5, c: 0.5}, result: 5.5},

      // {variables: {ang: 180, PI: Math.PI, two: 2, r: 1, x: 0.66}, result: 0.75},
      // {variables: {ang: 180, PI: Math.PI, two: 2, r: 1, x: 1}, result: -1},
      // {variables: {ang: 180, PI: Math.PI, two: 2, r: 1, x: -1}, result: 1},
      // {variables: {ang: 180, PI: Math.PI, two: 2, r: 1, x: 1}, result: 1},
      // {variables: {ang: 180, PI: Math.PI, two: 2, r: 1, x: -1}, result: -1},
    ],
    operations: [
      (a, b) => `${a} * ${b}`,
      (a, b) => `${a} / ${b}`,
      (a, b) => `${a} + ${b}`,
      (a, b) => `${a} - ${b}`,
      (a, b) => `${a} % ${b}`,
      (a, b) => `${a} ** ${b}`,

      (a) => `Math.sqrt(${a})`,
      (a) => `Math.sin(${a})`,
      (a) => `Math.cos(${a})`,
      (a) => `Math.floor(${a})`,
      (a) => `Math.ceil(${a})`,
      (a) => `Math.round(${a})`,
    ],
    numberActions: 15,
    inaccuracy: 0,
    withConsole: true,
    randomNumberActions: true,
    numberIterations,
  });

  const resultArray = result.map(({strict, inaccuracy, result: r}) => ({strict, inaccuracy, result: r}));
  console.log(resultArray);
  console.log(`Get ${resultArray.length} items`);

  if (resultArray.length) {
    const currentPath = path.resolve(`${__dirname}/circle-result.js`);
    const separator = '///////////////////////';
    const resultStr = result.map(({strCodForTest, comment}) => `${separator}${comment}\n${strCodForTest}`).join('\n\n');

    fs.writeFileSync(currentPath, resultStr);
  }

  return result.length;
};

start();

for (let i = 0; i < maxCountRestart; i += 1) {
  const result = start();
  if (result) {
    break;
  }
}
