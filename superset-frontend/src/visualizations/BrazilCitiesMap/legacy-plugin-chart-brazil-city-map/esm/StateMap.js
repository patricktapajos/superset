/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/* eslint-disable react/sort-prop-types */
import d3 from 'd3';
import PropTypes from 'prop-types';
import { extent as d3Extent } from 'd3-array';
import {
  getNumberFormatter,
  getSequentialSchemeRegistry,
} from '@superset-ui/core';
import states from './states';
import './StateMap.css';
import { max } from 'lodash';

const propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      city_id: PropTypes.string,
      state: PropTypes.string,
      metric: PropTypes.number,
    }),
  ),
  width: PropTypes.number,
  height: PropTypes.number,
  linearColorScheme: PropTypes.string,
  mapBaseUrl: PropTypes.string,
  numberFormat: PropTypes.string,
};

const maps = {};

function StateMap(element, props) {
  const {
    data,
    width,
    height,
    linearColorScheme,
    numberFormat,
    extraFilters,
    stateColumn,
    metric,
    colorColumn,
  } = props;

  let filters = [];
  if (extraFilters && extraFilters.length > 0) {
    let f = extraFilters.filter(o => o.col == stateColumn);
    if (f.length > 0) {
      filters.push({ state: f[0].val });
    }
  }

  const container = element;
  const format = getNumberFormatter(numberFormat);
  let colorScale = getSequentialSchemeRegistry()
    .get(linearColorScheme)
    .createLinearScale(d3Extent(data, v => v.metric));
  const colorMap = {};

  if (colorColumn && colorColumn.length > 0) {
    data.forEach(d => {
      colorMap[d.city_id] = d.color;

      let result = data.filter(region => region.state == d.state);
      if (result) {
        colorMap[d.state] = findMaxColor(result);
      }
    });
  } else {
    data.forEach(d => {
      colorMap[d.city_id] = colorScale(d.metric);
      colorMap[d.state] = colorScale(d.metric);
    });
  }

  function findMaxColor(result) {
    let objColors = result.reduce(function (prev, cur) {
      var val = cur['color'];
      prev[val] = (prev[val] || 0) + 1;
      return prev;
    }, {});
    let maxColor = '#FFFF';
    let maxValue = 0;
    Object.keys(objColors).forEach(function (k) {
      if (objColors[k] > maxValue) {
        maxValue = objColors[k];
        maxColor = k;
      }
    });
    return maxColor;
  }

  const colorFn = d => {
    if (d.properties.ISO != undefined) {
      return colorMap[d.properties.ISO.substr(-2, 2)];
    } else {
      return colorMap[d.properties.id];
    }
  };

  const path = d3.geo.path();
  const div = d3.select(container);
  div.classed('superset-legacy-chart-state-map', true);
  div.selectAll('*').remove();
  container.style.height = `${height}px`;
  container.style.width = `${width}px`;
  const svg = div
    .append('svg:svg')
    .attr('width', width)
    .attr('height', height)
    .attr('preserveAspectRatio', 'xMidYMid meet');
  const backgroundRect = svg
    .append('rect')
    .attr('class', 'background')
    .attr('width', width)
    .attr('height', height);
  const g = svg.append('g');
  const mapLayer = g.append('g').classed('map-layer', true);
  const textLayer = g
    .append('g')
    .classed('text-layer', true)
    .attr('transform', `translate(${width / 2}, 45)`);
  const bigText = textLayer.append('text').classed('big-text', true);
  const resultText = textLayer
    .append('text')
    .classed('result-text', true)
    .attr('dy', '1em');
  let centered;

  const clicked = function clicked(d) {
    const hasCenter = d && centered !== d;
    let x;
    let y;
    let k;
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    if (hasCenter) {
      const centroid = path.centroid(d);
      [x, y] = centroid;
      k = 4;
      centered = d;
    } else {
      x = halfWidth;
      y = halfHeight;
      k = 1;
      centered = null;
    }

    g.transition()
      .duration(750)
      .attr(
        'transform',
        `translate(${halfWidth},${halfHeight})scale(${k})translate(${-x},${-y})`,
      );
    textLayer
      .style('opacity', 0)
      .attr(
        'transform',
        `translate(0,0)translate(${x},${hasCenter ? y - 5 : 45})`,
      )
      .transition()
      .duration(750)
      .style('opacity', 1);
    bigText
      .transition()
      .duration(750)
      .style('font-size', hasCenter ? 6 : 16);
    resultText
      .transition()
      .duration(750)
      .style('font-size', hasCenter ? 16 : 24);
  };

  backgroundRect.on('click', clicked);

  const selectAndDisplayNameOfRegion = function selectAndDisplayNameOfRegion(
    feature,
  ) {
    let name = 'Brasil';

    if (feature && feature.properties) {
      if (feature.properties.name) {
        name = feature.properties.name;
      }
      if (feature.properties.NAME_1) {
        name = feature.properties.NAME_1;
      }
    }

    bigText.text(name);
  };

  const updateMetrics = function updateMetrics(region) {
    if (region.length > 0) {
      resultText.text(format(region[0].metric));
    }
  };

  const mouseenter = function mouseenter(d) {
    // Darken color
    let c = colorFn(d);

    if (c !== 'none') {
      c = d3.rgb(c).darker().toString();
    }

    d3.select(this).style('fill', c);
    selectAndDisplayNameOfRegion(d);
    let result = data.filter(region => region.city_id == d.properties.id);
    if (result.length == 0) {
      let result_ = data.filter(region => {
        if (d.properties.ISO != undefined) {
          return region.state == d.properties.ISO.substr(-2, 2);
        }
      });

      let agg = verifyMetric(metric.aggregate, result_);

      result.push({ metric: agg ? agg : 0 });
    }
    updateMetrics(result);
  };

  function verifyMetric(agg, arr) {
    if (agg == 'AVG') {
      let qtde = 0;
      let sum = arr.reduce((totalValue, s_) => {
        qtde = qtde + 1;
        return totalValue + s_.metric;
      }, 0);
      if (qtde > 0) qtde = (sum / qtde).toFixed(2);
      return qtde;
    }

    if (agg == 'COUNT') {
      return arr.length;
    }
    if (agg == 'COUNT_DISTINCT') {
      return arr.reduce(
        (acc, o) => ((acc[o.metric] = (acc[o.metric] || 0) + 1), acc),
        {},
      );
    }
    if (agg == 'MAX') {
      arr.reduce(function (a, b) {
        return Math.max(a.metric, b.metric);
      });
    }
    if (agg == 'MIN') {
      arr.reduce(function (a, b) {
        return Math.min(a.metric, b.metric);
      });
    }

    if (agg == 'SUM') {
      let sum = arr.reduce((totalValue, s_) => {
        return totalValue + s_.metric;
      }, 0);
    }
  }

  const mouseout = function mouseout() {
    d3.select(this).style('fill', colorFn);
    bigText.text('');
    resultText.text('');
  };

  function drawMap(mapData) {
    const { features } = mapData;
    const center = d3.geo.centroid(mapData);
    const scale = 100;
    const projection = d3.geo
      .mercator()
      .scale(scale)
      .center(center)
      .translate([width / 2, height / 2]);
    path.projection(projection); // Compute scale that fits container.

    const bounds = path.bounds(mapData);
    const hscale = (scale * width) / (bounds[1][0] - bounds[0][0]);
    const vscale = (scale * height) / (bounds[1][1] - bounds[0][1]);
    const newScale = hscale < vscale ? hscale : vscale; // Compute bounds and offset using the updated scale.

    projection.scale(newScale);
    const newBounds = path.bounds(mapData);
    projection.translate([
      width - (newBounds[0][0] + newBounds[1][0]) / 2,
      height - (newBounds[0][1] + newBounds[1][1]) / 2,
    ]); // Draw each province as a path

    mapLayer
      .selectAll('path')
      .data(features)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('class', 'region')
      .attr('vector-effect', 'non-scaling-stroke')
      .style('fill', colorFn)
      .on('mouseenter', mouseenter)
      .on('mouseout', mouseout)
      .on('click', clicked);
  }

  let state_ = 'brasil';

  if (filters.length > 0) {
    state_ = filters[0].state;
  }

  const stateKey = state_;
  const map = maps[stateKey];

  if (map) {
    drawMap(map);
  } else {
    const url = states[stateKey];
    d3.json(url, (error, mapData) => {
      if (!error) {
        maps[stateKey] = mapData;
        drawMap(mapData);
      }
    });
  }

  // React.createElement(Legend, {
  //     categories: buckets,
  //     position: formData.legend_position,
  //     format: formData.legend_format
  //   })
}

StateMap.displayName = 'StateMap';
StateMap.propTypes = propTypes;
export default StateMap;
