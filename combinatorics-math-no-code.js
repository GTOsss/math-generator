const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const cliProgress = require('cli-progress');

const progressBar = new cliProgress.SingleBar({
  format: 'progress [{bar}] {percentage}% | ETA: {eta_formatted}',
  barCompleteChar: '\u2588',
  barIncompleteChar: '\u2591',
  hideCursor: true,
  barsize: 100,
});

////// finally begin
const plus = (a, b) => a + b;
plus.toStr = (a, b) => `${a} + ${b}`;
const minus = (a, b) => a - b;
minus.toStr = (a, b) => `${a} - ${b}`;
const multiply = (a, b) => a * b;
multiply.toStr = (a, b) => `${a} * ${b}`;
const divide = (a, b) => a / b;
divide.toStr = (a, b) => `${a} / ${b}`;
const pow = (a, b) => a ** b;
pow.toStr = (a, b) => `${a} ** ${b}`;
const max = (a, b) => Math.max(a, b);
max.toStr = (a, b) => `Math.max(${a}, ${b})`;
const cos = (a) => Math.cos(a);
cos.toStr = (a) => `Math.cos(${a})`;
const sin = (a) => Math.sin(a);
sin.toStr = (a) => `Math.sin(${a})`;
// const doNothing = (a) => a;
// doNothing.toStr = (a) => `${a}`;

const calcFactorial = (num) => {
  let result = 1;

  if (21 < num) {
    return Infinity;
  }

  for (let i = 2; i <= num; i += 1) {
    result = result * i;
  }

  return result;
};
// Math.doNothing = doNothing;
Math.factorial = calcFactorial;
const factorial = (a) => Math.factorial(a);
factorial.toStr = (a) => `Math.factorial(${a})`;

const getCalcMethodName = (key) => `calc${_.upperFirst(_.camelCase(key))}`;

const numberWithSpaces = (value) => {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

const generateStrRowBody = (constIndex, operationStr) =>
  `  const var${constIndex} = ${operationStr};`;

const generateStrDestructedArgs = (entriesVariables) => {
  const keys = entriesVariables.reduce((acc, [key], i) => {
    if (i !== (entriesVariables.length - 1)) {
      return `${acc}${key}, `;
    }

    return `${acc}${key}`
  }, '');
  return `{${keys}}`;
};

const generateStrAlgorithm = ({
  methodName = 'method', destructedArgs, body, returnValue,
}) => `const ${methodName} = (${destructedArgs}) => {
${body ? `${body}\n` : ''}
  return ${returnValue};
};`;

const generateStrReturnMainMethod = (resultKeys) => resultKeys
  .reduce((acc, curr) => `${acc}    ${curr}: ${getCalcMethodName(curr)}(variables),\n`, '');

const compareWithInaccuracy = (a, b, inaccuracy) => {
  const expectedResultPlus = b + inaccuracy;
  const expectedResultMinus = b - inaccuracy;
  return (a >= expectedResultMinus) && (a <= expectedResultPlus);
};

const getAlgorithm = ({
  numberActions, cases, operations, consoleLog, inaccuracy = 0,
}) => {
  let counter = 0;
  const entriesVariables = Object.entries(cases[0].variables);
  const currentVariablesEntries = [];
  const results = [];
  const cycleForKeys = (depth = 0) => {
    for (let i = 0; i < entriesVariables.length; i += 1) {
      currentVariablesEntries[depth] = entriesVariables[i];
      const numberCycleForKeys = Math.max(numberActions, entriesVariables.length);
      if (depth < numberCycleForKeys) {
        cycleForKeys(depth + 1);
      }

      if (depth === (entriesVariables.length)) {
        const currentOperations = [];
        const cycleForOperations = (depth = 0) => {
          for (let j = 0; j < operations.length; j += 1) {
            currentOperations[depth] = operations[j];
            if (depth < (numberActions - 1)) {
              cycleForOperations(depth + 1);
            }
            if (depth === numberActions - 1) {
              counter += 1;

              const counterStep = (10 ** 6);
              if (consoleLog && !(counter % counterStep)) {
                progressBar.update(counter);
                // console.log(`Прошло ${numberWithSpaces(counter / counterStep)} млн итераций`);
              }

              const algorithm = ({currentCase, maxIndex}) => {
                const result = {
                  successResultKey: undefined,
                  maxIndex: undefined,
                  resultValue: undefined,
                };
                const currentVariables = currentCase.variables;

                const countOperations = maxIndex ? maxIndex : currentOperations.length - 1;
                let preventOperation = undefined;
                for (let k = 0; k <= countOperations; k += 1) {
                  const currentOperation = currentOperations[k];
                  const keyA = currentVariablesEntries[k][0];
                  const kOffset = preventOperation ? preventOperation.length - 1 : 1;
                  const keyB = currentVariablesEntries[k + kOffset][0];
                  const a = k === 0 ? currentVariables[keyA] : result.resultValue;
                  const b = currentVariables[keyB];
                  result.resultValue = currentOperation(a, b);
                  Object.entries(currentCase.result).some(([key, value]) => {
                    if (compareWithInaccuracy(value, result.resultValue, inaccuracy)) {
                      result.successResultKey = key;
                      result.maxIndex = k;
                      return true;
                    }
                  });
                  preventOperation = currentOperation;
                }

                return result;
              };

              const {successResultKey, maxIndex} = algorithm({
                variables: currentVariablesEntries,
                currentCase: cases[0],
              });

              if (!successResultKey) {
                continue;
              }

              let successCount = 0;
              cases.slice(1).some(({result, variables}) => {
                const {resultValue} = algorithm({
                  currentCase: {result, variables},
                  maxIndex,
                });
                if (compareWithInaccuracy(resultValue, result[successResultKey], inaccuracy)) {
                  successCount += 1;
                  return false;
                }

                return true;
              });
              if (successCount === (cases.length - 1)) {
                const strRowsBody = [];
                let preventOperation = undefined;
                for (let k = 0; k <= maxIndex; k += 1) {
                  const currentOperation = currentOperations[k];
                  const a = k === 0 ? currentVariablesEntries[k][0] : `var${k - 1}`;
                  const kOffset = preventOperation ? preventOperation.length - 1 : 1;
                  const b = currentVariablesEntries[k + kOffset][0];
                  const operationStr = currentOperation.toStr(a, b);
                  const strRowBody = generateStrRowBody(k, operationStr);
                  strRowsBody.push(strRowBody);
                  preventOperation = currentOperation;
                }

                const method = generateStrAlgorithm({
                  methodName: getCalcMethodName(successResultKey),
                  destructedArgs: generateStrDestructedArgs(entriesVariables),
                  body: strRowsBody.join('\n'),
                  returnValue: `var${maxIndex}`,
                });

                results.push(method);

                if (consoleLog) {
                  console.log(`\nНайден алгоритм для получения ${successResultKey}. Итерация № ${numberWithSpaces(
                    counter)}`);
                  console.log(method, '\n');
                }
              }
            }
          }
        };

        cycleForOperations(0);
      }
    }
  };

  cycleForKeys(0);

  progressBar.update(counter);
  console.log(`\nВсего потребовалось ${counter} итераций.`);
  progressBar.stop();
  return results;

  // const currentPath = path.resolve(`${__dirname}/combinatorics-output.txt`);
  // fs.writeFileSync(currentPath, `Cleared`);
};

const main = ({
  numberActions, cases, operations, consoleLog, withProgressbar, inaccuracy,
}) => {
  const numberOperations = operations.length;
  const numberVariables = Object.keys(cases[0].variables).length;

  console.log({numberActions, numberOperations, numberVariables});

  // const calcNumberIterations = ({numberActions, numberOperations, numberVariables}) => {
  //   const var0 = numberVariables ** numberOperations;
  //   const var1 = var0 * (numberOperations ** numberActions);
  //
  //   return var1;
  // };

  // const willIterations = calcNumberIterations({numberActions, numberOperations, numberVariables});
  // const oneBillion = 10 ** 6;
  // const suffix = willIterations > oneBillion ? ' млн' : '';
  // const numberBillion = numberWithSpaces(Math.ceil(willIterations / oneBillion));
  // const numberIterationStr = numberWithSpaces(willIterations);
  // if (willIterations > oneBillion) {
  //   console.log(`Потребуется около ${numberBillion}${suffix} итераций | точное значение: ${numberIterationStr}`);
  // } else {
  //   console.log(`Потребуется итераций: ${numberIterationStr}`);
  // }
  // if (withProgressbar) {
  //   progressBar.start(willIterations);
  // }

  const resultMap = {};
  let maxLength = 0;
  const resultKeys = Object.keys(cases[0].result);
  resultKeys.forEach((resultKey) => {
    const currentCases = cases.map((c) => ({...c, result: {[resultKey]: c.result[resultKey]}}));
    resultMap[resultKey] = getAlgorithm({cases: currentCases, numberActions, operations, consoleLog, inaccuracy});
    maxLength = Math.max(resultMap[resultKey].length);
    // todo исправить Math.max
  });

  const results = [];
  const separator = '////////////////////////////////////////////////////////////////';
  for (let i = 0; i < maxLength; i += 1) {
    let codeStr = '\n';
    resultKeys.map((resultKey) => {
      const currentMethod = resultMap[resultKey][i];
      codeStr = `${codeStr}${currentMethod}\n\n`;
    });

    const returnValue = `{\n${generateStrReturnMainMethod(resultKeys)}  }`;
    const destructedArgs = 'variables';
    const strMethod = generateStrAlgorithm({destructedArgs, returnValue});
    codeStr = `\n${codeStr}${strMethod}\n`;
    results.push(codeStr);
  }

  const currentPath = path.resolve(`${__dirname}/combinatorics-output.txt`);
  fs.writeFileSync(currentPath, results.join(`\n${separator}\n`));
};

////// finally end

const test = ({_2, num, i, PI, radius}) => {
  const var0 = _2 - num;
  const var1 = var0 + _2;
  // const var2 = var1 * PI;
  // const var3 = Math.sin(var2);
  // const var4 = Math.cos(var2);
  // const var5 = var3 * radius;
  // const var6 = var4 * radius;
  return {
    x: 'var1',
    // y: var6,
  }
};

const variables = {
  _2: 5,
  num: 6,
  i: 3,
  PI: 9,
  // radius: 8,
  // e: 10,
  // f: 500,
};

const variables2 = {
  _2: 4,
  num: 2,
  i: 7,
  PI: 3,
  // radius: 8,
  // d: 10,
  // e: 20,
  // f: 500,
};

// console.log(test(variables));
// console.log(test(variables2));

const currentPath = path.resolve(`${__dirname}/combinatorics-output.txt`);
fs.writeFileSync(currentPath, `Cleared`);

const operations = [
  plus,
  minus,
  multiply,
  divide,
  pow,
  // doNothing,
  factorial,
  max,
  // sin,
  // cos,
];
const numberActions = 6;

// for (let i = 1; i <= 2; i += 1) {
main({
  // inaccuracy: 0.9,
  inaccuracy: 0,
  operations,
  numberActions,
  consoleLog: true,
  // withProgressbar: true,
  cases: [
    // {
    //   variables: {perspective: 500, translateZ: 400, scale: 0.2},
    //   result: {translateX: 600}
    // },
    // {
    //   variables: {perspective: 500, translateZ: 210, scale: 0.58},
    //   result: {translateX: 63}
    // },
    // {
    //   variables: {perspective: 500, translateZ: 150, scale: 0.7},
    //   result: {translateX: 45}
    // },
    // {
    //   variables: {perspective: 500, translateZ: 0, scale: 1},
    //   result: {translateX: 0}
    // },

    // {
    //   variables: {perspective: 500, translateZ: 100},
    //   result: {scale: 0.8}
    // },
    // {
    //   variables: {perspective: 500, translateZ: 300},
    //   result: {scale: 0.4}
    // },

    // {
    //   variables,
    //   result: test(variables),
    // },
    // {
    //   variables: variables2,
    //   result: test(variables2),
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
    // {
    //   'variables': {a: 1.5, b: 3.5, c: 10, d: 5}, // (a + b) - (c + d)
    //   'result': {result: 10}
    // },

    // {
    //   'variables': {'a': 2, 'b': 2, 'c': 2},
    //   'result': {'x': 4, 'y': 1}
    // },

    // {
    //   variables: { numberActions: 4, numberOperations: 7, numberVariables: 2 },
    //   result: {numberIterations: 19208}
    // },
    // {
    //   variables: { numberActions: 4, numberOperations: 7, numberVariables: 3 },
    //   result: {numberIterations: 194481}
    // },
    // {
    //   variables: { numberActions: 4, numberOperations: 7, numberVariables: 4 },
    //   result: {numberIterations: 2458624}
    // },
    {
      variables: {numberActions: 4, numberOperations: 3, numberVariables: 5, one: 2},
      result: {numberIterations: 1265625}
    },
    {
      variables: {numberActions: 4, numberOperations: 3, numberVariables: 6, one: 2},
      result: {numberIterations: 22674816}
    },
  ],
});
// }

//todo Алгоритм работает не плохо, но он не умеет создавать
// комбинации из 2 переменных в которых используются аргументы и не используется предыдущие переменные.
// иными словами, генерируется только цепочка действий без возможности сделать 2 ветви действия
