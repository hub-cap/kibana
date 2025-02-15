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

import expect from '@kbn/expect';

export default function ({ getService, getPageObjects }) {
  const log = getService('log');
  const retry = getService('retry');
  const inspector = getService('inspector');
  const find = getService('find');
  const filterBar = getService('filterBar');
  const testSubjects = getService('testSubjects');
  const browser = getService('browser');
  const PageObjects = getPageObjects(['common', 'visualize', 'timePicker', 'settings']);


  describe('tile map visualize app', function () {

    describe('incomplete config', function describeIndexTests() {

      before(async function () {
        await browser.setWindowSize(1280, 1000);

        const fromTime = '2015-09-19 06:31:44.000';
        const toTime = '2015-09-23 18:31:44.000';

        log.debug('navigateToApp visualize');
        await PageObjects.visualize.navigateToNewVisualization();
        log.debug('clickTileMap');
        await PageObjects.visualize.clickTileMap();
        await PageObjects.visualize.clickNewSearch();
        await PageObjects.timePicker.setAbsoluteRange(fromTime, toTime);
        //do not configure aggs
      });


      it('should be able to zoom in twice', async () => {
        //should not throw
        await PageObjects.visualize.clickMapZoomIn();
        await PageObjects.visualize.clickMapZoomIn();
      });
    });


    describe('complete config', function describeIndexTests() {
      before(async function () {
        await browser.setWindowSize(1280, 1000);

        const fromTime = '2015-09-19 06:31:44.000';
        const toTime = '2015-09-23 18:31:44.000';

        log.debug('navigateToApp visualize');
        await PageObjects.visualize.navigateToNewVisualization();
        log.debug('clickTileMap');
        await PageObjects.visualize.clickTileMap();
        await PageObjects.visualize.clickNewSearch();
        await PageObjects.timePicker.setAbsoluteRange(fromTime, toTime);
        log.debug('select bucket Geo Coordinates');
        await PageObjects.visualize.clickBucket('Geo coordinates');
        log.debug('Click aggregation Geohash');
        await PageObjects.visualize.selectAggregation('Geohash');
        log.debug('Click field geo.coordinates');
        await retry.try(async function tryingForTime() {
          await PageObjects.visualize.selectField('geo.coordinates');
        });
        await PageObjects.visualize.clickGo();
      });

      /**
       * manually compare data due to possible small difference in numbers. This is browser dependent.
       */
      function compareTableData(actual, expected) {
        log.debug('comparing expected: ', expected);
        log.debug('with actual: ', actual);

        const roundedValues = actual.map(row => {
          // Parse last element in each row as JSON and floor the lat/long value
          const coords = JSON.parse(row[row.length - 1]);
          row[row.length - 1] = {
            lat: Math.floor(parseFloat(coords.lat)),
            lon: Math.floor(parseFloat(coords.lon)),
          };
          return row;
        });

        expect(roundedValues).to.eql(expected);
      }

      describe('tile map chart', function indexPatternCreation() {
        it('should have inspector enabled', async function () {
          await inspector.expectIsEnabled();
        });

        it('should show correct tile map data on default zoom level', async function () {
          const expectedTableData = [
            ['-', '9', '5,787', { 'lat': 37, 'lon': -104 } ],
            ['-', 'd', '5,600', { 'lat': 37, 'lon': -82 } ],
            ['-', 'c', '1,319', { 'lat': 47, 'lon': -110 } ],
            ['-', 'b', '999', { 'lat': 62, 'lon': -156 } ],
            ['-', 'f', '187', { 'lat': 45, 'lon': -83 } ],
            ['-', '8', '108', { 'lat': 18, 'lon': -157 } ]
          ];
          //level 1
          await PageObjects.visualize.clickMapZoomOut();
          //level 0
          await PageObjects.visualize.clickMapZoomOut();

          await inspector.open();
          await inspector.setTablePageSize(50);
          const actualTableData = await inspector.getTableData();
          await inspector.close();
          compareTableData(actualTableData, expectedTableData);
        });

        it('should not be able to zoom out beyond 0', async function () {
          await PageObjects.visualize.zoomAllTheWayOut();
          const enabled = await PageObjects.visualize.getMapZoomOutEnabled();
          expect(enabled).to.be(false);
        });

        // See https://github.com/elastic/kibana/issues/13137 if this test starts failing intermittently
        it('Fit data bounds should zoom to level 3', async function () {
          const expectedPrecision2DataTable = [
            ['-', 'dn', '1,429', { 'lat': 36, 'lon': -85 }],
            ['-', 'dp', '1,418', { 'lat': 41, 'lon': -85 }],
            ['-', '9y', '1,215', { 'lat': 36, 'lon': -96 }],
            ['-', '9z', '1,099', { 'lat': 42, 'lon': -96 }],
            ['-', 'dr', '1,076', { 'lat': 42, 'lon': -74 }],
            ['-', 'dj', '982', { 'lat': 31, 'lon': -85 }],
            ['-', '9v', '938', { 'lat': 31, 'lon': -96 }],
            ['-', '9q', '722', { 'lat': 36, 'lon': -120 }],
            ['-', '9w', '475', { 'lat': 36, 'lon': -107 }],
            ['-', 'cb', '457', { 'lat': 46, 'lon': -96 }],
            [ '-', 'c2', '453', { lat: 47, lon: -120 } ],
            [ '-', '9x', '420', { lat: 41, lon: -107 } ],
            [ '-', 'dq', '399', { lat: 37, lon: -78 } ],
            [ '-', '9r', '396', { lat: 41, lon: -120 } ],
            [ '-', '9t', '274', { lat: 32, lon: -107 } ],
            [ '-', 'c8', '271', { lat: 47, lon: -107 } ],
            [ '-', 'dh', '214', { lat: 26, lon: -82 } ],
            [ '-', 'b6', '207', { lat: 60, lon: -162 } ],
            [ '-', 'bd', '206', { lat: 59, lon: -153 } ],
            [ '-', 'b7', '167', { lat: 64, lon: -163 } ],
          ];

          await PageObjects.visualize.clickMapFitDataBounds();
          await inspector.open();
          const data = await inspector.getTableData();
          await inspector.close();
          compareTableData(data, expectedPrecision2DataTable);
        });

        it('Fit data bounds works with pinned filter data', async () => {
          const expectedPrecision2DataTable = [
            ['-', 'f05', '1', { lat: 45, lon: -85 }],
            ['-', 'dpr', '1', { lat: 40, lon: -79 }],
            ['-', '9qh', '1', { lat: 33, lon: -118 }],
          ];

          await filterBar.addFilter('bytes', 'is between', '19980', '19990');
          await filterBar.toggleFilterPinned('bytes');
          await PageObjects.visualize.zoomAllTheWayOut();
          await PageObjects.visualize.clickMapFitDataBounds();

          await inspector.open();
          const data = await inspector.getTableData();
          await inspector.close();

          await filterBar.removeAllFilters();
          compareTableData(data, expectedPrecision2DataTable);
        });

        it('Newly saved visualization retains map bounds', async () => {
          const vizName1 = 'Visualization TileMap';

          await PageObjects.visualize.clickMapZoomIn();
          await PageObjects.visualize.clickMapZoomIn();

          const mapBounds = await PageObjects.visualize.getMapBounds();
          await inspector.close();

          await PageObjects.visualize.saveVisualizationExpectSuccess(vizName1);

          const afterSaveMapBounds = await PageObjects.visualize.getMapBounds();

          await inspector.close();
          // For some reason the values are slightly different, so we can't check that they are equal. But we did
          // have a bug where after the save, there were _no_ map bounds. So this checks for the later case, but
          // until we figure out how to make sure the map center is always the exact same, we can't comparison check.
          expect(mapBounds).to.not.be(undefined);
          expect(afterSaveMapBounds).to.not.be(undefined);
        });

      });

      describe('Only request data around extent of map option', () => {

        it('when checked adds filters to aggregation', async () => {
          const vizName1 = 'Visualization TileMap';
          await PageObjects.visualize.loadSavedVisualization(vizName1);
          await inspector.open();
          await inspector.expectTableHeaders(['filter', 'geohash_grid', 'Count', 'Geo Centroid']);
          await inspector.close();
        });

        it('when not checked does not add filters to aggregation', async () => {
          await PageObjects.visualize.toggleOpenEditor(2);
          await PageObjects.visualize.setIsFilteredByCollarCheckbox(false);
          await PageObjects.visualize.clickGo();
          await inspector.open();
          await inspector.expectTableHeaders(['geohash_grid', 'Count', 'Geo Centroid']);
          await inspector.close();
        });

        after(async () => {
          await PageObjects.visualize.setIsFilteredByCollarCheckbox(true);
          await PageObjects.visualize.clickGo();
        });
      });
    });

    describe('zoom warning behavior', function describeIndexTests() {
      // Zoom warning is only applicable to OSS
      this.tags(['skipCloud', 'skipFirefox']);

      const waitForLoading = false;
      let zoomWarningEnabled;
      let last = false;
      const toastDefaultLife = 6000;

      before(async function () {
        await browser.setWindowSize(1280, 1000);

        log.debug('navigateToApp visualize');
        await PageObjects.visualize.navigateToNewVisualization();
        log.debug('clickTileMap');
        await PageObjects.visualize.clickTileMap();
        await PageObjects.visualize.clickNewSearch();

        zoomWarningEnabled = await testSubjects.exists('zoomWarningEnabled');
        log.debug(`Zoom warning enabled: ${zoomWarningEnabled}`);

        const zoomLevel = 9;
        for (let i = 0; i < zoomLevel; i++) {
          await PageObjects.visualize.clickMapZoomIn();
        }

      });

      beforeEach(async function () {
        await PageObjects.visualize.clickMapZoomIn(waitForLoading);
      });

      afterEach(async function () {
        if (!last) {
          await PageObjects.common.sleep(toastDefaultLife);
          await PageObjects.visualize.clickMapZoomOut(waitForLoading);
        }
      });

      it('should show warning at zoom 10',
        async () => {
          await testSubjects.existOrFail('maxZoomWarning');
        });

      it('should continue providing zoom warning if left alone',
        async () => {
          await testSubjects.existOrFail('maxZoomWarning');
        });

      it('should suppress zoom warning if suppress warnings button clicked',
        async () => {
          last = true;
          await PageObjects.visualize.waitForVisualization();
          await find.clickByCssSelector('[data-test-subj="suppressZoomWarnings"]');
          await PageObjects.visualize.clickMapZoomOut(waitForLoading);
          await testSubjects.waitForDeleted('suppressZoomWarnings');
          await PageObjects.visualize.clickMapZoomIn(waitForLoading);

          await testSubjects.missingOrFail('maxZoomWarning');
        });
    });
  });
}
