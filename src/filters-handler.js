import { debouncedRender } from './services/mapd-connector';

let currentFilters = '';
let fields = {};
const ASYNC_TIMEOUT = 250;

// Due to contraints of Qlik letting user know whether data has a range within it.  We will assume
// that series data will have more than 25 selections in it.  Otherwise we will treat each selection
// as an individual filter
const SERIES_LIMIT = 25;

function isFloat(n) {
  return n === +n && n !== (n | 0);
}

function isInteger(n) {
  return n === +n && n === (n | 0);
}

function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}

function isSeries(arr) {
  var arrToCheck;
  if (!arr.length || arr.length < SERIES_LIMIT) return false;
  var firstVal = arr[0];

  if (isFloat(firstVal) || isInteger(firstVal)) {
    arrToCheck = arr;
  } else if (isValidDate(new Date(firstVal))) {
    arrToCheck = arr.map(val => {
      return new Date(val);
    });
  } else {
    return false;
  }

  // Ideally we'd like to have a delta here, but unfortunately Qlik has a random interval of dates
  // Eg. May 3rd, May 10th, May 13th, May 20th
  // which makes it unpredictable.

  for (var i = 1; i < SERIES_LIMIT; i++) {
    if (arrToCheck[i + 1] - arrToCheck[i] < 0) {
      return false;
    }
  }

  return true;
}

export const uncoverDataType = (key, value) => {
  if (key.indexOf('[') !== -1) {
    return 'HISTOGRAM';
  } else if (isSeries(value)) {
    return 'SERIES';
  } else {
    return 'INDIVIDUAL_SELECTIONS';
  }
};

export const parseDataType = (type, key, values) => {
  let parsedKey = key;
  let parsedValues = values;

  if (type === 'HISTOGRAM') {
    parsedKey = key.slice(key.indexOf('[') + 1, key.indexOf(']'));
    parsedValues = parsedValues.map(value => {
      const lowAndHigh = value.split('<');
      return `${parsedKey} >= ${lowAndHigh[0]} and ${parsedKey} < ${
        lowAndHigh[2]
      }`;
    });
  } else if (type === 'INDIVIDUAL_SELECTIONS') {
    parsedValues = parsedValues.map(value => {
      return `${parsedKey}='${value}'`;
    });
  } else if (type === 'SERIES') {
    parsedValues = [
      `${parsedKey} between '${parsedValues[0]}' AND '${
        parsedValues[parsedValues.length - 1]
      }'`
    ];
  }

  return { parsedValues, parsedKey };
};

export const getCurrentFilters = () =>
  currentFilters.length ? `and (${currentFilters})` : '';

export function setFilterListener(qlik, layout, $element) {
  var currApp = qlik.currApp();

  qlik.currApp().getList('SelectionObject', function(app) {
    var selectedFields = app.qSelectionObject.qSelections;

    const currentSelectedFields = [];

    // This entire section is a workaround for the limitations of qSelectionThreshold being limited to 6
    if (selectedFields.length) {
      selectedFields.forEach(function(dimension) {
        const selectedField = dimension.qField;
        currentSelectedFields.push(selectedField);
        if (!fields[selectedField]) {
          fields[selectedField] = currApp
            .field(selectedField)
            .getData({ rows: 10000 });
        }

        // Hack: Must set a delay for rows to populate in the fields because of async getData
        // operation.  It's optionally to use the fields[selectedField].onData callback, but
        // that will likely give us a similar problem

        setTimeout(() => {
          const filters = createFilters(currentSelectedFields);
          updateFilterSelections(filters);
        }, ASYNC_TIMEOUT);
      });
    } else {
      updateFilterSelections({});
    }
  });
}

export function createFilters(selectedFields) {
  let thisfield = fields;
  let filters = {};
  selectedFields.forEach(field => {
    filters[field] = [];
    fields[field].rows.forEach(fieldData => {
      if (fieldData.qState === 'S') {
        filters[field].push(fieldData.qText);
      }
    });
  });
  return filters;
}

function purifyFilters(filters) {
  return Object.keys(filters).reduce((result, key) => {
    let values = filters[key];
    const dataType = uncoverDataType(key, values);
    const { parsedKey, parsedValues } = parseDataType(dataType, key, values);

    result[parsedKey] = parsedValues;
    return result;
  }, {});
}

export function createSQLFilterStatement(filters) {
  let SQLstatement = '';

  const parsedFilters = purifyFilters(filters);
  const filterKeys = Object.keys(parsedFilters);

  function addToSQL(str) {
    SQLstatement = `${SQLstatement}${str}`;
  }

  filterKeys.forEach((dimension, i) => {
    if (i === 0) addToSQL(`(`);
    parsedFilters[dimension].forEach((value, j) => {
      if (j === 0) {
        addToSQL(`(`);
      } else if (j > 0) {
        addToSQL(` OR `);
      }

      addToSQL(value);

      if (j === parsedFilters[dimension].length - 1) {
        addToSQL(`)`);
      }
    });
    if (i !== filterKeys.length - 1) {
      addToSQL(` AND `);
    } else if (i === filterKeys.length - 1) {
      addToSQL(`)`);
    }
  });

  return SQLstatement;
}

export function updateFilterSelections(filters) {
  const sqlFilterStatement = createSQLFilterStatement(filters);
  if (sqlFilterStatement !== currentFilters) {
    currentFilters = sqlFilterStatement;
    debouncedRender();
  }
}
