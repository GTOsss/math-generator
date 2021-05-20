const path = require('path');
const fs = require('fs');
const {getRandomFormulation, randomNumber} = require('./combinatorics-math');
// 3x + 4
const maxCountRestart = 25000;

const test = ({a, b, c, d, e}) => {
  const var0 = Math.cos(a);
  const var1 = Math.cos(b);
  const var2 = var0 + var0;
  return {x: var2, y: var1};
};


const values = [
  {a: 1, b: 5, c: 24, d: 10, e: 5.1},
  {a: 1, b: -1, c: 32, d: 1, e: 1},
  {a: 1, b: 3, c: 36, d: 3, e: 4.1},
];

const start = () => {
  // const numberIterations = 1000 * 1000 * 0.25;
  const numberIterations = 500;

  // const randomCoif = randomNumber(2, 2);
  // const randomCoif2 = randomNumber(4, 4);
  // const randomCoif3 = randomNumber(5, 5);

  // console.log({randomCoif, randomCoif2, randomCoif3});

  const result = getRandomFormulation({
    cases: [ // составляем таблицу различных кейсов с переменными
      {
        variables: {
          max: 200, // 100% === 777
          current: 20, // текущее число
          percent: 100,
        },
        result: 10, // результат
      },
      {
        variables: {
          max: 777, // 100% === 777
          current: 200, // текущее число
          percent: 100,
        },
        result: 25.74002574002574, // результат
      },
    ],
    operations: [
      (a, b) => `${a} * ${b}`,
      (a, b) => `${a} / ${b}`,
      (a, b) => `${a} + ${b}`,
      (a, b) => `${a} - ${b}`,
      (a, b) => `${a} % ${b}`,
      // (a, b) => `${a} ** ${b}`,

      // (a) => `Math.sqrt(${a})`,
      // (a) => `Math.sin(${a})`,
      // (a) => `Math.cos(${a})`,
      // (a) => `Math.floor(${a})`,
      // (a) => `Math.ceil(${a})`,
      // (a) => `Math.round(${a})`,
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

  return result.length;
};

for (let i = 0; i < maxCountRestart; i += 1) {
  const result = start();
  // if (result) {
  //   break;
  // }
}
