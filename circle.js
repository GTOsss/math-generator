const path = require('path');
const fs = require('fs');
const {getRandomFormulation} = require('./experimental-math');

const maxCountRestart = 0;

const test = ({a, b, c, PI}) => {
  const var0 = Math.cos(a);
  const var1 = Math.cos(b);
  const var2 = var0 * var1;
  const var3 = PI * c;
  return var2 - var3;
};

const values = [
  {a: 1, b: 5, c: 30},
  {a: 1, b: -1, c: 1},
  {a: 1, b: 3, c: 7},
];

const start = () => {
  const numberIterations = 1000 * 1000 * 100;

  const result = getRandomFormulation({
    cases: [
      {variables: values[0], result: test(values[0])},
      {variables: values[1], result: test(values[1])},
      {variables: values[2], result: test(values[2])},

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

      // (a) => `Math.sqrt(${a})`,
      (a) => `Math.sin(${a})`,
      (a) => `Math.cos(${a})`,
      // (a) => `Math.floor(${a})`,
      // (a) => `Math.ceil(${a})`,
      // (a) => `Math.round(${a})`,
    ],
    numberActions: 5,
    inaccuracy: 0,
    withConsole: true,
    randomNumberActions: false,
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
