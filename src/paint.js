import * as connector from './services/mapd-connector'
import * as leaflet from './services/leaflet'

function establishConnection () {
  return connector.establishConnection({
    host: "vega-demo.mapd.com",
    port: 9092,
    database: "mapd",
    username: "mapd",
    password: "HyperInteractive"
  })
}

export default function($element, layout) {
  console.log($element)
  const data = layout.vegaspec;
  const element = $element[0];
  const container = element.querySelector(".chart-container");

  if (connector.isConnected) {
    connector.render(data)
  } else {
    leaflet.createMap(container)
    .then((map) => {
      return establishConnection()
    })
    .then(() => {
      return connector.render(data)
    })
    
  }
}
