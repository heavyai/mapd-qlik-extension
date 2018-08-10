import * as connector from './services/mapd-connector';
import * as leaflet from './services/leaflet';
import connection from './constants/connection';
const { port, database, host, username, password } = connection;

function establishConnection() {
  return connector.establishConnection({
    port,
    database,
    host,
    username,
    password
  });
}

export default function($element, layout) {
  const data = layout.vegaspec;
  const element = $element[0];
  const container = element.querySelector('.chart-container');

  if (connector.isConnected) {
    connector.render(data);
  } else {
    leaflet
      .createMap(container)
      .then(map => {
        return establishConnection();
      })
      .then(() => {
        return connector.render(data);
      });
  }
}
