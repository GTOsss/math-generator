const path = require('path');
const fs = require('fs');
const _ = require('lodash');
////// finally begin

const getCalcMethodName = (key) => `calc${_.upperFirst(_.camelCase(key))}`;

const numberWithSpaces = (value) => {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

const generateStrOperation = (operation, operands) =>
  operation(...operands);

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

const generateStrReturnValue = (constNames) => `{${constNames.join()}}`;

const generateStrAlgorithm = ({
  methodName = 'method', destructedArgs, body, returnValue,
}) => `const ${methodName} = (${destructedArgs}) => {
${body ? `${body}\n` : ''}
  return ${returnValue};
};`;

const generateStrCodeForTest = ({variables, methodName = 'method', algorithm}) =>
  `${algorithm}\n\n${methodName}(${JSON.stringify(variables)})`;

const getConstNames = (numberActions) => {
  const result = [];
  for (let i = 0; i < numberActions; i += 1) {
    result.push(`var${i}`);
  }

  return result;
};

const generateStrReturnMainMethod = (resultKeys) => resultKeys
  .reduce((acc, curr, i) => `${acc}    ${curr}: ${getCalcMethodName(curr)}(variables),\n`, '');

const getAlgorithm = ({
  numberActions, cases, operations, consoleLog
}) => {
  let counter = 0;
  const entriesVariables = Object.entries(cases[0].variables);
  const currentVariablesEntries = [];
  const results = [];
  const cycleForKeys = (depth = 0) => {
    for (let i = 0; i < entriesVariables.length; i += 1) {
      currentVariablesEntries[depth] = entriesVariables[i];
      const numberCycleForKeys = Math.max(numberActions, entriesVariables.length - 1);
      if (depth < numberCycleForKeys) {
        cycleForKeys(depth + 1);
      }

      if (depth === (entriesVariables.length - 1)) {
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
                console.log(`Прошло ${numberWithSpaces(counter / counterStep)} млн итераций`);
              }

              const algorithm = ({currentCase, maxIndex}) => {
                const result = {
                  successResultKey: undefined,
                  maxIndex: undefined,
                  resultValue: undefined,
                };
                const currentVariables = currentCase.variables;

                const countOperations = maxIndex ? maxIndex : currentOperations.length - 1;
                for (let k = 0; k <= countOperations; k += 1) {
                  const currentOperation = currentOperations[k];
                  const keyA = currentVariablesEntries[k][0];
                  const keyB = currentVariablesEntries[k + 1][0];
                  const a = k === 0 ? currentVariables[keyA] : result.resultValue;
                  const b = currentVariables[keyB];
                  result.resultValue = currentOperation(a, b);
                  Object.entries(currentCase.result).some(([key, value]) => {
                    if (value === result.resultValue) {
                      result.successResultKey = key;
                      result.maxIndex = k;
                      return true;
                    }
                  });
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
              cases.slice(1).some(({result, variables}, i) => {
                const {resultValue} = algorithm({
                  currentCase: {result, variables},
                  maxIndex,
                });
                if (resultValue === result[successResultKey]) {
                  successCount += 1;
                  return false;
                }

                return true;
              });
              if (successCount === (cases.length - 1)) {
                const strRowsBody = [];
                for (let k = 0; k <= maxIndex; k += 1) {
                  const currentOperation = currentOperations[k];
                  const a = k === 0 ? currentVariablesEntries[k][0] : `var${k - 1}`;
                  const b = currentVariablesEntries[k + 1][0];
                  const operationStr = currentOperation.toStr(a, b);
                  const strRowBody = generateStrRowBody(k, operationStr);
                  strRowsBody.push(strRowBody);
                }

                const method = generateStrAlgorithm({
                  methodName: getCalcMethodName(successResultKey),
                  destructedArgs: generateStrDestructedArgs(entriesVariables),
                  body: strRowsBody.join('\n'),
                  returnValue: `var${maxIndex}`,
                });

                results.push(method);

                if (consoleLog) {
                  console.log(`Найден алгоритм для получения ${successResultKey}. Итерация № ${numberWithSpaces(counter)}`);
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

  console.log(`Всего потребовалось ${counter} итераций.`);
  return results;

  // const currentPath = path.resolve(`${__dirname}/combinatorics-output.txt`);
  // fs.writeFileSync(currentPath, `Cleared`);
};

const main = ({
  numberActions, cases, operations, consoleLog
}) => {
  const numberOperations = operations.length;
  const numberVariables = Object.keys(cases[0].variables).length;

  const calcNumberIterations = ({numberActions, numberOperations, numberVariables}) => {
    const var0 = numberOperations ** numberActions;
    const var1 = numberVariables ** numberVariables;
    const var2 = var0 * var1;

    return var2;
  };

  const willIterations = calcNumberIterations({numberActions, numberOperations, numberVariables});
  console.log(`Потребуется ${willIterations}`);

  const resultMap = {};
  let maxLength = 0;
  const resultKeys = Object.keys(cases[0].result);
  resultKeys.forEach((resultKey) => {
    const currentCases = cases.map((c) => ({...c, result: {[resultKey]: c.result[resultKey]}}));
    resultMap[resultKey] = getAlgorithm({cases: currentCases, numberActions, operations, consoleLog});
    maxLength = Math.max(resultMap[resultKey].length);
  });

  const results = [];
  const separator = '////////////////////////////////////////////////////////////////';
  for (let i = 0; i < maxLength; i += 1) {
    let codeStr = '\n';
    resultKeys.map((resultKey) => {
      const currentMethod = resultMap[resultKey][0];
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

const test = ({numberActions, numberOperations, numberVariables}) => {
  const var0 = numberOperations ** numberActions;
  const var1 = numberVariables ** numberVariables;
  const var2 = var0 * var1;

  return {result: var2};
};

const variables = {
  numberActions: 5,
  numberOperations: 6,
  numberVariables: 3,
  // d: 3,
  // e: 10,
  // f: 500,
};

const variables2 = {
  numberActions: 7,
  numberOperations: 9,
  numberVariables: 3,
  // d: 10,
  // e: 20,
  // f: 500,
};

console.log(test(variables));
// console.log(test(variables2));

const currentPath = path.resolve(`${__dirname}/combinatorics-output.txt`);
fs.writeFileSync(currentPath, `Cleared`);

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
Math.factorial = calcFactorial;
const factorial = (a) => Math.factorial(a);
factorial.toStr = (a) => `Math.factorial(${a})`;

const operations = [
  plus,
  minus,
  multiply,
  divide,
  pow,
  factorial,
  // max,
  // sin,
  // cos,
];
const numberActions = 5;

// for (let i = 1; i <= 2; i += 1) {
main({
  operations,
  numberActions,
  consoleLog: true,
  cases: [
    {
      variables,
      result: test(variables),
    },
    {
      variables: variables2,
      result: test(variables2),
    },
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
    //   'variables': {'a': 1, 'b': 2, 'c': 3},
    //   'result': {'x': 2, 'y': 1.5}
    // },
    // {
    //   'variables': {'a': 2, 'b': 2, 'c': 2},
    //   'result': {'x': 4, 'y': 1}
    // },
    // {
    //   variables: {a: 1, b: 2},
    //   result: {x: 4}
    // },
  ],
});
// }
