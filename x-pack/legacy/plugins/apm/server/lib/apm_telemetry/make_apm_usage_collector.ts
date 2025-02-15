/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { CoreSetup } from 'src/core/server';
import { getSavedObjectsClient } from '../helpers/saved_objects_client';
import { APM_TELEMETRY_DOC_ID, createApmTelementry } from './apm_telemetry';
import { LegacySetup } from '../../new-platform/plugin';

export interface LegacySetupWithUsageCollector extends LegacySetup {
  server: LegacySetup['server'] & {
    usage: {
      collectorSet: {
        makeUsageCollector: (options: unknown) => unknown;
        register: (options: unknown) => unknown;
      };
    };
  };
}

export function makeApmUsageCollector(
  core: CoreSetup,
  { server }: LegacySetupWithUsageCollector
) {
  const apmUsageCollector = server.usage.collectorSet.makeUsageCollector({
    type: 'apm',
    fetch: async () => {
      const savedObjectsClient = getSavedObjectsClient(server);
      try {
        const apmTelemetrySavedObject = await savedObjectsClient.get(
          'apm-telemetry',
          APM_TELEMETRY_DOC_ID
        );
        return apmTelemetrySavedObject.attributes;
      } catch (err) {
        return createApmTelementry();
      }
    },
    isReady: () => true
  });
  server.usage.collectorSet.register(apmUsageCollector);
}
