import { resizeMap } from './services/leaflet';
import { debounce } from './helpers';

const debouncedResize = debounce(resizeMap, 500);

export default function($element, layout) {
  const ext = this;
  const viz = ext.$scope.viz;

  return debouncedResize($element, layout);
}
