import {getMap} from './services/leaflet'
import {getCurrentFilters} from './filters-handler'

export function createDictionaryMap() {
  const map = getMap()

  var mapBounds = map.getBounds()
  var mapZoom = map.getZoom()

  var minBounds = conv4326To900913([mapBounds._southWest.lng, mapBounds._southWest.lat])

  var $minXBounds = minBounds[0] || 0
  var $minYBounds = minBounds[1] || 1000

  var maxBounds = conv4326To900913([mapBounds._northEast.lng, mapBounds._northEast.lat])

  var $maxXBounds = maxBounds[0] || 0
  var $maxYBounds = maxBounds[1] || 1000


  var $minLon = mapBounds._southWest.lng;
  var $minLat = mapBounds._southWest.lat;
  var $maxLon = mapBounds._northEast.lng;
  var $maxLat = mapBounds._northEast.lat;

  var $width = map._container.offsetWidth
  var $height = map._container.offsetHeight

  var pixelSize = Math.max(100 / (40075000 * Math.cos(mapBounds._northEast.lat * Math.PI/180) / ($width * Math.pow(2, mapZoom))), 1.0)
  if (pixelSize<7) {pixelSize =7}
  var $numBinsX = Math.round($width / pixelSize)
  var $numBinsY = Math.round($height * $numBinsX / $width)

  // For Hex
  var $hexWidth = 10
  var $hexHeight = 2 * $hexWidth / Math.sqrt(3.0)
  var hexoffsetx = 0
  var hexoffsety = 0
  var $squareWidth = $width / $numBinsX
  var $squareHeight = $height / $numBinsY

  
  var mercxdiff = hexoffsetx * ($maxXBounds - $minXBounds) / $width
  var $minHexXBounds = $minXBounds - mercxdiff
  var $maxHexXBounds = $maxXBounds - mercxdiff
  var mercydiff = hexoffsety * ($maxYBounds - $minYBounds) / $height
  var $minHexYBounds = $minYBounds - mercydiff
  var $maxHexYBounds = $maxYBounds - mercydiff
  var $qlikFilters = getCurrentFilters()

  return {
    $minXBounds,
    $maxXBounds,
    $minYBounds,
    $maxYBounds,
    $minLon,
    $maxLon,
    $minLat,
    $maxLat,
    $width,
    $height,
    $hexHeight,
    $hexWidth,
    $minHexXBounds,
    $maxHexXBounds,
    $minHexYBounds,
    $maxHexYBounds,
    $numBinsX,
    $numBinsY,
    $squareHeight,
    $squareWidth,
    $qlikFilters
  }
}

export function findAndReplace(vegaSpec, dictionaryMap) {
    // Construct a RegEx from the dictionary
    if (!vegaSpec) vegaSpec = '';
    var pattern = [];
    for (var name in dictionaryMap) {
        if (dictionaryMap.hasOwnProperty(name)) {
            // Escape characters
            pattern.push(name.replace(/([[^$.|?*+(){}\\])/g, '\\$1'));
        }
    }

    // Concatenate keys, and create a Regular expression:
    pattern = new RegExp( pattern.join('|'), 'g' );

    // Call String.replace with a regex, and function argument.
    return vegaSpec.replace(pattern, function(match) {
        return dictionaryMap[match];
    });
}


export function checkForVariablesInVegaSpec (vegaSpec) {
  if (!vegaSpec) vegaSpec = ''
  return vegaSpec.indexOf('$') !== -1
}

export function convertVariables(data) {
  var dictionaryMap = createDictionaryMap()
  return findAndReplace(data, dictionaryMap)
}

export function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

var conv4326To900913 = function(coord) {
    var transCoord = [0.0, 0.0];
    transCoord[0] = coord[0] * 111319.49077777777778;
    transCoord[1] = Math.log(Math.tan((90.0 + coord[1]) * 0.00872664625997)) * 6378136.99911215736947;
    return transCoord;
};
