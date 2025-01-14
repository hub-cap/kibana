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

import { encryptTelemetry } from './collectors';

export type EncryptedStatsGetterConfig = { unencrypted: false } & {
  server: any;
  start: any;
  end: any;
  isDev: boolean;
};

export type UnencryptedStatsGetterConfig = { unencrypted: true } & {
  req: any;
  start: any;
  end: any;
  isDev: boolean;
};

export interface StatsCollectionConfig {
  callCluster: any;
  server: any;
  start: any;
  end: any;
}

export type StatsGetterConfig = UnencryptedStatsGetterConfig | EncryptedStatsGetterConfig;

export type StatsGetter = (config: StatsGetterConfig) => Promise<any[]>;

export const getStatsCollectionConfig = (
  config: StatsGetterConfig,
  esClustser: string
): StatsCollectionConfig => {
  const { start, end } = config;
  const server = config.unencrypted ? config.req.server : config.server;
  const { callWithRequest, callWithInternalUser } = server.plugins.elasticsearch.getCluster(
    esClustser
  );
  const callCluster = config.unencrypted
    ? (...args: any[]) => callWithRequest(config.req, ...args)
    : callWithInternalUser;

  return { server, callCluster, start, end };
};

export class TelemetryCollectionManager {
  private getterMethod?: StatsGetter;
  private collectionTitle?: string;
  private getterMethodPriority = -1;

  public setStatsGetter = (statsGetter: StatsGetter, title: string, priority = 0) => {
    if (priority > this.getterMethodPriority) {
      this.getterMethod = statsGetter;
      this.collectionTitle = title;
      this.getterMethodPriority = priority;
    }
  };

  private getStats = async (config: StatsGetterConfig) => {
    if (!this.getterMethod) {
      throw Error('Stats getter method not set.');
    }
    const usageData = await this.getterMethod(config);

    if (config.unencrypted) return usageData;
    return encryptTelemetry(usageData, config.isDev);
  };
  public getCollectionTitle = () => {
    return this.collectionTitle;
  };

  public getStatsGetter = () => {
    if (!this.getterMethod) {
      throw Error('Stats getter method not set.');
    }
    return {
      getStats: this.getStats,
      priority: this.getterMethodPriority,
      title: this.collectionTitle,
    };
  };
}

export const telemetryCollectionManager = new TelemetryCollectionManager();
