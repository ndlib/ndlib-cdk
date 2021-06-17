import { Capture, expect as cdkExpect, haveResourceLike } from '@aws-cdk/assert';
import { SLOAlarmsDashboard } from '../../src/slos/alarms-dashboard';
import { Stack } from '@aws-cdk/core';
import { collapseJoin } from './helpers';

describe('SLOAlarmsDashboard', () => {
  const invalidSlos = [{ type: 'SomeUndefined', apiName: 'apiName', title: 'My Made Up SLO', sloThreshold: 0.999 }];

  it('throws an exception if theres an unknown type', () => {
    const stack = new Stack();
    expect(() => new SLOAlarmsDashboard(stack, 'TestAlarmsDashboard', { slos: invalidSlos })).toThrow(
      'AlarmsDashboard creation encountered an unknown type for slo: {"type":"SomeUndefined","apiName":"apiName","title":"My Made Up SLO","sloThreshold":0.999}.',
    );
  });

  it('allows overriding the period', () => {
    const slos = [
      {
        type: 'CloudfrontAvailability',
        distributionId: 'myDistributionId',
        title: 'My Cloudfront',
        sloThreshold: 0.999,
      },
    ];
    const stack = new Stack();
    new SLOAlarmsDashboard(stack, 'TestAlarmsDashboard', {
      slos,
      dashboardName: 'TestAlarmsDashboard',
      start: '-P1234D',
    });
    const dashBody = Capture.anyType();
    cdkExpect(stack).to(
      haveResourceLike('AWS::CloudWatch::Dashboard', {
        DashboardBody: dashBody.capture(),
        DashboardName: 'TestAlarmsDashboard',
      }),
    );
    const dashObj = JSON.parse(collapseJoin(dashBody.capturedValue));
    expect(dashObj).toEqual(
      expect.objectContaining({
        start: '-P1234D',
      }),
    );
  });

  describe('CloudfrontAvailability', () => {
    const slos = [
      {
        type: 'CloudfrontAvailability',
        distributionId: 'myDistributionId',
        title: 'My Cloudfront',
        sloThreshold: 0.999,
      },
    ];

    it('constructs a dashboard with all four windows: 2%, 5%, 10%, and 100%', () => {
      const stack = new Stack();
      new SLOAlarmsDashboard(stack, 'TestAlarmsDashboard', { slos, dashboardName: 'TestAlarmsDashboard' });
      const dashBody = Capture.anyType();
      cdkExpect(stack).to(
        haveResourceLike('AWS::CloudWatch::Dashboard', {
          DashboardBody: dashBody.capture(),
          DashboardName: 'TestAlarmsDashboard',
        }),
      );
      const dashObj = JSON.parse(collapseJoin(dashBody.capturedValue));
      expect(dashObj).toEqual(
        expect.objectContaining({
          widgets: expect.arrayContaining([
            expect.objectContaining({
              properties: expect.objectContaining({
                title: `My Cloudfront - 60 minutes`,
                metrics: expect.arrayContaining([
                  [{ label: 'Availability', expression: '1-(errorRate/100)' }],
                  [
                    'AWS/CloudFront',
                    '5xxErrorRate',
                    'DistributionId',
                    'myDistributionId',
                    'Region',
                    'Global',
                    { label: 'Error rate', period: 3600, visible: false, id: 'errorRate' },
                  ],
                ]),
              }),
            }),
            expect.objectContaining({
              properties: expect.objectContaining({
                title: 'My Cloudfront - 6 hours',
                metrics: expect.arrayContaining([
                  [{ label: 'Availability', expression: '1-(errorRate/100)' }],
                  [
                    'AWS/CloudFront',
                    '5xxErrorRate',
                    'DistributionId',
                    'myDistributionId',
                    'Region',
                    'Global',
                    { label: 'Error rate', period: 21600, visible: false, id: 'errorRate' },
                  ],
                ]),
              }),
            }),
            expect.objectContaining({
              properties: expect.objectContaining({
                title: 'My Cloudfront - 1 day',
                metrics: expect.arrayContaining([
                  [{ label: 'Availability', expression: '1-(errorRate/100)' }],
                  [
                    'AWS/CloudFront',
                    '5xxErrorRate',
                    'DistributionId',
                    'myDistributionId',
                    'Region',
                    'Global',
                    { label: 'Error rate', period: 86400, visible: false, id: 'errorRate' },
                  ],
                ]),
              }),
            }),
            expect.objectContaining({
              properties: expect.objectContaining({
                title: 'My Cloudfront - 30 days',
                metrics: expect.arrayContaining([
                  [{ label: 'Availability', expression: '1-(errorRate/100)' }],
                  [
                    'AWS/CloudFront',
                    '5xxErrorRate',
                    'DistributionId',
                    'myDistributionId',
                    'Region',
                    'Global',
                    { label: 'Error rate', period: 2592000, visible: false, id: 'errorRate' },
                  ],
                ]),
              }),
            }),
          ]),
        }),
      );
    });
  });

  describe('CloudfrontLatency', () => {
    const slos = [
      {
        type: 'CloudfrontLatency',
        distributionId: 'myDistributionId',
        title: 'My Cloudfront',
        sloThreshold: 0.95,
        latencyThreshold: 200,
      },
    ];

    it('constructs a dashboard with all four windows: 2%, 5%, 10%, and 100%', () => {
      const stack = new Stack();
      new SLOAlarmsDashboard(stack, 'TestAlarmsDashboard', { slos, dashboardName: 'TestAlarmsDashboard' });
      const dashBody = Capture.anyType();
      cdkExpect(stack).to(
        haveResourceLike('AWS::CloudWatch::Dashboard', {
          DashboardBody: dashBody.capture(),
          DashboardName: 'TestAlarmsDashboard',
        }),
      );
      const dashObj = JSON.parse(collapseJoin(dashBody.capturedValue));
      expect(dashObj).toEqual(
        expect.objectContaining({
          widgets: expect.arrayContaining([
            expect.objectContaining({
              properties: expect.objectContaining({
                title: `My Cloudfront - 60 minutes`,
                metrics: expect.arrayContaining([
                  [
                    'AWS/CloudFront',
                    'OriginLatency',
                    'DistributionId',
                    'myDistributionId',
                    'Region',
                    'Global',
                    { label: 'Latency p28.00', period: 3600, stat: 'p28.00' },
                  ],
                ]),
              }),
            }),
            expect.objectContaining({
              properties: expect.objectContaining({
                title: 'My Cloudfront - 6 hours',
                metrics: expect.arrayContaining([
                  [
                    'AWS/CloudFront',
                    'OriginLatency',
                    'DistributionId',
                    'myDistributionId',
                    'Region',
                    'Global',
                    { label: 'Latency p70.00', period: 21600, stat: 'p70.00' },
                  ],
                ]),
              }),
            }),
            expect.objectContaining({
              properties: expect.objectContaining({
                title: 'My Cloudfront - 1 day',
                metrics: expect.arrayContaining([
                  [
                    'AWS/CloudFront',
                    'OriginLatency',
                    'DistributionId',
                    'myDistributionId',
                    'Region',
                    'Global',
                    { label: 'Latency p95.00', period: 86400, stat: 'p95.00' },
                  ],
                ]),
              }),
            }),
            expect.objectContaining({
              properties: expect.objectContaining({
                title: 'My Cloudfront - 30 days',
                metrics: expect.arrayContaining([
                  [
                    'AWS/CloudFront',
                    'OriginLatency',
                    'DistributionId',
                    'myDistributionId',
                    'Region',
                    'Global',
                    { label: 'Latency p95.00', period: 2592000, stat: 'p95.00' },
                  ],
                ]),
              }),
            }),
          ]),
        }),
      );
    });
  });

  describe('ApiAvailability', () => {
    const slos = [{ type: 'ApiAvailability', apiName: 'myApiName', title: 'My API', sloThreshold: 0.99 }];

    it('constructs a dashboard with all four windows: 2%, 5%, 10%, and 100%', () => {
      const stack = new Stack();
      new SLOAlarmsDashboard(stack, 'TestAlarmsDashboard', { slos, dashboardName: 'TestAlarmsDashboard' });
      const dashBody = Capture.anyType();
      cdkExpect(stack).to(
        haveResourceLike('AWS::CloudWatch::Dashboard', {
          DashboardBody: dashBody.capture(),
          DashboardName: 'TestAlarmsDashboard',
        }),
      );
      const dashObj = JSON.parse(collapseJoin(dashBody.capturedValue));
      expect(dashObj).toEqual(
        expect.objectContaining({
          widgets: expect.arrayContaining([
            expect.objectContaining({
              properties: expect.objectContaining({
                title: `My API - 60 minutes`,
                metrics: expect.arrayContaining([
                  [{ label: 'Availability', expression: '(gatewayRequests - gatewayErrors)/gatewayRequests' }],
                  [
                    'AWS/ApiGateway',
                    'Count',
                    'ApiName',
                    'myApiName',
                    { label: 'Requests', period: 3600, stat: 'Sum', visible: false, id: 'gatewayRequests' },
                  ],
                  [
                    'AWS/ApiGateway',
                    '5XXError',
                    'ApiName',
                    'myApiName',
                    { label: 'Error rate', period: 3600, stat: 'Sum', visible: false, id: 'gatewayErrors' },
                  ],
                ]),
              }),
            }),
            expect.objectContaining({
              properties: expect.objectContaining({
                title: 'My API - 6 hours',
                metrics: expect.arrayContaining([
                  [{ label: 'Availability', expression: '(gatewayRequests - gatewayErrors)/gatewayRequests' }],
                  [
                    'AWS/ApiGateway',
                    'Count',
                    'ApiName',
                    'myApiName',
                    { label: 'Requests', period: 21600, stat: 'Sum', visible: false, id: 'gatewayRequests' },
                  ],
                  [
                    'AWS/ApiGateway',
                    '5XXError',
                    'ApiName',
                    'myApiName',
                    { label: 'Error rate', period: 21600, stat: 'Sum', visible: false, id: 'gatewayErrors' },
                  ],
                ]),
              }),
            }),
            expect.objectContaining({
              properties: expect.objectContaining({
                title: 'My API - 1 day',
                metrics: expect.arrayContaining([
                  [{ label: 'Availability', expression: '(gatewayRequests - gatewayErrors)/gatewayRequests' }],
                  [
                    'AWS/ApiGateway',
                    'Count',
                    'ApiName',
                    'myApiName',
                    { label: 'Requests', period: 86400, stat: 'Sum', visible: false, id: 'gatewayRequests' },
                  ],
                  [
                    'AWS/ApiGateway',
                    '5XXError',
                    'ApiName',
                    'myApiName',
                    { label: 'Error rate', period: 86400, stat: 'Sum', visible: false, id: 'gatewayErrors' },
                  ],
                ]),
              }),
            }),
            expect.objectContaining({
              properties: expect.objectContaining({
                title: 'My API - 30 days',
                metrics: expect.arrayContaining([
                  [{ label: 'Availability', expression: '(gatewayRequests - gatewayErrors)/gatewayRequests' }],
                  [
                    'AWS/ApiGateway',
                    'Count',
                    'ApiName',
                    'myApiName',
                    { label: 'Requests', period: 2592000, stat: 'Sum', visible: false, id: 'gatewayRequests' },
                  ],
                  [
                    'AWS/ApiGateway',
                    '5XXError',
                    'ApiName',
                    'myApiName',
                    { label: 'Error rate', period: 2592000, stat: 'Sum', visible: false, id: 'gatewayErrors' },
                  ],
                ]),
              }),
            }),
          ]),
        }),
      );
    });
  });

  describe('ApiLatency', () => {
    const slos = [
      { type: 'ApiLatency', apiName: 'myApiName', title: 'My API', sloThreshold: 0.99, latencyThreshold: 2000 },
    ];

    it('constructs a dashboard with all four windows: 2%, 5%, 10%, and 100%', () => {
      const stack = new Stack();
      new SLOAlarmsDashboard(stack, 'TestAlarmsDashboard', { slos, dashboardName: 'TestAlarmsDashboard' });
      const dashBody = Capture.anyType();
      cdkExpect(stack).to(
        haveResourceLike('AWS::CloudWatch::Dashboard', {
          DashboardBody: dashBody.capture(),
          DashboardName: 'TestAlarmsDashboard',
        }),
      );
      const dashObj = JSON.parse(collapseJoin(dashBody.capturedValue));
      expect(dashObj).toEqual(
        expect.objectContaining({
          widgets: expect.arrayContaining([
            expect.objectContaining({
              properties: expect.objectContaining({
                title: `My API - 60 minutes`,
                metrics: expect.arrayContaining([
                  [
                    'AWS/ApiGateway',
                    'Latency',
                    'ApiName',
                    'myApiName',
                    { label: 'Latency p85.60', period: 3600, stat: 'p85.60' },
                  ],
                ]),
              }),
            }),
            expect.objectContaining({
              properties: expect.objectContaining({
                title: 'My API - 6 hours',
                metrics: expect.arrayContaining([
                  [
                    'AWS/ApiGateway',
                    'Latency',
                    'ApiName',
                    'myApiName',
                    { label: 'Latency p94.00', period: 21600, stat: 'p94.00' },
                  ],
                ]),
              }),
            }),
            expect.objectContaining({
              properties: expect.objectContaining({
                title: 'My API - 1 day',
                metrics: expect.arrayContaining([
                  [
                    'AWS/ApiGateway',
                    'Latency',
                    'ApiName',
                    'myApiName',
                    { label: 'Latency p99.00', period: 86400, stat: 'p99.00' },
                  ],
                ]),
              }),
            }),
            expect.objectContaining({
              properties: expect.objectContaining({
                title: 'My API - 30 days',
                metrics: expect.arrayContaining([
                  [
                    'AWS/ApiGateway',
                    'Latency',
                    'ApiName',
                    'myApiName',
                    { label: 'Latency p99.00', period: 2592000, stat: 'p99.00' },
                  ],
                ]),
              }),
            }),
          ]),
        }),
      );
    });
  });

  describe('AppSyncAvailability', () => {
    const slos = [{ type: 'AppSyncAvailability', apiId: 'myApiId', title: 'My API', sloThreshold: 0.99 }];

    it('constructs a dashboard with all four windows: 2%, 5%, 10%, and 100%', () => {
      const stack = new Stack();
      new SLOAlarmsDashboard(stack, 'TestAlarmsDashboard', { slos, dashboardName: 'TestAlarmsDashboard' });
      const dashBody = Capture.anyType();
      cdkExpect(stack).to(
        haveResourceLike('AWS::CloudWatch::Dashboard', {
          DashboardBody: dashBody.capture(),
          DashboardName: 'TestAlarmsDashboard',
        }),
      );
      const dashObj = JSON.parse(collapseJoin(dashBody.capturedValue));
      expect(dashObj).toEqual(
        expect.objectContaining({
          widgets: expect.arrayContaining([
            expect.objectContaining({
              properties: expect.objectContaining({
                title: `My API - 60 minutes`,
                metrics: expect.arrayContaining([
                  [{ label: 'Availability', expression: '(requests - errors)/requests' }],
                  [
                    'AWS/AppSync',
                    '5XXError',
                    'GraphQLAPIId',
                    'myApiId',
                    { label: 'Requests', period: 3600, stat: 'SampleCount', visible: false, id: 'requests' },
                  ],
                  [
                    'AWS/AppSync',
                    '5XXError',
                    'GraphQLAPIId',
                    'myApiId',
                    { label: 'Error rate', period: 3600, stat: 'Sum', visible: false, id: 'errors' },
                  ],
                ]),
              }),
            }),
            expect.objectContaining({
              properties: expect.objectContaining({
                title: 'My API - 6 hours',
                metrics: expect.arrayContaining([
                  [{ label: 'Availability', expression: '(requests - errors)/requests' }],
                  [
                    'AWS/AppSync',
                    '5XXError',
                    'GraphQLAPIId',
                    'myApiId',
                    { label: 'Requests', period: 21600, stat: 'SampleCount', visible: false, id: 'requests' },
                  ],
                  [
                    'AWS/AppSync',
                    '5XXError',
                    'GraphQLAPIId',
                    'myApiId',
                    { label: 'Error rate', period: 21600, stat: 'Sum', visible: false, id: 'errors' },
                  ],
                ]),
              }),
            }),
            expect.objectContaining({
              properties: expect.objectContaining({
                title: 'My API - 1 day',
                metrics: expect.arrayContaining([
                  [{ label: 'Availability', expression: '(requests - errors)/requests' }],
                  [
                    'AWS/AppSync',
                    '5XXError',
                    'GraphQLAPIId',
                    'myApiId',
                    { label: 'Requests', period: 86400, stat: 'SampleCount', visible: false, id: 'requests' },
                  ],
                  [
                    'AWS/AppSync',
                    '5XXError',
                    'GraphQLAPIId',
                    'myApiId',
                    { label: 'Error rate', period: 86400, stat: 'Sum', visible: false, id: 'errors' },
                  ],
                ]),
              }),
            }),
            expect.objectContaining({
              properties: expect.objectContaining({
                title: 'My API - 30 days',
                metrics: expect.arrayContaining([
                  [{ label: 'Availability', expression: '(requests - errors)/requests' }],
                  [
                    'AWS/AppSync',
                    '5XXError',
                    'GraphQLAPIId',
                    'myApiId',
                    { label: 'Requests', period: 2592000, stat: 'SampleCount', visible: false, id: 'requests' },
                  ],
                  [
                    'AWS/AppSync',
                    '5XXError',
                    'GraphQLAPIId',
                    'myApiId',
                    { label: 'Error rate', period: 2592000, stat: 'Sum', visible: false, id: 'errors' },
                  ],
                ]),
              }),
            }),
          ]),
        }),
      );
    });
  });

  describe('AppSyncLatency', () => {
    const slos = [
      { type: 'AppSyncLatency', apiId: 'myApiId', title: 'My API', sloThreshold: 0.99, latencyThreshold: 2000 },
    ];

    it('constructs a dashboard with all four windows: 2%, 5%, 10%, and 100%', () => {
      const stack = new Stack();
      new SLOAlarmsDashboard(stack, 'TestAlarmsDashboard', { slos, dashboardName: 'TestAlarmsDashboard' });
      const dashBody = Capture.anyType();
      cdkExpect(stack).to(
        haveResourceLike('AWS::CloudWatch::Dashboard', {
          DashboardBody: dashBody.capture(),
          DashboardName: 'TestAlarmsDashboard',
        }),
      );
      const dashObj = JSON.parse(collapseJoin(dashBody.capturedValue));
      expect(dashObj).toEqual(
        expect.objectContaining({
          widgets: expect.arrayContaining([
            expect.objectContaining({
              properties: expect.objectContaining({
                title: `My API - 60 minutes`,
                metrics: expect.arrayContaining([
                  [
                    'AWS/AppSync',
                    'Latency',
                    'GraphQLAPIId',
                    'myApiId',
                    { label: 'Latency p85.60', period: 3600, stat: 'p85.60' },
                  ],
                ]),
              }),
            }),
            expect.objectContaining({
              properties: expect.objectContaining({
                title: 'My API - 6 hours',
                metrics: expect.arrayContaining([
                  [
                    'AWS/AppSync',
                    'Latency',
                    'GraphQLAPIId',
                    'myApiId',
                    { label: 'Latency p94.00', period: 21600, stat: 'p94.00' },
                  ],
                ]),
              }),
            }),
            expect.objectContaining({
              properties: expect.objectContaining({
                title: 'My API - 1 day',
                metrics: expect.arrayContaining([
                  [
                    'AWS/AppSync',
                    'Latency',
                    'GraphQLAPIId',
                    'myApiId',
                    { label: 'Latency p99.00', period: 86400, stat: 'p99.00' },
                  ],
                ]),
              }),
            }),
            expect.objectContaining({
              properties: expect.objectContaining({
                title: 'My API - 30 days',
                metrics: expect.arrayContaining([
                  [
                    'AWS/AppSync',
                    'Latency',
                    'GraphQLAPIId',
                    'myApiId',
                    { label: 'Latency p99.00', period: 2592000, stat: 'p99.00' },
                  ],
                ]),
              }),
            }),
          ]),
        }),
      );
    });
  });

  describe('ElasticSearchAvailability', () => {
    const slos = [
      {
        type: 'ElasticSearchAvailability',
        domainName: 'domainName',
        accountId: 'accountId',
        title: 'My ES Domain',
        sloThreshold: 0.99,
      },
    ];

    it('constructs a dashboard with all four windows: 2%, 5%, 10%, and 100%', () => {
      const stack = new Stack();
      new SLOAlarmsDashboard(stack, 'TestAlarmsDashboard', { slos, dashboardName: 'TestAlarmsDashboard' });
      const dashBody = Capture.anyType();
      cdkExpect(stack).to(
        haveResourceLike('AWS::CloudWatch::Dashboard', {
          DashboardBody: dashBody.capture(),
          DashboardName: 'TestAlarmsDashboard',
        }),
      );
      const dashObj = JSON.parse(collapseJoin(dashBody.capturedValue));
      expect(dashObj).toEqual(
        expect.objectContaining({
          widgets: expect.arrayContaining([
            expect.objectContaining({
              properties: expect.objectContaining({
                title: `My ES Domain - 60 minutes`,
                metrics: expect.arrayContaining([
                  [{ label: 'Availability', expression: '(m2xx + m3xx + m4xx)/(m2xx + m3xx + m4xx + m5xx)' }],
                  [
                    'AWS/ES',
                    '2xx',
                    'ClientId',
                    'accountId',
                    'DomainName',
                    'domainName',
                    { label: '2xx', period: 3600, stat: 'Sum', visible: false, id: 'm2xx' },
                  ],
                  [
                    'AWS/ES',
                    '3xx',
                    'ClientId',
                    'accountId',
                    'DomainName',
                    'domainName',
                    { label: '3xx', period: 3600, stat: 'Sum', visible: false, id: 'm3xx' },
                  ],
                  [
                    'AWS/ES',
                    '4xx',
                    'ClientId',
                    'accountId',
                    'DomainName',
                    'domainName',
                    { label: '4xx', period: 3600, stat: 'Sum', visible: false, id: 'm4xx' },
                  ],
                  [
                    'AWS/ES',
                    '5xx',
                    'ClientId',
                    'accountId',
                    'DomainName',
                    'domainName',
                    { label: '5xx', period: 3600, stat: 'Sum', visible: false, id: 'm5xx' },
                  ],
                ]),
              }),
            }),
            expect.objectContaining({
              properties: expect.objectContaining({
                title: 'My ES Domain - 6 hours',
                metrics: expect.arrayContaining([
                  [{ label: 'Availability', expression: '(m2xx + m3xx + m4xx)/(m2xx + m3xx + m4xx + m5xx)' }],
                  [
                    'AWS/ES',
                    '2xx',
                    'ClientId',
                    'accountId',
                    'DomainName',
                    'domainName',
                    { label: '2xx', period: 21600, stat: 'Sum', visible: false, id: 'm2xx' },
                  ],
                  [
                    'AWS/ES',
                    '3xx',
                    'ClientId',
                    'accountId',
                    'DomainName',
                    'domainName',
                    { label: '3xx', period: 21600, stat: 'Sum', visible: false, id: 'm3xx' },
                  ],
                  [
                    'AWS/ES',
                    '4xx',
                    'ClientId',
                    'accountId',
                    'DomainName',
                    'domainName',
                    { label: '4xx', period: 21600, stat: 'Sum', visible: false, id: 'm4xx' },
                  ],
                  [
                    'AWS/ES',
                    '5xx',
                    'ClientId',
                    'accountId',
                    'DomainName',
                    'domainName',
                    { label: '5xx', period: 21600, stat: 'Sum', visible: false, id: 'm5xx' },
                  ],
                ]),
              }),
            }),
            expect.objectContaining({
              properties: expect.objectContaining({
                title: 'My ES Domain - 1 day',
                metrics: expect.arrayContaining([
                  [{ label: 'Availability', expression: '(m2xx + m3xx + m4xx)/(m2xx + m3xx + m4xx + m5xx)' }],
                  [
                    'AWS/ES',
                    '2xx',
                    'ClientId',
                    'accountId',
                    'DomainName',
                    'domainName',
                    { label: '2xx', period: 86400, stat: 'Sum', visible: false, id: 'm2xx' },
                  ],
                  [
                    'AWS/ES',
                    '3xx',
                    'ClientId',
                    'accountId',
                    'DomainName',
                    'domainName',
                    { label: '3xx', period: 86400, stat: 'Sum', visible: false, id: 'm3xx' },
                  ],
                  [
                    'AWS/ES',
                    '4xx',
                    'ClientId',
                    'accountId',
                    'DomainName',
                    'domainName',
                    { label: '4xx', period: 86400, stat: 'Sum', visible: false, id: 'm4xx' },
                  ],
                  [
                    'AWS/ES',
                    '5xx',
                    'ClientId',
                    'accountId',
                    'DomainName',
                    'domainName',
                    { label: '5xx', period: 86400, stat: 'Sum', visible: false, id: 'm5xx' },
                  ],
                ]),
              }),
            }),
            expect.objectContaining({
              properties: expect.objectContaining({
                title: 'My ES Domain - 30 days',
                metrics: expect.arrayContaining([
                  [{ label: 'Availability', expression: '(m2xx + m3xx + m4xx)/(m2xx + m3xx + m4xx + m5xx)' }],
                  [
                    'AWS/ES',
                    '2xx',
                    'ClientId',
                    'accountId',
                    'DomainName',
                    'domainName',
                    { label: '2xx', period: 2592000, stat: 'Sum', visible: false, id: 'm2xx' },
                  ],
                  [
                    'AWS/ES',
                    '3xx',
                    'ClientId',
                    'accountId',
                    'DomainName',
                    'domainName',
                    { label: '3xx', period: 2592000, stat: 'Sum', visible: false, id: 'm3xx' },
                  ],
                  [
                    'AWS/ES',
                    '4xx',
                    'ClientId',
                    'accountId',
                    'DomainName',
                    'domainName',
                    { label: '4xx', period: 2592000, stat: 'Sum', visible: false, id: 'm4xx' },
                  ],
                  [
                    'AWS/ES',
                    '5xx',
                    'ClientId',
                    'accountId',
                    'DomainName',
                    'domainName',
                    { label: '5xx', period: 2592000, stat: 'Sum', visible: false, id: 'm5xx' },
                  ],
                ]),
              }),
            }),
          ]),
        }),
      );
    });
  });

  describe('ElasticSearchLatency', () => {
    const slos = [
      {
        type: 'ElasticSearchLatency',
        domainName: 'domainName',
        accountId: 'accountId',
        title: 'My ES Domain',
        sloThreshold: 0.99,
        latencyThreshold: 2000,
      },
    ];

    it('constructs a dashboard with all four windows: 2%, 5%, 10%, and 100%', () => {
      const stack = new Stack();
      new SLOAlarmsDashboard(stack, 'TestAlarmsDashboard', { slos, dashboardName: 'TestAlarmsDashboard' });
      const dashBody = Capture.anyType();
      cdkExpect(stack).to(
        haveResourceLike('AWS::CloudWatch::Dashboard', {
          DashboardBody: dashBody.capture(),
          DashboardName: 'TestAlarmsDashboard',
        }),
      );
      const dashObj = JSON.parse(collapseJoin(dashBody.capturedValue));
      expect(dashObj).toEqual(
        expect.objectContaining({
          widgets: expect.arrayContaining([
            expect.objectContaining({
              properties: expect.objectContaining({
                title: `My ES Domain - 60 minutes`,
                metrics: expect.arrayContaining([
                  [
                    'AWS/ES',
                    'SearchLatency',
                    'ClientId',
                    'accountId',
                    'DomainName',
                    'domainName',
                    { label: 'Latency p85.60', period: 3600, stat: 'p85.60' },
                  ],
                ]),
              }),
            }),
            expect.objectContaining({
              properties: expect.objectContaining({
                title: 'My ES Domain - 6 hours',
                metrics: expect.arrayContaining([
                  [
                    'AWS/ES',
                    'SearchLatency',
                    'ClientId',
                    'accountId',
                    'DomainName',
                    'domainName',
                    { label: 'Latency p94.00', period: 21600, stat: 'p94.00' },
                  ],
                ]),
              }),
            }),
            expect.objectContaining({
              properties: expect.objectContaining({
                title: 'My ES Domain - 1 day',
                metrics: expect.arrayContaining([
                  [
                    'AWS/ES',
                    'SearchLatency',
                    'ClientId',
                    'accountId',
                    'DomainName',
                    'domainName',
                    { label: 'Latency p99.00', period: 86400, stat: 'p99.00' },
                  ],
                ]),
              }),
            }),
            expect.objectContaining({
              properties: expect.objectContaining({
                title: 'My ES Domain - 30 days',
                metrics: expect.arrayContaining([
                  [
                    'AWS/ES',
                    'SearchLatency',
                    'ClientId',
                    'accountId',
                    'DomainName',
                    'domainName',
                    { label: 'Latency p99.00', period: 2592000, stat: 'p99.00' },
                  ],
                ]),
              }),
            }),
          ]),
        }),
      );
    });
  });

  describe('CustomAvailability', () => {
    const slos = [
      {
        type: 'CustomAvailability',
        namespace: 'CustomNamespace',
        errorsMetricName: 'CustomErrorCountMetric',
        countsMetricName: 'CustomRequestCountMetric',
        title: 'My Custom Availability',
        sloThreshold: 0.99,
      },
    ];

    it('constructs a dashboard with all four windows: 2%, 5%, 10%, and 100%', () => {
      const stack = new Stack();
      new SLOAlarmsDashboard(stack, 'TestAlarmsDashboard', { slos, dashboardName: 'TestAlarmsDashboard' });
      const dashBody = Capture.anyType();
      cdkExpect(stack).to(
        haveResourceLike('AWS::CloudWatch::Dashboard', {
          DashboardBody: dashBody.capture(),
          DashboardName: 'TestAlarmsDashboard',
        }),
      );
      const dashObj = JSON.parse(collapseJoin(dashBody.capturedValue));
      expect(dashObj).toEqual(
        expect.objectContaining({
          widgets: expect.arrayContaining([
            expect.objectContaining({
              properties: expect.objectContaining({
                title: `My Custom Availability - 60 minutes`,
                metrics: expect.arrayContaining([
                  [{ label: 'Availability', expression: '(requests - errors)/requests' }],
                  [
                    'CustomNamespace',
                    'CustomRequestCountMetric',
                    { label: 'Requests', period: 3600, stat: 'Sum', visible: false, id: 'requests' },
                  ],
                  [
                    'CustomNamespace',
                    'CustomErrorCountMetric',
                    { label: 'Errors', period: 3600, stat: 'Sum', visible: false, id: 'errors' },
                  ],
                ]),
              }),
            }),
            expect.objectContaining({
              properties: expect.objectContaining({
                title: 'My Custom Availability - 6 hours',
                metrics: expect.arrayContaining([
                  [{ label: 'Availability', expression: '(requests - errors)/requests' }],
                  [
                    'CustomNamespace',
                    'CustomRequestCountMetric',
                    { label: 'Requests', period: 21600, stat: 'Sum', visible: false, id: 'requests' },
                  ],
                  [
                    'CustomNamespace',
                    'CustomErrorCountMetric',
                    { label: 'Errors', period: 21600, stat: 'Sum', visible: false, id: 'errors' },
                  ],
                ]),
              }),
            }),
            expect.objectContaining({
              properties: expect.objectContaining({
                title: 'My Custom Availability - 1 day',
                metrics: expect.arrayContaining([
                  [{ label: 'Availability', expression: '(requests - errors)/requests' }],
                  [
                    'CustomNamespace',
                    'CustomRequestCountMetric',
                    { label: 'Requests', period: 86400, stat: 'Sum', visible: false, id: 'requests' },
                  ],
                  [
                    'CustomNamespace',
                    'CustomErrorCountMetric',
                    { label: 'Errors', period: 86400, stat: 'Sum', visible: false, id: 'errors' },
                  ],
                ]),
              }),
            }),
            expect.objectContaining({
              properties: expect.objectContaining({
                title: 'My Custom Availability - 30 days',
                metrics: expect.arrayContaining([
                  [{ label: 'Availability', expression: '(requests - errors)/requests' }],
                  [
                    'CustomNamespace',
                    'CustomRequestCountMetric',
                    { label: 'Requests', period: 2592000, stat: 'Sum', visible: false, id: 'requests' },
                  ],
                  [
                    'CustomNamespace',
                    'CustomErrorCountMetric',
                    { label: 'Errors', period: 2592000, stat: 'Sum', visible: false, id: 'errors' },
                  ],
                ]),
              }),
            }),
          ]),
        }),
      );
    });
  });

  describe('CustomLatency', () => {
    const slos = [
      {
        type: 'CustomLatency',
        namespace: 'CustomNamespace',
        latencyMetricName: 'CustomLatencyMetric',
        title: 'My Custom Latency',
        sloThreshold: 0.99,
        latencyThreshold: 2000,
      },
    ];

    it('constructs a dashboard with all four windows: 2%, 5%, 10%, and 100%', () => {
      const stack = new Stack();
      new SLOAlarmsDashboard(stack, 'TestAlarmsDashboard', { slos, dashboardName: 'TestAlarmsDashboard' });
      const dashBody = Capture.anyType();
      cdkExpect(stack).to(
        haveResourceLike('AWS::CloudWatch::Dashboard', {
          DashboardBody: dashBody.capture(),
          DashboardName: 'TestAlarmsDashboard',
        }),
      );
      const dashObj = JSON.parse(collapseJoin(dashBody.capturedValue));
      expect(dashObj).toEqual(
        expect.objectContaining({
          widgets: expect.arrayContaining([
            expect.objectContaining({
              properties: expect.objectContaining({
                title: `My Custom Latency - 60 minutes`,
                metrics: expect.arrayContaining([
                  ['CustomNamespace', 'CustomLatencyMetric', { label: 'Latency p85.60', period: 3600, stat: 'p85.60' }],
                ]),
              }),
            }),
            expect.objectContaining({
              properties: expect.objectContaining({
                title: 'My Custom Latency - 6 hours',
                metrics: expect.arrayContaining([
                  [
                    'CustomNamespace',
                    'CustomLatencyMetric',
                    { label: 'Latency p94.00', period: 21600, stat: 'p94.00' },
                  ],
                ]),
              }),
            }),
            expect.objectContaining({
              properties: expect.objectContaining({
                title: 'My Custom Latency - 1 day',
                metrics: expect.arrayContaining([
                  [
                    'CustomNamespace',
                    'CustomLatencyMetric',
                    { label: 'Latency p99.00', period: 86400, stat: 'p99.00' },
                  ],
                ]),
              }),
            }),
            expect.objectContaining({
              properties: expect.objectContaining({
                title: 'My Custom Latency - 30 days',
                metrics: expect.arrayContaining([
                  [
                    'CustomNamespace',
                    'CustomLatencyMetric',
                    { label: 'Latency p99.00', period: 2592000, stat: 'p99.00' },
                  ],
                ]),
              }),
            }),
          ]),
        }),
      );
    });
  });
});
