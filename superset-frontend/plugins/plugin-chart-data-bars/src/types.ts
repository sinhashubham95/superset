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
import { ColumnConfig } from '@superset-ui/chart-controls';
import {
  DataRecordValue,
  QueryFormData,
  QueryFormMetric,
  TimeGranularity,
} from '@superset-ui/core';

export interface DataBarsStylesProps {
  height: number;
  width: number;
}

export type DataBarsQueryFormData = QueryFormData &
  DataBarsStylesProps & {
    align_pn?: boolean;
    color_pn?: boolean;
    include_time?: boolean;
    include_search?: boolean;
    page_length?: string | number | null;
    metrics?: QueryFormMetric[] | null;
    percent_metrics?: QueryFormMetric[] | null;
    timeseries_limit_metric?: QueryFormMetric[] | QueryFormMetric | null;
    groupby?: QueryFormMetric[] | null;
    all_columns?: QueryFormMetric[] | null;
    order_desc?: boolean;
    table_timestamp_format?: string;
    emit_filter?: boolean;
    granularitySqla?: string;
    time_grain_sqla?: TimeGranularity;
    column_config?: Record<string, ColumnConfig>;
  };

export type DataBarsDataRecord = {
  cnt: number;
  percentage: number;
  colour: string;
  [key: string]: DataRecordValue;
};

export type DataBarsProps = DataBarsStylesProps & {
  data: DataBarsDataRecord[];
  // add typing here for the props you pass in from transformProps.ts!
  formData: DataBarsQueryFormData;
};
