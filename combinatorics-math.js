const path = require('path');
const fs = require('fs');
const _ = require('lodash');
////// finally begin

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
  `${algorithm}\n${methodName}(${JSON.stringify(variables)})`;

const getConstNames = (numberActions) => {
  const result = [];
  for (let i = 0; i < numberActions; i += 1) {
    result.push(`var${i}`);
  }

  return result;
};

const createCombinationOperations = ({variableKeys, operations}) => {
  const resultArray = [];

  for (let i = 0; i < variableKeys.length; i += 1) {   //// { количество циклов = максимальному количеству операндов операций: (a + b) = требуется 2 цикла
    const currInputKeyA = variableKeys[i];

    for (let l = 0; l < variableKeys.length; l += 1) { //// }
      const currInputKeyB = variableKeys[l];

      for (let j = 0; j < operations.length; j += 1) {
        const currOperation = operations[j];
        const operands = [currInputKeyA, currInputKeyB];
        resultArray.push(generateStrOperation(currOperation, operands));
      }
    }
  }

  return resultArray;
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

const createBodyRowsInCycle = ({operationCombinations, numberActions}) => {
  const currentOperations = [];
  const result = [];

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
          result.push(bodyRows.join('\n'));
        }
      }
    }

  };

  cycle(0);
  return result;
};

const createCombinationOperationsWithVariables = ({constNames, operations, variableKeys: varKeys}) => {

  const variableKeys = [...varKeys, ...constNames];
  return createCombinationOperations({operations, variableKeys});
};

////// finally end

/////////////////////////////////// experimental

const variables = {
  a: 1,
  b: 2,
  // c: 3,
  // d: 4,
  // e: 5,
  // f: 6,
  // i: 7
};
const operations = [
  (a, b) => `${a} + ${b}`,
  (a, b) => `${a} - ${b}`,
  // (a, b) => `${a} * ${b}`,
  // (a, b) => `${a} / ${b}`,
  // (a, b) => `${a} ** ${b}`,
  // (a, b) => `${a} % ${b}`,
  // (a) => `Math.cos(${a})`,
];

const result = {x: 'x', y: 'y', c: 'c'};

const numberActions = 2;

//todo экспешен о недопустимых variables: var0, var1 ... и тд
const getAlgorithm = ({cases, operations, numberActions}) => {
  for (let c = 0; c < cases.length; c += 1) {
    const {variables, result} = cases[c];

    const variableKeys = Object.keys(variables);
    const constNames = getConstNames(numberActions);

    const operationCombinations = createCombinationOperationsWithVariables({constNames, operations, variableKeys});
    const bodyRows = createBodyRowsInCycle({numberActions, operationCombinations});

    const destructedArgs = generateStrDestructedArgs(variables);
    const returnValue = generateStrReturnValue(constNames);

    const algorithms = [];

    for (let i = 0; i < bodyRows.length; i += 1) {
      const body = bodyRows[i];
      const algorithm = generateStrAlgorithm({destructedArgs, body, returnValue});
      const strCodeForTest = generateStrCodeForTest({variables, algorithm});
      const result = eval(strCodeForTest);

      /// experimental {
      const keysExpectedResult = Object.keys(result);
      const keysResult = Object.keys(result);

      for (let j = 0; j < keysExpectedResult.length; j += 1) {
        const expectedResultKeyA = keysExpectedResult[j];

        for (let k = 0; k < keysResult.length; k += 1) {
          // const resultKeyA = keysResult[k];
          console.log(expectedResultKeyA);
        }
      }
      /// }

      algorithms.push(algorithm);
    }

    console.log(algorithms.length);

    const currentPath = path.resolve(`${__dirname}/combinatorics-output.txt`);
    fs.writeFileSync(currentPath, `/////////////\n\n${algorithms.join('\n\n')}`);
  }
};

getAlgorithm({
  cases: [
    {
      'variables': {'a': 1, 'b': 1, 'c': 1},
      'result': {'x': 2, 'y': 3}
    },
    // {
    //   'variables': {'a': 2, 'b': 2, 'c': 2},
    //   'result': {'x': 4, 'y': 6}
    // },
    // {
    //   'variables': {'a': 10, 'b': 10, 'c': 10},
    //   'result': {'x': 20, 'y': 30}
    // },
  ],
  operations: [
    (a, b) => `${a} + ${b}`,
    (a, b) => `${a} - ${b}`,
    // (a, b) => `${a} * ${b}`,
    // (a, b) => `${a} / ${b}`,
    // (a, b) => `${a} ** ${b}`,
    // (a, b) => `${a} % ${b}`,
    // (a) => `Math.cos(${a})`,
  ],
  numberActions: 2,
});
