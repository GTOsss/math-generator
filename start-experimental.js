const {getRandomFormulation} = require('./experimental-math');
const fs = require('fs');
const path = require('path');

const cases = [ // составляем таблицу различных кейсов с переменными
  {
    variables: {
      max: 200, // 100% === 777
      current: 20, // текущее число
      percent: 100,
    },
    result: {result: 10}, // результат
  },
  {
    variables: {
      max: 777, // 100% === 777
      current: 200, // текущее число
      percent: 100,
    },
    result: {result: 25.74002574002574}, // результат
  },
];

const currentPath = path.resolve(`${__dirname}/experimental-math-output.txt`);
fs.writeFileSync(currentPath, 'cleared');

const result = getRandomFormulation({
  cases,
  numberIterations: 1000*1000*10,
  numberActions: 2,
  methodName: 'method',
  randomNumberActions: 0,
  inaccuracy: 0,
  withConsole: true,
  operations: [
    (a, b) => `${a} + ${b}`,
    (a, b) => `${a} - ${b}`,
    (a, b) => `${a} * ${b}`,
    (a, b) => `${a} / ${b}`,
    // (a, b) => `${a} ** ${b}`,
    // (a, b) => `${a} % ${b}`,
    // (a) => `Math.cos(${a})`,
    // (a) => `Math.sin(${a})`,
  ],
});

fs.writeFileSync(currentPath, result.map(({code}) => code).join('\n\n'));




