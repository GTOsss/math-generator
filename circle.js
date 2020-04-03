const path = require('path');
const fs = require('fs');
const {getRandomFormulation} = require('./experimental-math');

const maxCountRestart = 100;

const start = () => {
  const numberIterations = 1000 * 1000 * 1;

  const result = getRandomFormulation({
    cases: [
      {variables: {ang: 180, PI: Math.PI, two: 2, r: 1, x: 0.66}, result: 0.75},
      {variables: {ang: 180, PI: Math.PI, two: 2, r: 1, x: 1}, result: -1},
      {variables: {ang: 180, PI: Math.PI, two: 2, r: 1, x: -1}, result: 1},
      {variables: {ang: 180, PI: Math.PI, two: 2, r: 1, x: 1}, result: 1},
      {variables: {ang: 180, PI: Math.PI, two: 2, r: 1, x: -1}, result: -1},
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
    numberActions: 1,
    inaccuracy: 0,
    withConsole: true,
    randomNumberActions: true,
    numberIterations,
    seconds: 60 * 2,
  });

  const resultArray = result.map(({strict, inaccuracy, result: r}) => ({strict, inaccuracy, result: r}));
  console.log(resultArray);
  console.log(`Get ${resultArray.length} items`);

  const currentPath = path.resolve(`${__dirname}/circle-result.js`);
  const separator = '///////////////////////';
  const resultStr = result.map(({strCodForTest, comment}) => `${separator}${comment}\n${strCodForTest}`).join('\n\n');

  fs.writeFileSync(currentPath, resultStr);

  return result.length;
};

for (let i = 0; i < maxCountRestart; i += 1) {
  const result = start();
  if (result) {
    break;
  }
}
