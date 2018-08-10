import MapDCon from '@mapd/connector/dist/browser-connector';
import { updateMap } from './leaflet';
import { convertVariables, debounce } from '../helpers';

let currentVegaSpec = null;

// connector is a singleton
const connection = new window.MapdCon();
let isConnected = false;

function establishConnection(config) {
  return new Promise((resolve, reject) => {
    connection
      .host(config.host)
      .port(config.port)
      .dbName(config.database)
      .user(config.username)
      .password(config.password)
      .connect((error, con) => {
        if (error) {
          reject(error);
        } else if (con) {
          console.log('connected');
          resolve(con);
          isConnected = true;
        }
      });
  });
}

function renderVega(vegaSpec, vegaOptions) {
  if (!vegaOptions) vegaOptions = { returnTiming: true };
  return new Promise((resolve, reject) => {
    connection.renderVega(1, vegaSpec, vegaOptions, function(error, result) {
      if (error) {
        reject(error.message);
      } else {
        var blobUrl = `data:image/png;base64,${result.image}`;
        resolve(blobUrl);
      }
    });
  });
}

function render(vegaSpec) {
  if (vegaSpec) {
    currentVegaSpec = vegaSpec;
  }

  renderVega(convertVariables(currentVegaSpec)).then(result => {
    updateMap(result);
  });
}

const debouncedRender = debounce(render, 300);

export {
  connection,
  isConnected,
  establishConnection,
  debouncedRender,
  render
};
