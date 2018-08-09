var proxyquire =  require('proxyquire').noCallThru();
var {
  createFilters,
  createSQLFilterStatement,
  parseDataType
} = proxyquire('../src/filters-handler', {
  './services/mapd-connector': () => {}
});
var assert = require('assert');

describe('Create SQL Filter Statement', function () {
    it('Should not create a SQL filter statement', function () {
        const input = {}
        assert.equal(createSQLFilterStatement(input), "");
    });

    it('Should create a filter statement from one column and one filter', function () {
      const input = {"column": ['filter1']}
      assert.equal(createSQLFilterStatement(input), "((column='filter1'))");
    });

    it('Should create a filter statement from one column and three filters', function () {
      const input = {"column": ['filter1', 'filter2', 'filter3']}
      assert.equal(createSQLFilterStatement(input), "((column='filter1' OR column='filter2' OR column='filter3'))");
    });

    it('Should create a filter statement from two columns and two filters', function () {
      const input = {
        "column": ['filter1', 'filter2'],
        "column2": ['filter3', 'filter4']
      }
      
      assert.equal(createSQLFilterStatement(input), "((column='filter1' OR column='filter2') AND (column2='filter3' OR column2='filter4'))");
    });
});

describe('Parse Data Type Statement', function () {
    it('Should parse HISTOGRAM data', function () {
        var type = "HISTOGRAM"
        var key = "=Class([amount],7500,'x',-94000)"
        var values = [
                        "-26500 <= x < -19000",
                        "-19000 <= x < -11500",
                        "-11500 <= x < -4000",
                        "-4000 <= x < 3500"
                      ]

        var expectedResult = {
          "parsedValues": ["amount >= -26500  and amount <  -19000","amount >= -19000  and amount <  -11500","amount >= -11500  and amount <  -4000","amount >= -4000  and amount <  3500"],
          "parsedKey":"amount"
        }


        assert.equal(JSON.stringify(parseDataType(type, key, values)), JSON.stringify(expectedResult));
    });

    it('Should parse INDIVIDUAL_SELECTIONS data', function () {
      var type = "INDIVIDUAL_SELECTIONS"
      var key = "recipient_name"
      var values = [
                      "Maintenance of Way Employees",
                      "Texas Medical Assn"
                   ]

      var expectedResult = {
        "parsedValues":["recipient_name='Maintenance of Way Employees'","recipient_name='Texas Medical Assn'"],
        "parsedKey":"recipient_name"
      }

      assert.equal(JSON.stringify(parseDataType(type, key, values)), JSON.stringify(expectedResult));
    });

    it('Should parse SERIES data', function () {
      var type = "SERIES"
      var key = "series_data"
      var values = ["2005-01-03","2005-01-04","2005-01-05","2005-01-06","2005-01-10","2005-01-18","2005-01-21","2005-01-24","2005-01-31","2005-02-01","2005-02-07","2005-02-14","2005-02-22","2005-02-23","2005-02-24","2005-02-28","2005-03-17","2005-03-21","2005-03-28","2005-03-31","2005-04-08","2005-04-12","2005-04-15","2005-04-18","2005-04-20","2005-04-22","2005-04-26"]

      var expectedResult = { 
        parsedValues: ["series_data between \'2005-01-03\' AND \'2005-04-26\'"],
        parsedKey: 'series_data'
      }

        assert.equal(JSON.stringify(parseDataType(type, key, values)), JSON.stringify(expectedResult));
    });
});
