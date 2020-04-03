// // если не известна функция: current/max*percent для подсчета процентов (20/200*100 = 10% от 200)
// // но известно при каких переменных получается резльутат, нужно сделать следующее:
// const cases = [ // составляем таблицу различных кейсов с переменными
//   {
//     variables: {
//       max: 200, // 100% === 777
//       current: 20, // текущее число
//       percent: 100,
//     },
//     result: 10, // результат
//   },
//   {
//     variables: {
//       max: 777, // 100% === 777
//       current: 200, // текущее число
//       percent: 100,
//     },
//     result: 25.74002574002574, // результат
//   },
// ];
//
// // и теперь вызываем
// getMapFormulation(cases, 100000, 3, 0);
// // В результате получим карту-объект в которой можно найти формулу current/max*percent
// теперь важно переписать формулу поставив скобки, алгоритм расчитывается слева направо

// eslint-disable-next-line import/no-extraneous-dependencies
const cliProgress = require('cli-progress');

const progressBar = new cliProgress.SingleBar({
  format: 'progress [{bar}] {percentage}% | ETA: {eta}s',
  barCompleteChar: '\u2588',
  barIncompleteChar: '\u2591',
  hideCursor: true,
});

const STEP_PROGRESSBAR = 100000;

const randomNumber = (min, max) => {
  const rand = min + Math.random() * (max + 1 - min);
  return Math.floor(rand);
};

const randomValue = (...values) => values[randomNumber(0, values.length - 1)];

const generateStrAlgorithm = ({
  methodName, destructedArgs, body, returnValue,
}) => `const ${methodName} = (${destructedArgs}) => {
${body}
  return ${returnValue};
};`;

const generateStrDestructedArgs = (variables) => {
  const keys = Object.keys(variables).join(', ');
  return `{${keys}}`;
};

const generateStrBodyRow = (index, operation) => `  const var${index} = ${operation};\n`;

const generateStrRandomOperation = (valueKeys, operations) => {
  const randomOperation = randomValue(...operations);
  const numberArgs = randomOperation.length;
  const args = (new Array(numberArgs)).fill(0).map(() => randomValue(...valueKeys));
  return randomOperation(...args);
};

const MAP_FOR_NO_DUPLICATE = {};

const getRandomFormulation = ({
  cases, numberIterations, numberActions = 1, methodName = 'method', randomNumberActions,
  inaccuracy = 0, withConsole, operations,
}) => {
  progressBar.start(numberIterations);
  const algorithms = [];

  for (let step = 0; step <= numberIterations; step += 1) {
    if (!(step % STEP_PROGRESSBAR)) {
      progressBar.update(step);
    }

    const {variables, result: expectedResult} = cases[0];
    const keysVariables = Object.keys(variables);

    const firstOperation = generateStrRandomOperation(Object.keys(variables), operations);
    const firstRow = generateStrBodyRow(0, firstOperation);

    let currentNumberActions = randomNumberActions ? randomNumber(0, numberActions) : numberActions;
    currentNumberActions = currentNumberActions <= 0 ? 1 : currentNumberActions;

    const rows = [firstRow];
    for (let i = 1; currentNumberActions > 1 && i < currentNumberActions - 1; i += 1) {
      const initializedVarKeys = (new Array(i)).fill(0).map((el, index) => `var${index}`);
      const operation = generateStrRandomOperation([...initializedVarKeys, ...keysVariables], operations);
      rows.push(generateStrBodyRow(i, operation));
    }

    const body = rows.join('');
    const initializedVarKeys = (new Array(currentNumberActions - 1)).fill(0).map((el, index) => `var${index}`);
    const returnValue = currentNumberActions > 1 ? generateStrRandomOperation(initializedVarKeys, operations) : 'var0';
    const destructedArgs = generateStrDestructedArgs(variables);
    const algorithmStr = generateStrAlgorithm({methodName, body, returnValue, destructedArgs});

    const valuesStr = JSON.stringify(variables, null, '  ');
    const strCodForTest = `${algorithmStr}\n\n${methodName}(${valuesStr});`;
    // eslint-disable-next-line no-eval
    const currentResult = eval(strCodForTest);
    const resultInaccuracy = expectedResult - currentResult;
    const strict = resultInaccuracy === 0;
    // eslint-disable-next-line max-len
    const comment = `// strict: ${strict} | expected: ${expectedResult} | result: ${currentResult} | inaccuracy: ${resultInaccuracy}`;

    const isSuccess = (expectedResult >= currentResult - inaccuracy) && (expectedResult <= currentResult + inaccuracy);
    const isNoDuplicate = !MAP_FOR_NO_DUPLICATE[algorithmStr];

    if (isSuccess && isNoDuplicate) {
      let countSuccess = 0;

      for (let i = 1; i < cases.length; i += 1) {
        const {variables: currVariables, result: currExpectedResult} = cases[i];
        const strCurrVariables = JSON.stringify(currVariables);
        const currStrCodForTest = `${algorithmStr}\n\n${methodName}(${strCurrVariables});`;
        // eslint-disable-next-line no-eval
        const currResult = eval(currStrCodForTest);

        if ((currExpectedResult >= currResult - inaccuracy) && (currExpectedResult <= currResult + inaccuracy)) {
          countSuccess += 1;
        } else {
          break;
        }
      }

      if (countSuccess === (cases.length - 1)) {
        if (withConsole) {
          console.log(`\n${comment}`);
          console.log(algorithmStr);
        }
        progressBar.update(step);
        MAP_FOR_NO_DUPLICATE[algorithmStr] = true;
        algorithms.push({
          code: algorithmStr,
          strCodForTest,
          comment,
          strict,
          inaccuracy: resultInaccuracy,
          result: currentResult,
        });
      }
    }
  }

  progressBar.update(numberIterations);
  progressBar.stop();
  return algorithms;
};

module.exports = {
  getRandomFormulation,
};
