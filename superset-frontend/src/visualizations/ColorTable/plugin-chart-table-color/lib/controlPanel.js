'use strict';

exports.__esModule = true;
exports.default = void 0;

var _react = _interopRequireDefault(require('react'));

var _core = require('@superset-ui/core');

var _chartControls = require('@superset-ui/chart-controls');

var _i18n = _interopRequireDefault(require('./i18n'));

var _consts = require('./consts');

var _react2 = require('@emotion/react');

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

/* eslint-disable camelcase */

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
(0, _core.addLocaleData)(_i18n.default);

function getQueryMode(controls) {
  var _controls$query_mode, _controls$all_columns;

  const mode =
    controls == null
      ? void 0
      : (_controls$query_mode = controls.query_mode) == null
      ? void 0
      : _controls$query_mode.value;

  if (mode === _core.QueryMode.aggregate || mode === _core.QueryMode.raw) {
    return mode;
  }

  const rawColumns =
    controls == null
      ? void 0
      : (_controls$all_columns = controls.all_columns) == null
      ? void 0
      : _controls$all_columns.value;
  const hasRawColumns = rawColumns && rawColumns.length > 0;
  return hasRawColumns ? _core.QueryMode.raw : _core.QueryMode.aggregate;
}
/**
 * Visibility check
 */

function isQueryMode(mode) {
  return ({ controls }) => getQueryMode(controls) === mode;
}

const isAggMode = isQueryMode(_core.QueryMode.aggregate);
const isRawMode = isQueryMode(_core.QueryMode.raw);

const validateAggControlValues = (controls, values) => {
  const areControlsEmpty = values.every(
    val => (0, _core.ensureIsArray)(val).length === 0,
  );
  return areControlsEmpty &&
    isAggMode({
      controls,
    })
    ? [
        (0, _core.t)(
          'Group By, Metrics or Percentage Metrics must have a value',
        ),
      ]
    : [];
};

const queryMode = {
  type: 'RadioButtonControl',
  label: (0, _core.t)('Query mode'),
  default: null,
  options: [
    [
      _core.QueryMode.aggregate,
      _chartControls.QueryModeLabel[_core.QueryMode.aggregate],
    ],
    [_core.QueryMode.raw, _chartControls.QueryModeLabel[_core.QueryMode.raw]],
  ],
  mapStateToProps: ({ controls }) => ({
    value: getQueryMode(controls),
  }),
  rerender: ['all_columns', 'groupby', 'metrics', 'percent_metrics'],
};
const all_columns = {
  type: 'SelectControl',
  label: (0, _core.t)('Columns'),
  description: (0, _core.t)('Columns to display'),
  multi: true,
  freeForm: true,
  allowAll: true,
  commaChoosesOption: false,
  default: [],
  optionRenderer: c =>
    (0, _react2.jsx)(_chartControls.ColumnOption, {
      showType: true,
      column: c,
    }),
  valueRenderer: c =>
    (0, _react2.jsx)(_chartControls.ColumnOption, {
      column: c,
    }),
  valueKey: 'column_name',
  mapStateToProps: ({ datasource, controls }, controlState) => ({
    options: (datasource == null ? void 0 : datasource.columns) || [],
    queryMode: getQueryMode(controls),
    externalValidationErrors:
      isRawMode({
        controls,
      }) && (0, _core.ensureIsArray)(controlState.value).length === 0
        ? [(0, _core.t)('must have a value')]
        : [],
  }),
  visibility: isRawMode,
};
const dnd_all_columns = {
  type: 'DndColumnSelect',
  label: (0, _core.t)('Columns'),
  description: (0, _core.t)('Columns to display'),
  default: [],

  mapStateToProps({ datasource, controls }, controlState) {
    const newState = {};

    if (datasource) {
      const options = datasource.columns;
      newState.options = Object.fromEntries(
        options.map(option => [option.column_name, option]),
      );
    }

    newState.queryMode = getQueryMode(controls);
    newState.externalValidationErrors =
      isRawMode({
        controls,
      }) && (0, _core.ensureIsArray)(controlState.value).length === 0
        ? [(0, _core.t)('must have a value')]
        : [];
    return newState;
  },

  visibility: isRawMode,
};
const percent_metrics = {
  type: 'MetricsControl',
  label: (0, _core.t)('Percentage metrics'),
  description: (0, _core.t)(
    'Metrics for which percentage of total are to be displayed. Calculated from only data within the row limit.',
  ),
  multi: true,
  visibility: isAggMode,
  mapStateToProps: ({ datasource, controls }, controlState) => {
    var _controls$groupby, _controls$metrics;

    return {
      columns: (datasource == null ? void 0 : datasource.columns) || [],
      savedMetrics: (datasource == null ? void 0 : datasource.metrics) || [],
      datasourceType: datasource == null ? void 0 : datasource.type,
      queryMode: getQueryMode(controls),
      externalValidationErrors: validateAggControlValues(controls, [
        (_controls$groupby = controls.groupby) == null
          ? void 0
          : _controls$groupby.value,
        (_controls$metrics = controls.metrics) == null
          ? void 0
          : _controls$metrics.value,
        controlState.value,
      ]),
    };
  },
  rerender: ['groupby', 'metrics'],
  default: [],
  validators: [],
};
const dnd_percent_metrics = { ...percent_metrics, type: 'DndMetricSelect' };
const config = {
  controlPanelSections: [
    _chartControls.sections.legacyTimeseriesTime,
    {
      label: (0, _core.t)('Query'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'query_mode',
            config: queryMode,
          },
        ],
        [
          {
            name: 'groupby',
            override: {
              visibility: isAggMode,
              mapStateToProps: (state, controlState) => {
                var _sharedControls$group,
                  _originalMapStateToPr,
                  _controls$metrics2,
                  _controls$percent_met;

                const { controls } = state;
                const originalMapStateToProps =
                  _chartControls.sharedControls == null
                    ? void 0
                    : (_sharedControls$group =
                        _chartControls.sharedControls.groupby) == null
                    ? void 0
                    : _sharedControls$group.mapStateToProps; // @ts-ignore

                const newState =
                  (_originalMapStateToPr =
                    originalMapStateToProps == null
                      ? void 0
                      : originalMapStateToProps(state, controlState)) != null
                    ? _originalMapStateToPr
                    : {};
                newState.externalValidationErrors = validateAggControlValues(
                  controls,
                  [
                    (_controls$metrics2 = controls.metrics) == null
                      ? void 0
                      : _controls$metrics2.value,
                    (_controls$percent_met = controls.percent_metrics) == null
                      ? void 0
                      : _controls$percent_met.value,
                    controlState.value,
                  ],
                );
                return newState;
              },
              rerender: ['metrics', 'percent_metrics'],
            },
          },
        ],
        [
          {
            name: 'metrics',
            override: {
              validators: [],
              visibility: isAggMode,
              mapStateToProps: (
                { controls, datasource, form_data },
                controlState,
              ) => {
                var _controls$groupby2, _controls$percent_met2;

                return {
                  columns:
                    (datasource == null
                      ? void 0
                      : datasource.columns.filter(c => c.filterable)) || [],
                  savedMetrics:
                    (datasource == null ? void 0 : datasource.metrics) || [],
                  // current active adhoc metrics
                  selectedMetrics:
                    form_data.metrics ||
                    (form_data.metric ? [form_data.metric] : []),
                  datasource,
                  externalValidationErrors: validateAggControlValues(controls, [
                    (_controls$groupby2 = controls.groupby) == null
                      ? void 0
                      : _controls$groupby2.value,
                    (_controls$percent_met2 = controls.percent_metrics) == null
                      ? void 0
                      : _controls$percent_met2.value,
                    controlState.value,
                  ]),
                };
              },
              rerender: ['groupby', 'percent_metrics'],
            },
          },
          {
            name: 'all_columns',
            config: (0, _core.isFeatureEnabled)(
              _core.FeatureFlag.ENABLE_EXPLORE_DRAG_AND_DROP,
            )
              ? dnd_all_columns
              : all_columns,
          },
        ],
        [
          {
            name: 'percent_metrics',
            config: {
              ...((0, _core.isFeatureEnabled)(
                _core.FeatureFlag.ENABLE_EXPLORE_DRAG_AND_DROP,
              )
                ? dnd_percent_metrics
                : percent_metrics),
            },
          },
        ],
        [
          {
            name: 'color_column',
            config: color_column,
          },
        ],
        [
          {
            name: 'timeseries_limit_metric',
            override: {
              visibility: isAggMode,
            },
          },
          {
            name: 'order_by_cols',
            config: {
              type: 'SelectControl',
              label: (0, _core.t)('Ordering'),
              description: (0, _core.t)('Order results by selected columns'),
              multi: true,
              default: [],
              mapStateToProps: ({ datasource }) => ({
                choices:
                  (datasource == null ? void 0 : datasource.order_by_choices) ||
                  [],
              }),
              visibility: isRawMode,
            },
          },
        ],
        [
          {
            name: 'server_pagination',
            config: {
              type: 'CheckboxControl',
              label: (0, _core.t)('Server pagination'),
              description: (0, _core.t)(
                'Enable server side pagination of results (experimental feature)',
              ),
              default: false,
            },
          },
        ],
        [
          {
            name: 'row_limit',
            override: {
              visibility: ({ controls }) => {
                var _controls$server_pagi;

                return !(
                  controls != null &&
                  (_controls$server_pagi = controls.server_pagination) !=
                    null &&
                  _controls$server_pagi.value
                );
              },
            },
          },
          {
            name: 'server_page_length',
            config: {
              type: 'SelectControl',
              freeForm: true,
              label: (0, _core.t)('Server Page Length'),
              default: 10,
              choices: _consts.PAGE_SIZE_OPTIONS,
              description: (0, _core.t)('Rows per page, 0 means no pagination'),
              visibility: ({ controls }) => {
                var _controls$server_pagi2;

                return Boolean(
                  controls == null
                    ? void 0
                    : (_controls$server_pagi2 = controls.server_pagination) ==
                      null
                    ? void 0
                    : _controls$server_pagi2.value,
                );
              },
            },
          },
        ],
        [
          {
            name: 'include_time',
            config: {
              type: 'CheckboxControl',
              label: (0, _core.t)('Include time'),
              description: (0, _core.t)(
                'Whether to include the time granularity as defined in the time section',
              ),
              default: false,
              visibility: isAggMode,
            },
          },
          {
            name: 'order_desc',
            config: {
              type: 'CheckboxControl',
              label: (0, _core.t)('Sort descending'),
              default: true,
              description: (0, _core.t)(
                'Whether to sort descending or ascending',
              ),
              visibility: isAggMode,
            },
          },
        ],
        [
          {
            name: 'show_totals',
            config: {
              type: 'CheckboxControl',
              label: (0, _core.t)('Show totals'),
              default: false,
              description: (0, _core.t)(
                'Show total aggregations of selected metrics. Note that row limit does not apply to the result.',
              ),
              visibility: isAggMode,
            },
          },
        ],
        ['adhoc_filters'],
      ],
    },
    {
      label: (0, _core.t)('Options'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'table_timestamp_format',
            config: {
              type: 'SelectControl',
              freeForm: true,
              label: (0, _core.t)('Timestamp format'),
              default: _core.smartDateFormatter.id,
              renderTrigger: true,
              clearable: false,
              choices: _chartControls.D3_TIME_FORMAT_OPTIONS,
              description: (0, _core.t)('D3 time format for datetime columns'),
            },
          },
        ],
        [
          {
            name: 'page_length',
            config: {
              type: 'SelectControl',
              freeForm: true,
              renderTrigger: true,
              label: (0, _core.t)('Page length'),
              default: null,
              choices: _consts.PAGE_SIZE_OPTIONS,
              description: (0, _core.t)('Rows per page, 0 means no pagination'),
              visibility: ({ controls }) => {
                var _controls$server_pagi3;

                return !(
                  controls != null &&
                  (_controls$server_pagi3 = controls.server_pagination) !=
                    null &&
                  _controls$server_pagi3.value
                );
              },
            },
          },
          null,
        ],
        [
          {
            name: 'include_search',
            config: {
              type: 'CheckboxControl',
              label: (0, _core.t)('Search box'),
              renderTrigger: true,
              default: false,
              description: (0, _core.t)(
                'Whether to include a client-side search box',
              ),
            },
          },
          {
            name: 'show_cell_bars',
            config: {
              type: 'CheckboxControl',
              label: (0, _core.t)('Cell bars'),
              renderTrigger: true,
              default: true,
              description: (0, _core.t)(
                'Whether to display a bar chart background in table columns',
              ),
            },
          },
        ],
        [
          {
            name: 'align_pn',
            config: {
              type: 'CheckboxControl',
              label: (0, _core.t)('Align +/-'),
              renderTrigger: true,
              default: false,
              description: (0, _core.t)(
                'Whether to align background charts with both positive and negative values at 0',
              ),
            },
          },
          {
            name: 'color_pn',
            config: {
              type: 'CheckboxControl',
              label: (0, _core.t)('Color +/-'),
              renderTrigger: true,
              default: true,
              description: (0, _core.t)(
                'Whether to colorize numeric values by if they are positive or negative',
              ),
            },
          },
        ],
        (0, _core.isFeatureEnabled)(_core.FeatureFlag.DASHBOARD_CROSS_FILTERS)
          ? [
              {
                name: 'table_filter',
                config: {
                  type: 'CheckboxControl',
                  label: (0, _core.t)('Enable emitting filters'),
                  renderTrigger: true,
                  default: false,
                  description: (0, _core.t)(
                    'Whether to apply filter to dashboards when table cells are clicked',
                  ),
                },
              },
            ]
          : [],
        [
          {
            name: 'column_config',
            config: {
              type: 'ColumnConfigControl',
              label: (0, _core.t)('Customize columns'),
              description: (0, _core.t)(
                'Further customize how to display each column',
              ),
              renderTrigger: true,

              mapStateToProps(explore, control, chart) {
                var _chart$queriesRespons;

                return {
                  queryResponse:
                    chart == null
                      ? void 0
                      : (_chart$queriesRespons = chart.queriesResponse) == null
                      ? void 0
                      : _chart$queriesRespons[0],
                };
              },
            },
          },
        ],
      ],
    },
  ],
};
var _default = config;
exports.default = _default;
