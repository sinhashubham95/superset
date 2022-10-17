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
import React, { MouseEvent } from 'react';
import {
  t,
  getNumberFormatter,
  NumberFormatter,
  smartDateVerboseFormatter,
  TimeFormatter,
  computeMaxFontSize,
  BRAND_COLOR,
  styled,
  QueryObjectFilterClause,
} from '@superset-ui/core';
import Switchboard from '@superset-ui/switchboard';
import { EChartsCoreOption } from 'echarts';
import Echart from '../components/Echart';
import { BigNumberWithTrendlineFormData, TimeSeriesDatum } from './types';
import { EventHandlers } from '../types';

const defaultNumberFormatter = getNumberFormatter();

const PROPORTION = {
  // text size: proportion of the chart container sans trendline
  KICKER: 0.1,
  HEADER: 0.3,
  SUBHEADER: 0.125,
  // trendline size: proportion of the whole chart container
  TRENDLINE: 0.3,
};

type BigNumberVisProps = {
  className?: string;
  width: number;
  height: number;
  bigNumber?: number | null;
  bigNumberFallback?: TimeSeriesDatum;
  headerFormatter: NumberFormatter | TimeFormatter;
  formatTime: TimeFormatter;
  headerFontSize: number;
  kickerFontSize: number;
  subheader: string;
  subheaderFontSize: number;
  showTimestamp?: boolean;
  showTrendLine?: boolean;
  startYAxisAtZero?: boolean;
  timeRangeFixed?: boolean;
  timestamp?: number;
  trendLineData?: TimeSeriesDatum[];
  mainColor: string;
  echartOptions: EChartsCoreOption;
  onContextMenu?: (
    filters: QueryObjectFilterClause[],
    clientX: number,
    clientY: number,
  ) => void;
  xValueFormatter?: TimeFormatter;
  formData?: BigNumberWithTrendlineFormData;
};

class BigNumberVis extends React.PureComponent<BigNumberVisProps> {
  static defaultProps = {
    className: '',
    headerFormatter: defaultNumberFormatter,
    formatTime: smartDateVerboseFormatter,
    headerFontSize: PROPORTION.HEADER,
    kickerFontSize: PROPORTION.KICKER,
    mainColor: BRAND_COLOR,
    showTimestamp: false,
    showTrendLine: false,
    startYAxisAtZero: true,
    subheader: '',
    subheaderFontSize: PROPORTION.SUBHEADER,
    timeRangeFixed: false,
  };

  getClassName() {
    const { className, showTrendLine, bigNumberFallback } = this.props;
    const names = `superset-legacy-chart-big-number ${className} ${
      bigNumberFallback ? 'is-fallback-value' : ''
    }`;
    if (showTrendLine) return names;
    return `${names} no-trendline`;
  }

  createTemporaryContainer() {
    const container = document.createElement('div');
    container.className = this.getClassName();
    container.style.position = 'absolute'; // so it won't disrupt page layout
    container.style.opacity = '0'; // and not visible
    return container;
  }

  onClick = () => {
    const { bigNumber, subheader } = this.props;
    Switchboard.emit('click', { value: bigNumber, key: subheader });
  };

  renderFallbackWarning() {
    const { bigNumberFallback, formatTime, showTimestamp } = this.props;
    if (!bigNumberFallback || showTimestamp) return null;
    return (
      <span
        className="alert alert-warning"
        role="alert"
        title={t(
          `Last available value seen on %s`,
          formatTime(bigNumberFallback[0]),
        )}
      >
        {t('Not up to date')}
      </span>
    );
  }

  renderKicker(maxHeight: number) {
    const { timestamp, showTimestamp, formatTime, width } = this.props;
    if (!showTimestamp) return null;

    const text = timestamp === null ? '' : formatTime(timestamp);

    const container = this.createTemporaryContainer();
    document.body.append(container);
    const fontSize = computeMaxFontSize({
      text,
      maxWidth: width,
      maxHeight,
      className: 'kicker',
      container,
    });
    container.remove();

    return (
      <div
        className="kicker"
        style={{
          fontSize,
          height: maxHeight,
        }}
      >
        {text}
      </div>
    );
  }

  renderHeader(maxHeight: number) {
    const { bigNumber, headerFormatter, width } = this.props;
    const text = bigNumber === null ? t('No data') : headerFormatter(bigNumber);

    const container = this.createTemporaryContainer();
    document.body.append(container);
    const fontSize = computeMaxFontSize({
      text,
      maxWidth: width - 8, // Decrease 8px for more precise font size
      maxHeight,
      className: 'header-line',
      container,
    });
    container.remove();

    const onContextMenu = (e: MouseEvent<HTMLDivElement>) => {
      if (this.props.onContextMenu) {
        e.preventDefault();
        this.props.onContextMenu(
          [],
          e.nativeEvent.clientX,
          e.nativeEvent.clientY,
        );
      }
    };

    return (
      <div
        className="header-line"
        style={{
          fontSize,
          height: maxHeight,
        }}
        onContextMenu={onContextMenu}
      >
        {text}
      </div>
    );
  }

  renderSubheader(maxHeight: number) {
    const { bigNumber, subheader, width, bigNumberFallback } = this.props;
    let fontSize = 0;

    const NO_DATA_OR_HASNT_LANDED = t(
      'No data after filtering or data is NULL for the latest time record',
    );
    const NO_DATA = t(
      'Try applying different filters or ensuring your datasource has data',
    );
    let text = subheader;
    if (bigNumber === null) {
      text = bigNumberFallback ? NO_DATA : NO_DATA_OR_HASNT_LANDED;
    }
    if (text) {
      const container = this.createTemporaryContainer();
      document.body.append(container);
      fontSize = computeMaxFontSize({
        text,
        maxWidth: width,
        maxHeight,
        className: 'subheader-line',
        container,
      });
      container.remove();

      return (
        <div
          className="subheader-line"
          style={{
            fontSize,
            height: maxHeight,
          }}
        >
          {text}
        </div>
      );
    }
    return null;
  }

  renderTrendline(maxHeight: number) {
    const { width, trendLineData, echartOptions } = this.props;

    // if can't find any non-null values, no point rendering the trendline
    if (!trendLineData?.some(d => d[1] !== null)) {
      return null;
    }

    const eventHandlers: EventHandlers = {
      contextmenu: eventParams => {
        if (this.props.onContextMenu) {
          eventParams.event.stop();
          const { data } = eventParams;
          if (data) {
            const pointerEvent = eventParams.event.event;
            const filters: QueryObjectFilterClause[] = [];
            filters.push({
              col: this.props.formData?.granularitySqla,
              grain: this.props.formData?.timeGrainSqla,
              op: '==',
              val: data[0],
              formattedVal: this.props.xValueFormatter?.(data[0]),
            });
            this.props.onContextMenu(
              filters,
              pointerEvent.clientX,
              pointerEvent.clientY,
            );
          }
        }
      },
    };

    return (
      <Echart
        width={Math.floor(width)}
        height={maxHeight}
        echartOptions={echartOptions}
        eventHandlers={eventHandlers}
      />
    );
  }

  render() {
    const {
      showTrendLine,
      height,
      kickerFontSize,
      headerFontSize,
      subheaderFontSize,
    } = this.props;
    const className = this.getClassName();

    if (showTrendLine) {
      const chartHeight = Math.floor(PROPORTION.TRENDLINE * height);
      const allTextHeight = height - chartHeight;

      return (
        <div className={className}>
          <div className="text-container" style={{ height: allTextHeight }}>
            {this.renderFallbackWarning()}
            {this.renderKicker(
              Math.ceil(kickerFontSize * (1 - PROPORTION.TRENDLINE) * height),
            )}
            {this.renderHeader(
              Math.ceil(headerFontSize * (1 - PROPORTION.TRENDLINE) * height),
            )}
            {this.renderSubheader(
              Math.ceil(
                subheaderFontSize * (1 - PROPORTION.TRENDLINE) * height,
              ),
            )}
          </div>
          {this.renderTrendline(chartHeight)}
        </div>
      );
    }

    return (
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      <div className={className} style={{ height }} onClick={this.onClick}>
        {this.renderFallbackWarning()}
        {this.renderKicker(kickerFontSize * height)}
        {this.renderHeader(Math.ceil(headerFontSize * height))}
      </div>
    );
  }
}

export default styled(BigNumberVis)`
  ${({ theme }) => `
    font-family: ${theme.typography.families.sansSerif};
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;

    &.no-trendline .subheader-line {
      padding-bottom: 0.3em;
    }

    .text-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      .alert {
        font-size: ${theme.typography.sizes.s};
        margin: -0.5em 0 0.4em;
        line-height: 1;
        padding: ${theme.gridUnit}px;
        border-radius: ${theme.gridUnit}px;
      }
    }

    .kicker {
      line-height: 1em;
      padding-bottom: 2em;
    }

    .header-line {
      position: relative;
      line-height: 1em;
      span {
        position: absolute;
        bottom: 0;
      }
    }

    .subheader-line {
      line-height: 1em;
      padding-bottom: 0;
    }

    &.is-fallback-value {
      .kicker,
      .header-line,
      .subheader-line {
        opacity: ${theme.opacity.mediumHeavy};
      }
    }
  `}
`;
