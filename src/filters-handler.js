import {debouncedRender} from './services/mapd-connector'
let currentFilters = ""
let fields = {}
const ASYNC_TIMEOUT = 250

export const getCurrentFilters = () => currentFilters.length ? `and (${currentFilters})` : '';

export function setFilterListener (qlik, layout, $element) {
  var currApp = qlik.currApp()

  qlik.currApp().getList( "SelectionObject", function( app ) {
    var selectedFields = app.qSelectionObject.qSelections;
    
    const currentSelectedFields = []
    
  // This entire section is a workaround for the limitations of qSelectionThreshold being limited to 6
    if (selectedFields.length) {
      selectedFields.forEach( function (dimension) {
        const selectedField = dimension.qField
        currentSelectedFields.push(selectedField)
        if (!fields[selectedField]) {
          fields[selectedField] = currApp.field(selectedField).getData({rows: 10000});
        }

        // Hack: Must set a delay for rows to populate in the fields because of async getData 
        // operation.  It's optionally to use the fields[selectedField].onData callback, but 
        // that will likely give us a similar problem

        setTimeout(() => {
          const filters = createFilters(currentSelectedFields)
          updateFilterSelections(filters)
        }, ASYNC_TIMEOUT)
      })
    } else {
      updateFilterSelections({})
    }
  })
}

export function createFilters (selectedFields) {
  let thisfield = fields
  let filters = {};
  selectedFields.forEach(field => {
    filters[field] = []
    fields[field].rows.forEach(fieldData => {
      if (fieldData.qState === "S") {
        filters[field].push(fieldData.qText)
      }
    })
  })
  return filters
}

export function createSQLFilterStatement (filters) {
  let SQLstatement = '';
  const filterKeys = Object.keys(filters)

  function addToSQL(str) {
    SQLstatement = `${SQLstatement}${str}`
  }
  
  filterKeys.forEach((dimension, i) => {
    if (i === 0) addToSQL(`(`)
    filters[dimension].forEach((value, j) => {
      if (j === 0) {
        addToSQL(`(`)
      } else if (j > 0) {
        addToSQL(` OR `)
      }
      
      addToSQL(`${dimension}='${value}'`)
      
      if (j === filters[dimension].length - 1) {
        addToSQL(`)`)
      }
    });
    if (i !== filterKeys.length - 1) {
      addToSQL(` AND `)
    } else if (i === filterKeys.length - 1) {
      addToSQL(`)`)
    }
  })

  return SQLstatement
}

export function updateFilterSelections (filters) {
  const sqlFilterStatement = createSQLFilterStatement(filters)
  if (sqlFilterStatement !== currentFilters) {
    currentFilters = sqlFilterStatement
    debouncedRender()
  }
}
