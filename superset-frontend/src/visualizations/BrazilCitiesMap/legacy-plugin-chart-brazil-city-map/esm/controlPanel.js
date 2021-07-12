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
import { t } from '@superset-ui/core';
import {
  D3_FORMAT_OPTIONS,
  D3_FORMAT_DOCS,
  sections,
  ColumnOption,
} from '@superset-ui/chart-controls';
import { formatSelectOptions } from './utilities/utils';
import { jsx as ___EmotionJSX } from '@emotion/react';

const state_column = {
  type: 'SelectControl',
  label: t('State Code'),
  description: t('State Column'),
  multi: false,
  freeForm: true,
  allowAll: true,
  commaChoosesOption: false,
  default: [],
  optionRenderer: c =>
    ___EmotionJSX(ColumnOption, {
      showType: true,
      column: c,
    }),
  valueRenderer: c =>
    ___EmotionJSX(ColumnOption, {
      column: c,
    }),
  valueKey: 'column_name',
  mapStateToProps: ({ datasource, controls }, controlState) => ({
    options: (datasource == null ? void 0 : datasource.columns) || [],
  }),
};

const color_column = {
  type: 'SelectControl',
  label: t('Color Code'),
  description: t('Color Column'),
  multi: false,
  freeForm: true,
  allowAll: true,
  commaChoosesOption: false,
  default: [],
  optionRenderer: c =>
    ___EmotionJSX(ColumnOption, {
      showType: true,
      column: c,
    }),
  valueRenderer: c =>
    ___EmotionJSX(ColumnOption, {
      column: c,
    }),
  valueKey: 'column_name',
  mapStateToProps: ({ datasource, controls }, controlState) => ({
    options: (datasource == null ? void 0 : datasource.columns) || [],
  }),
};

const config = {
  controlPanelSections: [
    {
      label: t('Query'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'state_column',
            config: state_column,
          },
        ],
        ['entity'],
        ['metric'],
        ['adhoc_filters'],
      ],
    },
    {
      label: t('Polygon Settings'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'break_points',
            config: {
              type: 'SelectControl',
              multi: true,
              freeForm: true,
              label: t('Bucket break points'),
              choices: formatSelectOptions([]),
              description: t(
                'List of n+1 values for bucketing metric into n buckets.',
              ),
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'color_break_points',
            config: {
              type: 'SelectControl',
              multi: true,
              freeForm: true,
              label: t('Color of buckets'),
              choices: formatSelectOptions([]),
              description: t('How many buckets should the data be grouped in.'),
              renderTrigger: true,
            },
          },
        ],
      ],
    },
    {
      label: t('Chart Options'),
      expanded: true,
      tabOverride: 'customize',
      controlSetRows: [
        [
          {
            name: 'number_format',
            config: {
              type: 'SelectControl',
              freeForm: true,
              label: t('Number format'),
              renderTrigger: true,
              default: 'SMART_NUMBER',
              choices: D3_FORMAT_OPTIONS,
              description: D3_FORMAT_DOCS,
            },
          },
        ],
        [
          {
            name: 'color_column',
            config: color_column,
          },
        ],
        ['linear_color_scheme'],
      ],
    },
  ],
  controlOverrides: {
    entity: {
      label: t('IBGE City Codes'),
      description: t('Column containing IBGE codes of city in your table.'),
    },
    metric: {
      label: t('Metric'),
      description: 'Metric to display bottom title',
    },
    linear_color_scheme: {
      renderTrigger: false,
    },
  },
};
export default config;
