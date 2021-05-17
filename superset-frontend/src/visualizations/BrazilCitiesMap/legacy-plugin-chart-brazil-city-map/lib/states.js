'use strict';

exports.__esModule = true;
exports.default = void 0;

var _brasil = _interopRequireDefault(
  require('file-loader!./states/acre.geojson'),
);

var _acre = _interopRequireDefault(
  require('file-loader!./states/acre.geojson'),
);

var _alagoas = _interopRequireDefault(
  require('file-loader!./states/alagoas.geojson'),
);

var _amapa = _interopRequireDefault(
  require('file-loader!./states/amapa.geojson'),
);

var _amazonas = _interopRequireDefault(
  require('file-loader!./states/amazonas.geojson'),
);

var _bahia = _interopRequireDefault(
  require('file-loader!./states/bahia.geojson'),
);

var _ceara = _interopRequireDefault(
  require('file-loader!./states/ceara.geojson'),
);

var _distritofederal = _interopRequireDefault(
  require('file-loader!./states/distritofederal.geojson'),
);

var _espiritosanto = _interopRequireDefault(
  require('file-loader!./states/espiritosanto.geojson'),
);

var _goias = _interopRequireDefault(
  require('file-loader!./states/goias.geojson'),
);

var _maranhao = _interopRequireDefault(
  require('file-loader!./states/maranhao.geojson'),
);

var _matogrosso = _interopRequireDefault(
  require('file-loader!./states/matogrosso.geojson'),
);

var _matogrossosul = _interopRequireDefault(
  require('file-loader!./states/matogrossosul.geojson'),
);

var _minasgerais = _interopRequireDefault(
  require('file-loader!./states/minasgerais.geojson'),
);

var _para = _interopRequireDefault(
  require('file-loader!./states/para.geojson'),
);

var _paraiba = _interopRequireDefault(
  require('file-loader!./states/paraiba.geojson'),
);

var _parana = _interopRequireDefault(
  require('file-loader!./states/parana.geojson'),
);

var _pernambuco = _interopRequireDefault(
  require('file-loader!./states/pernambuco.geojson'),
);

var _piaui = _interopRequireDefault(
  require('file-loader!./states/piaui.geojson'),
);

var _riograndenorte = _interopRequireDefault(
  require('file-loader!./states/riograndenorte.geojson'),
);

var _riograndesul = _interopRequireDefault(
  require('file-loader!./states/riograndesul.geojson'),
);

var _riojaneiro = _interopRequireDefault(
  require('file-loader!./states/riojaneiro.geojson'),
);

var _rondonia = _interopRequireDefault(
  require('file-loader!./states/rondonia.geojson'),
);

var _roraima = _interopRequireDefault(
  require('file-loader!./states/roraima.geojson'),
);

var _santacatarina = _interopRequireDefault(
  require('file-loader!./states/santacatarina.geojson'),
);

var _saopaulo = _interopRequireDefault(
  require('file-loader!./states/saopaulo.geojson'),
);

var _sergipe = _interopRequireDefault(
  require('file-loader!./states/sergipe.geojson'),
);

var _tocantins = _interopRequireDefault(
  require('file-loader!./states/tocantins.geojson'),
);
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

/* eslint-disable import/no-webpack-loader-syntax, import/no-unresolved */
const states = {
  amazonas: _amazonas.default,
  minasgerais: _minasgerais.default,
  parana: _parana.default,
};
var _default = states;
exports.default = _default;
