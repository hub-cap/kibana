/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { kibanaResponseFactory, RequestHandlerContext } from '../../../../../../../src/core/server';
import { ILicenseCheck } from '../../../../../licensing/server';
// TODO, require from licensing plugin root once https://github.com/elastic/kibana/pull/44922 is merged.
import { LICENSE_STATUS } from '../../../../../licensing/server/constants';
import { RawKibanaPrivileges } from '../../../../common/model';
import { defineGetPrivilegesRoutes } from './get';

import { httpServerMock } from '../../../../../../../src/core/server/mocks';
import { routeDefinitionParamsMock } from '../../index.mock';

const createRawKibanaPrivileges: () => RawKibanaPrivileges = () => {
  return {
    features: {
      feature1: {
        all: ['action1'],
      },
      feature2: {
        all: ['action2'],
      },
    },
    space: {
      all: ['space*'],
      read: ['space:read'],
    },
    global: {
      all: ['*'],
      read: ['something:/read'],
    },
    reserved: {
      customApplication1: ['custom-action1'],
      customApplication2: ['custom-action2'],
    },
  };
};

interface TestOptions {
  licenseCheckResult?: ILicenseCheck;
  includeActions?: boolean;
  asserts: { statusCode: number; result: Record<string, any> };
}

describe('GET privileges', () => {
  const getPrivilegesTest = (
    description: string,
    { licenseCheckResult = { check: LICENSE_STATUS.Valid }, includeActions, asserts }: TestOptions
  ) => {
    test(description, async () => {
      const mockRouteDefinitionParams = routeDefinitionParamsMock.create();
      mockRouteDefinitionParams.authz.privileges.get.mockImplementation(() =>
        createRawKibanaPrivileges()
      );

      defineGetPrivilegesRoutes(mockRouteDefinitionParams);
      const [[, handler]] = mockRouteDefinitionParams.router.get.mock.calls;

      const headers = { authorization: 'foo' };
      const mockRequest = httpServerMock.createKibanaRequest({
        method: 'get',
        path: `/api/security/privileges${includeActions ? '?includeActions=true' : ''}`,
        query: includeActions ? { includeActions: 'true' } : undefined,
        headers,
      });
      const mockContext = ({
        licensing: { license: { check: jest.fn().mockReturnValue(licenseCheckResult) } },
      } as unknown) as RequestHandlerContext;

      const response = await handler(mockContext, mockRequest, kibanaResponseFactory);
      expect(response.status).toBe(asserts.statusCode);
      expect(response.payload).toEqual(asserts.result);

      expect(mockContext.licensing.license.check).toHaveBeenCalledWith('security', 'basic');
    });
  };

  describe('failure', () => {
    getPrivilegesTest(`returns result of routePreCheckLicense`, {
      licenseCheckResult: { check: LICENSE_STATUS.Invalid, message: 'test forbidden message' },
      asserts: { statusCode: 403, result: { message: 'test forbidden message' } },
    });
  });

  describe('success', () => {
    getPrivilegesTest(`returns registered application privileges with actions when requested`, {
      includeActions: true,
      asserts: { statusCode: 200, result: createRawKibanaPrivileges() },
    });

    getPrivilegesTest(`returns registered application privileges without actions`, {
      includeActions: false,
      asserts: {
        statusCode: 200,
        result: {
          global: ['all', 'read'],
          space: ['all', 'read'],
          features: { feature1: ['all'], feature2: ['all'] },
          reserved: ['customApplication1', 'customApplication2'],
        },
      },
    });
  });
});
