'use strict';

exports.__esModule = true;
exports.default = void 0;

var _memoizeOne = _interopRequireDefault(require('memoize-one'));

var _core = require('@superset-ui/core');

var _isEqualColumns = _interopRequireDefault(require('./utils/isEqualColumns'));

var _DateWithFormatter = _interopRequireDefault(
  require('./utils/DateWithFormatter'),
);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

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
const { PERCENT_3_POINT } = _core.NumberFormats;
const { DATABASE_DATETIME } = _core.TimeFormats;
const TIME_COLUMN = '__timestamp';

function isTimeColumn(key) {
  return key === TIME_COLUMN;
}

function isNumeric(key, data = []) {
  return data.every(
    x => x[key] === null || x[key] === undefined || typeof x[key] === 'number',
  );
}

const processDataRecords = (0, _memoizeOne.default)(function processDataRecords(
  data,
  columns,
) {
  if (!data || !data[0]) {
    return data || [];
  }

  const timeColumns = columns.filter(
    column => column.dataType === _core.GenericDataType.TEMPORAL,
  );

  if (timeColumns.length > 0) {
    return data.map(x => {
      const datum = { ...x };
      timeColumns.forEach(({ key, formatter }) => {
        // Convert datetime with a custom date class so we can use `String(...)`
        // formatted value for global search, and `date.getTime()` for sorting.
        datum[key] = new _DateWithFormatter.default(x[key], {
          formatter: formatter,
        });
      });
      return datum;
    });
  }

  return data;
});
const processColumns = (0, _memoizeOne.default)(function processColumns(props) {
  const {
    datasource: { columnFormats, verboseMap },
    rawFormData: {
      table_timestamp_format: tableTimestampFormat,
      metrics: metrics_,
      percent_metrics: percentMetrics_,
      column_config: columnConfig = {},
    },
    queriesData,
  } = props;
  const granularity = (0, _core.extractTimegrain)(props.rawFormData);
  const { data: records, colnames, coltypes } = queriesData[0] || {}; // convert `metrics` and `percentMetrics` to the key names in `data.records`

  const metrics = (metrics_ != null ? metrics_ : []).map(_core.getMetricLabel);
  const rawPercentMetrics = (percentMetrics_ != null
    ? percentMetrics_
    : []
  ).map(_core.getMetricLabel); // column names for percent metrics always starts with a '%' sign.

  const percentMetrics = rawPercentMetrics.map(x => `%${x}`);
  const metricsSet = new Set(metrics);
  const percentMetricsSet = new Set(percentMetrics);
  const rawPercentMetricsSet = new Set(rawPercentMetrics);
  const columns = (colnames || [])
    .filter(
      (
        key, // if a metric was only added to percent_metrics, they should not show up in the table.
      ) => !(rawPercentMetricsSet.has(key) && !metricsSet.has(key)),
    )
    .map((key, i) => {
      const label = (verboseMap == null ? void 0 : verboseMap[key]) || key;
      const dataType = coltypes[i];
      const config = columnConfig[key] || {}; // for the purpose of presentation, only numeric values are treated as metrics
      // because users can also add things like `MAX(str_col)` as a metric.

      const isMetric = metricsSet.has(key) && isNumeric(key, records);
      const isPercentMetric = percentMetricsSet.has(key);
      const isTime = dataType === _core.GenericDataType.TEMPORAL;
      const savedFormat = columnFormats == null ? void 0 : columnFormats[key];
      const numberFormat = config.d3NumberFormat || savedFormat;
      let formatter;

      if (isTime || config.d3TimeFormat) {
        // string types may also apply d3-time format
        // pick adhoc format first, fallback to column level formats defined in
        // datasource
        const customFormat = config.d3TimeFormat || savedFormat;
        const timeFormat = customFormat || tableTimestampFormat; // When format is "Adaptive Formatting" (smart_date)

        if (timeFormat === _core.smartDateFormatter.id) {
          if (isTimeColumn(key)) {
            // time column use formats based on granularity
            formatter = (0, _core.getTimeFormatterForGranularity)(granularity);
          } else if (customFormat) {
            // other columns respect the column-specific format
            formatter = (0, _core.getTimeFormatter)(customFormat);
          } else if (isNumeric(key, records)) {
            // if column is numeric values, it is considered a timestamp64
            formatter = (0, _core.getTimeFormatter)(DATABASE_DATETIME);
          } else {
            // if no column-specific format, print cell as is
            formatter = String;
          }
        } else if (timeFormat) {
          formatter = (0, _core.getTimeFormatter)(timeFormat);
        }
      } else if (isPercentMetric) {
        // percent metrics have a default format
        formatter = (0, _core.getNumberFormatter)(
          numberFormat || PERCENT_3_POINT,
        );
      } else if (isMetric || numberFormat) {
        formatter = (0, _core.getNumberFormatter)(numberFormat);
      }

      return {
        key,
        label,
        dataType,
        isNumeric: dataType === _core.GenericDataType.NUMERIC,
        isMetric,
        isPercentMetric,
        formatter,
        config,
      };
    });
  return [metrics, percentMetrics, columns];
}, _isEqualColumns.default);
/**
 * Automatically set page size based on number of cells.
 */

const getPageSize = (pageSize, numRecords, numColumns) => {
  if (typeof pageSize === 'number') {
    // NaN is also has typeof === 'number'
    return pageSize || 0;
  }

  if (typeof pageSize === 'string') {
    return Number(pageSize) || 0;
  } // when pageSize not set, automatically add pagination if too many records

  return numRecords * numColumns > 5000 ? 200 : 0;
};

const transformProps = chartProps => {
  var _baseQuery2, _totalQuery;

  const {
    height,
    width,
    rawFormData: formData,
    queriesData = [],
    initialValues: filters = {},
    ownState: serverPaginationData = {},
    hooks: { onAddFilter: onChangeFilter, setDataMask = () => {} },
  } = chartProps;
  const {
    align_pn: alignPositiveNegative = true,
    color_pn: colorPositiveNegative = true,
    show_cell_bars: showCellBars = true,
    include_search: includeSearch = false,
    page_length: pageLength,
    table_filter: tableFilter,
    server_pagination: serverPagination = false,
    server_page_length: serverPageLength = 10,
    order_desc: sortDesc = false,
    query_mode: queryMode,
    show_totals: showTotals,
    colorColumn: colorColumn,
  } = formData;
  const [metrics, percentMetrics, columns] = processColumns(chartProps);
  let baseQuery;
  let countQuery;
  let totalQuery;
  let rowCount;

  if (serverPagination) {
    var _ref, _countQuery, _countQuery$data, _countQuery$data$;

    [baseQuery, countQuery, totalQuery] = queriesData;
    rowCount =
      (_ref =
        (_countQuery = countQuery) == null
          ? void 0
          : (_countQuery$data = _countQuery.data) == null
          ? void 0
          : (_countQuery$data$ = _countQuery$data[0]) == null
          ? void 0
          : _countQuery$data$.rowcount) != null
        ? _ref
        : 0;
  } else {
    var _baseQuery$rowcount, _baseQuery;

    [baseQuery, totalQuery] = queriesData;
    rowCount =
      (_baseQuery$rowcount =
        (_baseQuery = baseQuery) == null ? void 0 : _baseQuery.rowcount) != null
        ? _baseQuery$rowcount
        : 0;
  }

  const data = processDataRecords(
    (_baseQuery2 = baseQuery) == null ? void 0 : _baseQuery2.data,
    columns,
  );
  const totals =
    showTotals && queryMode === _core.QueryMode.aggregate
      ? (_totalQuery = totalQuery) == null
        ? void 0
        : _totalQuery.data[0]
      : undefined;
  return {
    height,
    width,
    isRawRecords: queryMode === _core.QueryMode.raw,
    data,
    totals,
    columns,
    serverPagination,
    metrics,
    percentMetrics,
    serverPaginationData,
    setDataMask,
    alignPositiveNegative,
    colorPositiveNegative,
    showCellBars,
    sortDesc,
    includeSearch,
    rowCount,
    colorColumn,
    pageSize: serverPagination
      ? serverPageLength
      : getPageSize(pageLength, data.length, columns.length),
    filters,
    emitFilter: tableFilter,
    onChangeFilter,
  };
};

var _default = transformProps;
exports.default = _default;
