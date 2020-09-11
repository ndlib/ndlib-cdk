import { Capture, expect as cdkExpect, haveResourceLike } from '@aws-cdk/assert';
import { SLOPerformanceDashboard } from '../../src/slos/performance-dashboard';
import { Stack } from '@aws-cdk/core';
import { collapseJoin } from './helpers';

describe('SLOPerformanceDashboard', () => {
  it('throws an excpetion if theres an unknown type', () => {
    const invalidSlos = [{ type: 'SomeUndefined', apiName: 'apiName', title: 'My Made Up SLO', sloThreshold: 0.999 }];
    const stack = new Stack();
    expect(() => new SLOPerformanceDashboard(stack, 'TestPerformanceDashboard', { slos: invalidSlos })).toThrow(
      'PerformanceDashboard creation encountered an unknown type for slo: {"type":"SomeUndefined","apiName":"apiName","title":"My Made Up SLO","sloThreshold":0.999}.',
    );
  });

  it('limits to 4 widgets per row', () => {
    const slos = [
      {
        type: 'CloudfrontAvailability',
        distributionId: 'myDistributionId',
        title: 'My Cloudfront',
        sloThreshold: 0.999,
      },
      {
        type: 'CloudfrontLatency',
        distributionId: 'myDistributionId',
        title: 'My Cloudfront',
        sloThreshold: 0.95,
        latencyThreshold: 200,
      },
      { type: 'ApiAvailability', apiName: 'myApiName', title: 'My API', sloThreshold: 0.99 },
      { type: 'ApiLatency', apiName: 'myApiName', title: 'My API', sloThreshold: 0.99, latencyThreshold: 2000 },
      {
        type: 'CloudfrontAvailability',
        distributionId: 'myDistributionId',
        title: 'My Cloudfront',
        sloThreshold: 0.999,
      },
      {
        type: 'CloudfrontLatency',
        distributionId: 'myDistributionId',
        title: 'My Cloudfront',
        sloThreshold: 0.95,
        latencyThreshold: 200,
      },
      { type: 'ApiAvailability', apiName: 'myApiName', title: 'My API', sloThreshold: 0.99 },
      { type: 'ApiLatency', apiName: 'myApiName', title: 'My API', sloThreshold: 0.99, latencyThreshold: 2000 },
      {
        type: 'ElasticSearchAvailability',
        domainName: 'domainName',
        accountId: 'accountId',
        title: 'My ES Domain',
        sloThreshold: 0.99,
      },
      {
        type: 'ElasticSearchLatency',
        domainName: 'domainName',
        accountId: 'accountId',
        title: 'My ES Domain',
        sloThreshold: 0.99,
        latencyThreshold: 2000,
      },
    ];
    const stack = new Stack();
    new SLOPerformanceDashboard(stack, 'TestPerformanceDashboard', { slos, dashboardName: 'TestPerformanceDashboard' });
    const dashBody = Capture.anyType();
    cdkExpect(stack).to(
      haveResourceLike('AWS::CloudWatch::Dashboard', {
        DashboardBody: dashBody.capture(),
        DashboardName: 'TestPerformanceDashboard',
      }),
    );
    const dashObj = JSON.parse(collapseJoin(dashBody.capturedValue));
    const rowOneWidget = expect.objectContaining({ y: 0, height: 6 });
    const rowTwoWidget = expect.objectContaining({ y: 6, height: 6 });
    const rowThreeWidget = expect.objectContaining({ y: 12, height: 6 });
    expect(dashObj).toEqual(
      expect.objectContaining({
        widgets: [
          rowOneWidget,
          rowOneWidget,
          rowOneWidget,
          rowOneWidget,
          rowTwoWidget,
          rowTwoWidget,
          rowTwoWidget,
          rowTwoWidget,
          rowThreeWidget,
          rowThreeWidget,
        ],
      }),
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
    new SLOPerformanceDashboard(stack, 'TestPerformanceDashboard', {
      slos,
      dashboardName: 'TestPerformanceDashboard',
      start: '-P1234D',
    });
    const dashBody = Capture.anyType();
    cdkExpect(stack).to(
      haveResourceLike('AWS::CloudWatch::Dashboard', {
        DashboardBody: dashBody.capture(),
        DashboardName: 'TestPerformanceDashboard',
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

    it('constructs a dashboard with a 30 day window widget', () => {
      const stack = new Stack();
      new SLOPerformanceDashboard(stack, 'TestPerformanceDashboard', {
        slos,
        dashboardName: 'TestPerformanceDashboard',
      });

      const dashBody = Capture.anyType();
      cdkExpect(stack).to(
        haveResourceLike('AWS::CloudWatch::Dashboard', {
          DashboardBody: dashBody.capture(),
          DashboardName: 'TestPerformanceDashboard',
        }),
      );
      const dashObj = JSON.parse(collapseJoin(dashBody.capturedValue));
      expect(dashObj).toEqual(
        expect.objectContaining({
          widgets: expect.arrayContaining([
            expect.objectContaining({
              properties: expect.objectContaining({
                title: `My Cloudfront - Availability`,
                metrics: [
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
                ],
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

    it('constructs a dashboard with a 30 day window widget', () => {
      const stack = new Stack();
      new SLOPerformanceDashboard(stack, 'TestPerformanceDashboard', {
        slos,
        dashboardName: 'TestPerformanceDashboard',
      });

      const dashBody = Capture.anyType();
      cdkExpect(stack).to(
        haveResourceLike('AWS::CloudWatch::Dashboard', {
          DashboardBody: dashBody.capture(),
          DashboardName: 'TestPerformanceDashboard',
        }),
      );
      const dashObj = JSON.parse(collapseJoin(dashBody.capturedValue));
      expect(dashObj).toEqual(
        expect.objectContaining({
          widgets: expect.arrayContaining([
            expect.objectContaining({
              properties: expect.objectContaining({
                title: `My Cloudfront - Latency 200ms`,
                metrics: [
                  [
                    'AWS/CloudFront',
                    'OriginLatency',
                    'DistributionId',
                    'myDistributionId',
                    'Region',
                    'Global',
                    { label: 'Latency p95.00', period: 2592000, stat: 'p95.00' },
                  ],
                ],
              }),
            }),
          ]),
        }),
      );
    });
  });

  describe('ApiAvailability', () => {
    const slos = [{ type: 'ApiAvailability', apiName: 'myApiName', title: 'My API', sloThreshold: 0.99 }];

    it('constructs a dashboard with a 30 day window widget', () => {
      const stack = new Stack();
      new SLOPerformanceDashboard(stack, 'TestPerformanceDashboard', {
        slos,
        dashboardName: 'TestPerformanceDashboard',
      });

      const dashBody = Capture.anyType();
      cdkExpect(stack).to(
        haveResourceLike('AWS::CloudWatch::Dashboard', {
          DashboardBody: dashBody.capture(),
          DashboardName: 'TestPerformanceDashboard',
        }),
      );
      const dashObj = JSON.parse(collapseJoin(dashBody.capturedValue));
      expect(dashObj).toEqual(
        expect.objectContaining({
          widgets: expect.arrayContaining([
            expect.objectContaining({
              properties: expect.objectContaining({
                title: `My API - Availability`,
                metrics: [
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
                ],
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

    it('constructs a dashboard with a 30 day window widget', () => {
      const stack = new Stack();
      new SLOPerformanceDashboard(stack, 'TestPerformanceDashboard', {
        slos,
        dashboardName: 'TestPerformanceDashboard',
      });

      const dashBody = Capture.anyType();
      cdkExpect(stack).to(
        haveResourceLike('AWS::CloudWatch::Dashboard', {
          DashboardBody: dashBody.capture(),
          DashboardName: 'TestPerformanceDashboard',
        }),
      );
      const dashObj = JSON.parse(collapseJoin(dashBody.capturedValue));
      expect(dashObj).toEqual(
        expect.objectContaining({
          widgets: expect.arrayContaining([
            expect.objectContaining({
              properties: expect.objectContaining({
                title: `My API - Latency 2000ms`,
                metrics: [
                  [
                    'AWS/ApiGateway',
                    'Latency',
                    'ApiName',
                    'myApiName',
                    { label: 'Latency p99.00', period: 2592000, stat: 'p99.00' },
                  ],
                ],
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

    it('constructs a dashboard with a 30 day window widget', () => {
      const stack = new Stack();
      new SLOPerformanceDashboard(stack, 'TestPerformanceDashboard', {
        slos,
        dashboardName: 'TestPerformanceDashboard',
      });

      const dashBody = Capture.anyType();
      cdkExpect(stack).to(
        haveResourceLike('AWS::CloudWatch::Dashboard', {
          DashboardBody: dashBody.capture(),
          DashboardName: 'TestPerformanceDashboard',
        }),
      );
      const dashObj = JSON.parse(collapseJoin(dashBody.capturedValue));
      expect(dashObj).toEqual(
        expect.objectContaining({
          widgets: expect.arrayContaining([
            expect.objectContaining({
              properties: expect.objectContaining({
                title: `My Custom Availability - Availability`,
                metrics: [
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
                ],
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

    it('constructs a dashboard with a 30 day window widget', () => {
      const stack = new Stack();
      new SLOPerformanceDashboard(stack, 'TestPerformanceDashboard', {
        slos,
        dashboardName: 'TestPerformanceDashboard',
      });

      const dashBody = Capture.anyType();
      cdkExpect(stack).to(
        haveResourceLike('AWS::CloudWatch::Dashboard', {
          DashboardBody: dashBody.capture(),
          DashboardName: 'TestPerformanceDashboard',
        }),
      );
      const dashObj = JSON.parse(collapseJoin(dashBody.capturedValue));
      expect(dashObj).toEqual(
        expect.objectContaining({
          widgets: [
            expect.objectContaining({
              properties: expect.objectContaining({
                title: `My Custom Latency - Latency 2000ms`,
                metrics: expect.arrayContaining([
                  [
                    'CustomNamespace',
                    'CustomLatencyMetric',
                    { label: 'Latency p99.00', period: 2592000, stat: 'p99.00' },
                  ],
                ]),
              }),
            }),
          ],
        }),
      );
    });
  });
});
