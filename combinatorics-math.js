const path = require('path');
const fs = require('fs');
const _ = require('lodash');

const generateStrOperation = (operation, operands) =>
  operation(...operands);

const generateStrRowBody = (constIndex, operationStr) =>
  `  const var${constIndex} = ${operationStr};`;

const generateStrDestructedArgs = (variables) => {
  const keys = Object.keys(variables).join(', ');
  return `{${keys}}`;
};

const generateStrReturnValue = (constNames) => `{${constNames.join()}}`;

const generateStrAlgorithm = ({
  methodName = 'method', destructedArgs, body, returnValue,
}) => `const ${methodName} = (${destructedArgs}) => {
${body}

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

const createCombinationOperations = ({variableKeys, operations}) => {
  const resultMap = {};

  for (let i = 0; i < variableKeys.length; i += 1) {   //// { количество циклов = максимальному количеству операндов операций: (a + b) = требуется 2 цикла
    const currInputKeyA = variableKeys[i];

    for (let l = 0; l < variableKeys.length; l += 1) { //// }
      const currInputKeyB = variableKeys[l];

      for (let j = 0; j < operations.length; j += 1) {
        const currOperation = operations[j];
        const operands = [currInputKeyA, currInputKeyB];
        const strOperation = generateStrOperation(currOperation, operands);
        resultMap[strOperation] = 0;
      }
    }
  }

  return Object.keys(resultMap);
};

/**
 * Вернет true если индекс допустимый
 * @param constName
 * @param maxIndex Максимально допустимый индекс
 */
const checkMaxIndexOfConstName = (constName, maxIndex) => {
  const matches = constName.replace(/\s/g, '').match(/var[0-9]+/g);
  if (!matches) { // если не было найдено констант
    return true;
  }

  if (maxIndex === -1) { // если была найдена константа на 1-й итерации (знаем что была константа из-за проверки сверху)
    return false;
  }

  const constIndexes = matches.map((name) => +name.match(/[0-9]+/g));
  return !constIndexes.some((constIndex) => constIndex > maxIndex);
};

const main = ({
  numberActions, cases, operations
}) => {
  const currentOperations = [];
  const algorithms = [];
  // console.log({operationCombinationsLength: operationCombinations.length, numberActions});
  // console.log('Потребуется итераций: ', numberIterations);
  let counter = 0;
  const variables = cases[0].variables;
  const expectedResult = cases[0].result;
  const variableKeys = Object.keys(variables);
  const constNames = getConstNames(numberActions);
  const operationCombinations = createCombinationOperationsWithVariables({
    constNames, operations, variableKeys,
  });
  const destructedArgs = generateStrDestructedArgs(variables);
  const returnValue = generateStrReturnValue(constNames);

  const cycle = (depth = 0) => {
    for (let i = 0; i < operationCombinations.length; i += 1) {
      currentOperations[depth] = operationCombinations[i];
      if (depth < numberActions) {
        // setTimeout(cycle, 0, depth + 1);
        cycle(depth + 1); // todo переделать на setTimeout
      }
      let bodyRows = [];

      if (depth === numberActions - 1) {
        let isOk = true;
        for (let l = 0; l < numberActions; l += 1) {
          const noCancel = checkMaxIndexOfConstName(currentOperations[l], l - 1);
          if (noCancel) {
            bodyRows.push(generateStrRowBody(l, currentOperations[l]));
          } else {
            isOk = false;
            break;
          }
        }

        if (isOk) {
          const body = bodyRows.join('\n');
          const algorithm = generateStrAlgorithm({destructedArgs, body, returnValue});
          const strCodeForTest = generateStrCodeForTest({variables, algorithm});
          // console.log(strCodeForTest);
          const currentResult = eval(strCodeForTest);

          /// experimental {
          const keysExpectedResult = Object.keys(expectedResult);
          const keysCurrentResult = Object.keys(currentResult);

          const depthCurrentKey = [];
          const cycleWrap = (depth = 0) => {
            for (let j = 0; j < keysCurrentResult.length; j += 1) {
              depthCurrentKey[depth] = keysCurrentResult[j];

              if (depth < (keysCurrentResult.length - 1)) {
                cycleWrap(depth + 1);
              }

              if (depth === (keysCurrentResult.length - 1)) {
                const depthExpectedKey = [];
                const cycleInner = (depthInner = 0) => {
                  for (let k = 0; k < keysExpectedResult.length; k += 1) {
                    depthExpectedKey[depthInner] = keysExpectedResult[k];

                    if (depthInner < (keysExpectedResult.length - 1)) {
                      cycleInner(depthInner + 1);
                    }

                    if (depthInner === (keysExpectedResult.length - 1)) {
                      let countEqual = 0;
                      const constNamesAndKeysNames = [];
                      const mapConstNamesAndKeyNames = {};
                      for (let l = 0; l < depthExpectedKey.length; l += 1) {
                        const keyA = depthExpectedKey[l];
                        const keyB = depthCurrentKey[l];
                        counter++;
                        if (!(counter % 1000000)) {
                          console.log(`Прошло итераций: ${counter / 1000000}млн`);
                        }

                        if (expectedResult[keyA] === currentResult[keyB]) {
                          countEqual += 1;
                          mapConstNamesAndKeyNames[keyA] = keyB;
                          constNamesAndKeysNames.push([keyA, keyB]);
                        }

                        if (countEqual === depthExpectedKey.length) {
                          const countKeys = Object.keys(mapConstNamesAndKeyNames).length;
                          if (countKeys === keysExpectedResult.length) {
                            const returnValues = constNamesAndKeysNames
                              .map(([keyName, constName]) => `${keyName}: ${constName}`).join(', ');
                            const returnValue = `{${returnValues}}`;
                            // console.log(returnValues);
                            const algorithm = generateStrAlgorithm({destructedArgs, body, returnValue});
                            let successNumber = 0;
                            for (let b = 0; b < cases.length; b += 1) {
                              const strCodeForTest = generateStrCodeForTest({variables: cases[b].variables, algorithm});
                              const result = eval(strCodeForTest);
                              const success = _.isEqual(result, cases[b].result);
                              if (success) {
                                successNumber += 1;
                              }

                              if (successNumber === cases.length) {
                                console.log(strCodeForTest);
                                console.log('\n//////////////////////////////////////////////////////////////');
                                algorithms.push(strCodeForTest);

                                const currentPath = path.resolve(`${__dirname}/combinatorics-output.txt`);
                                const separator = '/////////////////////////////////////////////////';
                                fs.writeFileSync(
                                  currentPath,
                                  `${separator}\n\n${algorithms.join(`\n\n${separator}\n\n`)}`
                                );
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                };

                cycleInner();
              }
            }

          };

          cycleWrap();
        }
      }
    }
  };

  cycle(0);
  console.log(counter);
  // return result;
};

const createCombinationOperationsWithVariables = ({constNames, operations, variableKeys: varKeys}) => {

  const variableKeys = [...varKeys, ...constNames];
  return createCombinationOperations({operations, variableKeys});
};

/////////////////////////////////// experimental

//todo экспешен о недопустимых variables: var0, var1 ... и тд в cases
// const getAlgorithm = ({cases, operations, numberActions}) => {
//   for (let c = 0; c < cases.length; c += 1) {
//     const {variables, result: expectedResult} = cases[c];
//
//     const operationCombinations = createCombinationOperationsWithVariables({constNames, operations, variableKeys});
//     console.log('Возможных комбинаций экшенов:', operationCombinations.length);
//     const bodyRows = createBodyRowsInCycle({numberActions, operationCombinations});
// console.log('Возможных комбинаций методов:', bodyRows.length);

// for (let i = 0; i < bodyRows.length; i += 1) {

// console.log('\n');
// }

// console.log(algorithms.length);

// const currentPath = path.resolve(`${__dirname}/combinatorics-output.txt`);
// const separator = '/////////////////////////////////////////////////';
// fs.writeFileSync(currentPath, `${separator}\n\n${algorithms.join(`\n\n${separator}\n\n`)}`);
// }
// };

const test = ({a, b, c, d, e, f}) => {
  const var0 = a + b;
  const var1 = var0 / c;
  const var2 = var1 + a;
  const var3 = var2 - d;

  return {x: var3, y: var2}
};

const variables = {
  a: 10,
  b: 2,
  c: 3,
  d: 10,
  // e: 10,
  // f: 10,
};

const variables2 = {
  a: 100,
  b: 1,
  c: 5,
  d: 10,
  // e: 10,
  // f: 10,
};

console.log(test(variables));
console.log(test(variables2));

const currentPath = path.resolve(`${__dirname}/combinatorics-output.txt`);
fs.writeFileSync(currentPath, `Cleared`);

main({
  cases: [
    // {
    //   variables: {numberOperations: 1, numberVariables: 2, numberActions: 1},
    //   result: {numberIterations: 4},
    // },
    // {
    //   variables: {numberOperations: 1, numberVariables: 3, numberActions: 1},
    //   result: {numberIterations: 9},
    // },
    // {
    //   variables: {numberOperations: 2, numberVariables: 3, numberActions: 2},
    //   result: {numberIterations: 2304},
    // },

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
    // 'variables': {'a': 10, 'b': 10},
    // 'result': {'x': 20}
    // },
  ],
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
  numberActions: 4,
});
