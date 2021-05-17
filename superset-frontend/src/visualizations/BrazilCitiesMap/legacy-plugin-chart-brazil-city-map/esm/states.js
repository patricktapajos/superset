/* eslint-disable import/no-webpack-loader-syntax, import/no-unresolved */
import brasil from 'file-loader!./states/brazil.geojson';
import AC from 'file-loader!./states/acre.geojson';
import AL from 'file-loader!./states/alagoas.geojson';
import AP from 'file-loader!./states/amapa.geojson';
import AM from 'file-loader!./states/amazonas.geojson';
import BA from 'file-loader!./states/bahia.geojson';
import CA from 'file-loader!./states/ceara.geojson';
import DF from 'file-loader!./states/distritofederal.geojson';
import ES from 'file-loader!./states/espiritosanto.geojson';
import GO from 'file-loader!./states/goias.geojson';
import MA from 'file-loader!./states/maranhao.geojson';
import MT from 'file-loader!./states/matogrosso.geojson';
import MS from 'file-loader!./states/matogrossosul.geojson';
import MG from 'file-loader!./states/minasgerais.geojson';
import PA from 'file-loader!./states/para.geojson';
import PB from 'file-loader!./states/paraiba.geojson';
import PR from 'file-loader!./states/parana.geojson';
import PE from 'file-loader!./states/pernambuco.geojson';
import PI from 'file-loader!./states/piaui.geojson';
import RN from 'file-loader!./states/riograndenorte.geojson';
import RS from 'file-loader!./states/riograndesul.geojson';
import RJ from 'file-loader!./states/riojaneiro.geojson';
import RO from 'file-loader!./states/rondonia.geojson';
import RR from 'file-loader!./states/roraima.geojson';
import SC from 'file-loader!./states/santacatarina.geojson';
import SP from 'file-loader!./states/saopaulo.geojson';
import SE from 'file-loader!./states/sergipe.geojson';
import TO from 'file-loader!./states/tocantins.geojson';

const states = {
  brasil,
  AC,
  AL,
  AP,
  AM,
  BA,
  CA,
  DF,
  ES,
  GO,
  MA,
  MT,
  MS,
  MG,
  PA,
  PB,
  PR,
  PE,
  PI,
  RN,
  RS,
  RJ,
  RO,
  RR,
  SC,
  SP,
  SE,
  TO,
};
export default states;
