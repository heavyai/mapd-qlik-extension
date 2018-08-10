import L from 'leaflet';
import { debouncedRender } from './mapd-connector';

let map = null;
let overlay = null;

export const getMap = () => map;

export function createMap(container) {
  return new Promise(function(resolve, reject) {
    map = L.map(container, {
      maxBoundsViscosity: 1.0,
      maxBounds: [[85, -180], [-85, 180]]
    });
    map
      .on('load', function() {
        L.tileLayer('https://c.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 18,
          minZoom: 2,
          id: 'openstreetmaps'
        }).addTo(map);
        resolve(map);
      })
      .setView([60.505, -30.09], 2);

    map.on('moveend', function() {
      debouncedRender();
    });
  });
}

export function updateMap(image) {
  const bounds = map.getBounds();
  const bboxArray = bounds
    .toBBoxString()
    .split(',')
    .map(parseFloat);

  const imageBounds = new L.LatLngBounds(
    new L.LatLng(bboxArray[3], bboxArray[2]),
    new L.LatLng(bboxArray[1], bboxArray[0])
  );

  if (overlay) {
    map.removeLayer(overlay);
  }

  overlay = L.imageOverlay(image, imageBounds);

  map.addLayer(overlay);
}

export function resizeMap() {
  map.invalidateSize();
}
