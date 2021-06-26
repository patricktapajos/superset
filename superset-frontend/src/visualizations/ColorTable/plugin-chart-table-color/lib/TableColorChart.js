'use strict';

exports.__esModule = true;
exports.default = TableColotChart;

var _react = _interopRequireWildcard(require('react'));

var _d3Array = require('d3-array');

var _fa = require('react-icons/fa');

var _core = require('@superset-ui/core');

var _DataTable = _interopRequireDefault(require('./DataTable'));

var _Styles = _interopRequireDefault(require('./Styles'));

var _formatValue = require('./utils/formatValue');

var _consts = require('./consts');

var _externalAPIs = require('./DataTable/utils/externalAPIs');

var _react2 = require('@emotion/react');

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

function _extends() {
  _extends =
    Object.assign ||
    function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
  return _extends.apply(this, arguments);
}

/**
 * Return sortType based on data type
 */
function getSortTypeByDataType(dataType) {
  if (dataType === _core.GenericDataType.TEMPORAL) {
    return 'datetime';
  }

  if (dataType === _core.GenericDataType.STRING) {
    return 'alphanumeric';
  }

  return 'basic';
}
/**
 * Cell background to render columns as horizontal bar chart
 */

function cellBar({
  value,
  valueRange,
  colorPositiveNegative = false,
  alignPositiveNegative,
}) {
  const [minValue, maxValue] = valueRange;
  const r = colorPositiveNegative && value < 0 ? 150 : 0;

  if (alignPositiveNegative) {
    const perc = Math.abs(Math.round((value / maxValue) * 100)); // The 0.01 to 0.001 is a workaround for what appears to be a
    // CSS rendering bug on flat, transparent colors

    return (
      `linear-gradient(to right, rgba(${r},0,0,0.2), rgba(${r},0,0,0.2) ${perc}%, ` +
      `rgba(0,0,0,0.01) ${perc}%, rgba(0,0,0,0.001) 100%)`
    );
  }

  const posExtent = Math.abs(Math.max(maxValue, 0));
  const negExtent = Math.abs(Math.min(minValue, 0));
  const tot = posExtent + negExtent;
  const perc1 = Math.round(
    (Math.min(negExtent + value, negExtent) / tot) * 100,
  );
  const perc2 = Math.round((Math.abs(value) / tot) * 100); // The 0.01 to 0.001 is a workaround for what appears to be a
  // CSS rendering bug on flat, transparent colors

  return (
    `linear-gradient(to right, rgba(0,0,0,0.01), rgba(0,0,0,0.001) ${perc1}%, ` +
    `rgba(${r},0,0,0.2) ${perc1}%, rgba(${r},0,0,0.2) ${perc1 + perc2}%, ` +
    `rgba(0,0,0,0.01) ${perc1 + perc2}%, rgba(0,0,0,0.001) 100%)`
  );
}

function SortIcon({ column }) {
  const { isSorted, isSortedDesc } = column;
  let sortIcon = (0, _react2.jsx)(_fa.FaSort, null);

  if (isSorted) {
    sortIcon = isSortedDesc
      ? (0, _react2.jsx)(_fa.FaSortDown, null)
      : (0, _react2.jsx)(_fa.FaSortUp, null);
  }

  return sortIcon;
}

function SearchInput({ count, value, onChange }) {
  return (0, _react2.jsx)(
    'span',
    {
      className: 'dt-global-filter',
    },
    (0, _core.t)('Search'),
    ' ',
    (0, _react2.jsx)('input', {
      className: 'form-control input-sm',
      placeholder: (0, _core.tn)('search.num_records', count),
      value: value,
      onChange: onChange,
    }),
  );
}

function SelectPageSize({ options, current, onChange }) {
  return (0, _react2.jsx)(
    'span',
    {
      className: 'dt-select-page-size form-inline',
    },
    (0, _core.t)('page_size.show'),
    ' ',
    (0, _react2.jsx)(
      'select',
      {
        className: 'form-control input-sm',
        value: current,
        onBlur: () => {},
        onChange: e => {
          onChange(Number(e.target.value));
        },
      },
      options.map(option => {
        const [size, text] = Array.isArray(option) ? option : [option, option];
        return (0, _react2.jsx)(
          'option',
          {
            key: size,
            value: size,
          },
          text,
        );
      }),
    ),
    ' ',
    (0, _core.t)('page_size.entries'),
  );
}

function TableChart(props) {
  const {
    height,
    width,
    data,
    totals,
    isRawRecords,
    rowCount = 0,
    columns: columnsMeta,
    alignPositiveNegative: defaultAlignPN = false,
    colorPositiveNegative: defaultColorPN = false,
    includeSearch = false,
    pageSize = 0,
    serverPagination = false,
    serverPaginationData,
    setDataMask,
    showCellBars = true,
    emitFilter = false,
    sortDesc = false,
    filters: initialFilters = {},
    sticky = true, // whether to use sticky header
  } = props;
  const [filters, setFilters] = (0, _react.useState)(initialFilters);
  const handleChange = (0, _react.useCallback)(
    filters => {
      if (!emitFilter) {
        return;
      }

      const groupBy = Object.keys(filters);
      const groupByValues = Object.values(filters);
      setDataMask({
        extraFormData: {
          filters:
            groupBy.length === 0
              ? []
              : groupBy.map(col => {
                  const val = filters == null ? void 0 : filters[col];
                  if (val === null || val === undefined)
                    return {
                      col,
                      op: 'IS NULL',
                    };
                  return {
                    col,
                    op: 'IN',
                    val: val,
                  };
                }),
        },
        filterState: {
          value: groupByValues.length ? groupByValues : null,
        },
      });
    },
    [emitFilter, setDataMask],
  ); // only take relevant page size options

  const pageSizeOptions = (0, _react.useMemo)(() => {
    const getServerPagination = n => n <= rowCount;

    return _consts.PAGE_SIZE_OPTIONS.filter(([n]) =>
      serverPagination ? getServerPagination(n) : n <= 2 * data.length,
    );
  }, [data.length, rowCount, serverPagination]);
  const getValueRange = (0, _react.useCallback)(
    function getValueRange(key, alignPositiveNegative) {
      var _data$;

      if (
        typeof (data == null
          ? void 0
          : (_data$ = data[0]) == null
          ? void 0
          : _data$[key]) === 'number'
      ) {
        const nums = data.map(row => row[key]);
        return alignPositiveNegative
          ? [0, (0, _d3Array.max)(nums.map(Math.abs))]
          : (0, _d3Array.extent)(nums);
      }

      return null;
    },
    [data],
  );
  const isActiveFilterValue = (0, _react.useCallback)(
    function isActiveFilterValue(key, val) {
      var _filters$key;

      return (
        !!filters &&
        ((_filters$key = filters[key]) == null
          ? void 0
          : _filters$key.includes(val))
      );
    },
    [filters],
  );
  const toggleFilter = (0, _react.useCallback)(
    function toggleFilter(key, val) {
      const updatedFilters = { ...(filters || {}) };

      if (filters && isActiveFilterValue(key, val)) {
        updatedFilters[key] = filters[key].filter(x => x !== val);
      } else {
        updatedFilters[key] = [
          ...((filters == null ? void 0 : filters[key]) || []),
          val,
        ];
      }

      if (
        Array.isArray(updatedFilters[key]) &&
        updatedFilters[key].length === 0
      ) {
        delete updatedFilters[key];
      }

      setFilters(updatedFilters);
      handleChange(updatedFilters);
    },
    [filters, handleChange, isActiveFilterValue],
  );

  const getSharedStyle = column => {
    const { isNumeric, config = {} } = column;
    const textAlign = config.horizontalAlign
      ? config.horizontalAlign
      : isNumeric
      ? 'right'
      : 'left';
    return {
      textAlign,
    };
  };

  const getColumnConfigs = (0, _react.useCallback)(
    (column, i) => {
      const { key, label, isNumeric, dataType, isMetric, config = {} } = column;
      const isFilter = !isNumeric && emitFilter;
      const columnWidth = Number.isNaN(Number(config.columnWidth))
        ? config.columnWidth
        : Number(config.columnWidth); // inline style for both th and td cell

      const sharedStyle = getSharedStyle(column);
      const alignPositiveNegative =
        config.alignPositiveNegative === undefined
          ? defaultAlignPN
          : config.alignPositiveNegative;
      const colorPositiveNegative =
        config.colorPositiveNegative === undefined
          ? defaultColorPN
          : config.colorPositiveNegative;
      const valueRange =
        (config.showCellBars === undefined
          ? showCellBars
          : config.showCellBars) &&
        (isMetric || isRawRecords) &&
        getValueRange(key, alignPositiveNegative);
      let className = '';

      if (isFilter) {
        className += ' dt-is-filter';
      }

      return {
        id: String(i),
        // to allow duplicate column keys
        // must use custom accessor to allow `.` in column names
        // typing is incorrect in current version of `@types/react-table`
        // so we ask TS not to check.
        accessor: datum => datum[key],
        Cell: ({ value }) => {
          const [isHtml, text] = (0, _formatValue.formatColumnValue)(
            column,
            value,
          );
          const html = isHtml
            ? {
                __html: text,
              }
            : undefined;
          const cellProps = {
            // show raw number in title in case of numeric values
            title: typeof value === 'number' ? String(value) : undefined,
            onClick:
              emitFilter && !valueRange
                ? () => toggleFilter(key, value)
                : undefined,
            className: [
              className,
              value == null ? 'dt-is-null' : '',
              isActiveFilterValue(key, value) ? ' dt-is-active-filter' : '',
            ].join(' '),
            style: {
              ...sharedStyle,
              background: valueRange
                ? cellBar({
                    value: value,
                    valueRange,
                    alignPositiveNegative,
                    colorPositiveNegative,
                  })
                : undefined,
            },
          };

          if (html) {
            // eslint-disable-next-line react/no-danger
            return (0, _react2.jsx)(
              'td',
              _extends({}, cellProps, {
                dangerouslySetInnerHTML: html,
              }),
            );
          } // If cellProps renderes textContent already, then we don't have to
          // render `Cell`. This saves some time for large tables.

          return (0, _react2.jsx)('td', cellProps, text);
        },
        Header: ({ column: col, onClick, style }) =>
          (0, _react2.jsx)(
            'th',
            {
              title: 'Shift + Click to sort by multiple columns',
              className: [className, col.isSorted ? 'is-sorted' : ''].join(' '),
              style: { ...sharedStyle, ...style },
              onClick: onClick,
            },
            config.columnWidth // column width hint
              ? (0, _react2.jsx)('div', {
                  style: {
                    width: columnWidth,
                    height: 0.01,
                  },
                })
              : null,
            label,
            (0, _react2.jsx)(SortIcon, {
              column: col,
            }),
          ),
        Footer: totals
          ? i === 0
            ? (0, _react2.jsx)('th', null, (0, _core.t)('Totals'))
            : (0, _react2.jsx)(
                'td',
                {
                  style: sharedStyle,
                },
                (0, _react2.jsx)(
                  'strong',
                  null,
                  (0, _formatValue.formatColumnValue)(column, totals[key])[1],
                ),
              )
          : undefined,
        sortDescFirst: sortDesc,
        sortType: getSortTypeByDataType(dataType),
      };
    },
    [
      defaultAlignPN,
      defaultColorPN,
      emitFilter,
      getValueRange,
      isActiveFilterValue,
      isRawRecords,
      showCellBars,
      sortDesc,
      toggleFilter,
      totals,
    ],
  );
  const columns = (0, _react.useMemo)(() => columnsMeta.map(getColumnConfigs), [
    columnsMeta,
    getColumnConfigs,
  ]);

  const handleServerPaginationChange = (pageNumber, pageSize) => {
    (0, _externalAPIs.updateExternalFormData)(
      setDataMask,
      pageNumber,
      pageSize,
    );
  };

  return (0, _react2.jsx)(
    _Styles.default,
    null,
    (0, _react2.jsx)(_DataTable.default, {
      columns: columns,
      data: data,
      rowCount: rowCount,
      tableClassName: 'table table-striped table-condensed',
      pageSize: pageSize,
      serverPaginationData: serverPaginationData,
      pageSizeOptions: pageSizeOptions,
      width: width,
      height: height,
      serverPagination: serverPagination,
      onServerPaginationChange: handleServerPaginationChange, // 9 page items in > 340px works well even for 100+ pages
      maxPageItemCount: width > 340 ? 9 : 7,
      noResults: filter =>
        (0, _core.t)(filter ? 'No matching records found' : 'No records found'),
      searchInput: includeSearch && SearchInput,
      selectPageSize: pageSize !== null && SelectPageSize, // not in use in Superset, but needed for unit tests
      sticky: sticky,
    }),
  );
}
