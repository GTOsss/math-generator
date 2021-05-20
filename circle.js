const path = require('path');
const fs = require('fs');
const {getRandomFormulation} = require('./experimental-math');

const maxCountRestart = 0;

const test = ({a, b}) => {
  const var0 = Math.cos(a);
  const var1 = Math.cos(b);
  const var2 = var0 * var1;
  // const var3 = Math.sqrt(var1);
  // const var4 = var2 * var3;
  // const var5 = e ** var1;
  return {x: var2};
};

const values = [
  {a: 1, b: 5},
  {a: 1, b: -1},
  {a: 1, b: 3},
];

const start = () => {
  const numberIterations = 1000 * 1000 * 100;
  // const numberIterations = 100;

  const result = getRandomFormulation({
    cases: [
      {
        variables: { numberActions: 4, numberOperations: 3, numberVariables: 5},
        result: {numberIterations: 1265625}
      },
      // {
      //   variables: { numberActions: 4, numberOperations: 3, numberVariables: 6},
      //   result: {numberIterations: 22674816}
      // },


      // {
      //   'variables': {'const2': 2, 'i': 0, 'radius': 200, 'PI': 3.141592653589793, 'num': 50},
      //   'result': {'x': 0, 'y': 200}
      // },
      // {
      //   'variables': {'const2': 2, 'i': 9, 'radius': 200, 'PI': 3.141592653589793, 'num': 50},
      //   'result': {'x': 180.9654104932039, 'y': 85.15585831301453}
      // },
      // {
      //   'variables': {'const2': 2, 'i': 41, 'radius': 200, 'PI': 3.141592653589793, 'num': 50},
      //   'result': {'x': -180.9654104932039, 'y': 85.15585831301452}
      // },

      // {variables: {r: 4, x: 16}, result: {z: 4}},
      // {variables: {r: 8, x: 64}, result: {z: 8}},

      // {variables: {p: 500, translateZ: 100}, result: 0.8},
      // {variables: {p: 500, translateZ: 250}, result: 0.5},

      // {variables: {a: 1, b: 5}, result: 0.823964491331366},
      // {variables: {a: 7, b: 3}, result: -0.23609024225714081},

      // {variables: values[0], result: test(values[0])},
      // {variables: values[1], result: test(values[1])},
      // {variables: values[2], result: test(values[2])},

      // {variables: {a: 2, b: 2.5, c: 0.5}, result: 5.5},
      // {variables: {a: 1, b: 2.5, c: 0.5}, result: 3},

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
      // (a, b) => `${a} % ${b}`,
      (a, b) => `${a} ** ${b}`,

      // (a) => `Math.sqrt(${a})`,
      // (a) => `Math.sin(${a})`,
      // (a) => `Math.cos(${a})`,
      // (a) => `Math.floor(${a})`,
      // (a) => `Math.ceil(${a})`,
      // (a) => `Math.round(${a})`,
    ],
    numberActions: 4,
    inaccuracy: 0,
    withConsole: true,
    randomNumberActions: true, // todo протестить как влияет количество variables на минимальное количество экшенов
    numberIterations,
  });

  const resultArray = result.map(({result}) => result);
  // setTimeout(() => {
  //   console.log('\n', resultArray);
  //   console.log(`\nGet ${resultArray.length} items`);
  // });

  if (resultArray.length) {
    const currentPath = path.resolve(`${__dirname}/circle-result.js`);
    const separator = '//////////////////////////////////////////////////////////////////////////////////////////';
    const resultStr = result.map(({strCodForTest}) => `${separator}\n${strCodForTest}`).join('\n\n');

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

