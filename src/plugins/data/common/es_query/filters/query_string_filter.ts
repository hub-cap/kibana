/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { Filter, FilterMeta } from './meta_filter';
import { IndexPattern } from '../../types';

export type QueryStringFilterMeta = FilterMeta;

export type QueryStringFilter = Filter & {
  meta: QueryStringFilterMeta;
  query?: {
    query_string: {
      query: string;
    };
  };
};

export const isQueryStringFilter = (filter: any): filter is QueryStringFilter =>
  filter && filter.query && filter.query.query_string;

// Creates a filter corresponding to a raw Elasticsearch query DSL object
export const buildQueryFilter = (
  query: QueryStringFilter['query'],
  index: IndexPattern,
  alias: string
) =>
  ({
    query,
    meta: {
      index,
      alias,
    },
  } as QueryStringFilter);
