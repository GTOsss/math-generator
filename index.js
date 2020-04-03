const path = require('path');
const fs = require('fs');
const {getRandomFormulation} = require('./experimental-math');

// const numberIterations = 1000 * 1000 * 100;
const numberIterations = 1000;

const result = getRandomFormulation({
  cases: [
    {variables: {a: 100, b: 2}, result: 50},
    {variables: {a: 150, b: 3}, result: 50},
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
});

const resultArray = result.map(({strict, inaccuracy, result: r}) => ({strict, inaccuracy, result: r}));
console.log(resultArray);
console.log(`Get ${resultArray.length} items`);

const currentPath = path.resolve(`${__dirname}/index-result.js`);
const separator = '///////////////////////';
const resultStr = result.map(({strCodForTest, comment}) => `${separator}${comment}\n${strCodForTest}`).join('\n\n');
fs.writeFileSync(currentPath, resultStr);
