var proxyquire =  require('proxyquire').noCallThru();
var {createFilters, createSQLFilterStatement} = proxyquire('../src/filters-handler', {
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

 it('Should create a filter statement from one column and two filters', function () {
      const input = {"column": ['filter1', 'filter2']}
      assert.equal(createSQLFilterStatement(input), "((column='filter1' OR column='filter2'))");
    });

 it('Should create a filter statement from two columns and two filters', function () {
      const input = {
        "column": ['filter1', 'filter2'],
        "column2": ['filter3', 'filter4']
      }
      
      assert.equal(createSQLFilterStatement(input), "((column='filter1' OR column='filter2') AND (column2='filter3' OR column2='filter4'))");
    });
});
