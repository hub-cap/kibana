/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { createSelector } from 'reselect';
import { Query } from 'src/plugins/data/common';
import { SavedQuery } from 'src/legacy/core_plugins/data/public';
import { InputsRange } from '../../store/inputs/model';

export {
  endSelector,
  fromStrSelector,
  isLoadingSelector,
  kindSelector,
  queriesSelector,
  startSelector,
  toStrSelector,
} from '../super_date_picker/selectors';

export const getFilterQuery = (inputState: InputsRange): Query => inputState.query;

export const getSavedQuery = (inputState: InputsRange): SavedQuery | undefined =>
  inputState.savedQuery;

export const filterQuerySelector = () => createSelector(getFilterQuery, filterQuery => filterQuery);

export const savedQuerySelector = () => createSelector(getSavedQuery, savedQuery => savedQuery);
