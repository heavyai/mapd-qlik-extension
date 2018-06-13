import {setFilterListener} from './filters-handler.js'

export default qlik => ['$scope', '$element', function($scope, $element) {
  setFilterListener(qlik, $scope.layout, $element)
}]
