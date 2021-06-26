'use strict';

exports.__esModule = true;
var _exportNames = {
  __hack__: true,
};
exports.default = exports.__hack__ = void 0;

var _core = require('@superset-ui/core');

var _transformProps = _interopRequireDefault(require('./transformProps'));

var _thumbnail = _interopRequireDefault(require('./images/thumbnail.png'));

var _controlPanel = _interopRequireDefault(require('./controlPanel'));

var _buildQuery = _interopRequireDefault(require('./buildQuery'));

var _types = _interopRequireWildcard(require('./types'));

exports.__hack__ = _types.default;
Object.keys(_types).forEach(function (key) {
  if (key === 'default' || key === '__esModule') return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _types[key]) return;
  exports[key] = _types[key];
});

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _getRequireWildcardCache() {
  if (typeof WeakMap !== 'function') return null;
  var cache = new WeakMap();
  _getRequireWildcardCache = function () {
    return cache;
  };
  return cache;
}

function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) {
    return obj;
  }
  if (obj === null || (typeof obj !== 'object' && typeof obj !== 'function')) {
    return { default: obj };
  }
  var cache = _getRequireWildcardCache();
  if (cache && cache.has(obj)) {
    return cache.get(obj);
  }
  var newObj = {};
  var hasPropertyDescriptor =
    Object.defineProperty && Object.getOwnPropertyDescriptor;
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      var desc = hasPropertyDescriptor
        ? Object.getOwnPropertyDescriptor(obj, key)
        : null;
      if (desc && (desc.get || desc.set)) {
        Object.defineProperty(newObj, key, desc);
      } else {
        newObj[key] = obj[key];
      }
    }
  }
  newObj.default = obj;
  if (cache) {
    cache.set(obj, newObj);
  }
  return newObj;
}

const metadata = new _core.ChartMetadata({
  behaviors: [_core.Behavior.INTERACTIVE_CHART],
  canBeAnnotationTypes: ['EVENT', 'INTERVAL'],
  description: '',
  name: (0, _core.t)('Table'),
  thumbnail: _thumbnail.default,
});

class TableColorChartPlugin extends _core.ChartPlugin {
  constructor() {
    super({
      loadChart: () =>
        Promise.resolve().then(() =>
          _interopRequireWildcard(require('./TableColorChart')),
        ),
      metadata,
      transformProps: _transformProps.default,
      controlPanel: _controlPanel.default,
      buildQuery: _buildQuery.default,
    });
  }
}

exports.default = TableColorChartPlugin;
