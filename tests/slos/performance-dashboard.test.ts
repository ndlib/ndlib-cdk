import { expect as cdkExpect, haveResourceLike } from '@aws-cdk/assert';
import { SLOPerformanceDashboard } from '../../src/slos/performance-dashboard';
import { Stack } from '@aws-cdk/core';

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
    ];
    const stack = new Stack();
    new SLOPerformanceDashboard(stack, 'TestAlarms', { slos });
    cdkExpect(stack).to(
      haveResourceLike('AWS::CloudWatch::Dashboard', {
        DashboardBody: {
          'Fn::Join': [
            '',
            [
              '{"start":"-P1Y","widgets":[{"type":"metric","width":6,"height":6,"x":0,"y":0,"properties":{"view":"timeSeries","title":"My Cloudfront - Availability","region":"',
              {
                Ref: 'AWS::Region',
              },
              '","metrics":[[{"label":"Availability","expression":"1-(errorRate/100)"}],["AWS/CloudFront","5xxErrorRate","DistributionId","myDistributionId","Region","Global",{"label":"Error rate","period":2592000,"visible":false,"id":"errorRate"}]],"annotations":{"horizontal":[{"label":"SLO","value":0.999,"fill":"below","color":"#d62728","yAxis":"left"}]},"yAxis":{"left":{"min":0.995,"max":1}}}},{"type":"metric","width":6,"height":6,"x":6,"y":0,"properties":{"view":"timeSeries","title":"My Cloudfront - Latency 200ms","region":"',
              {
                Ref: 'AWS::Region',
              },
              '","metrics":[["AWS/CloudFront","OriginLatency","DistributionId","myDistributionId","Region","Global",{"label":"Latency p95.00","period":2592000,"stat":"p95.00"}]],"annotations":{"horizontal":[{"label":"SLO","value":200,"fill":"above","color":"#d62728","yAxis":"left"}]},"yAxis":{"left":{"min":0,"max":280}}}},{"type":"metric","width":6,"height":6,"x":12,"y":0,"properties":{"view":"timeSeries","title":"My API - Availability","region":"',
              {
                Ref: 'AWS::Region',
              },
              '","metrics":[[{"label":"Availability","expression":"(gatewayRequests - gatewayErrors)/gatewayRequests"}],["AWS/ApiGateway","Count","ApiName","myApiName",{"label":"Requests","period":2592000,"stat":"Sum","visible":false,"id":"gatewayRequests"}],["AWS/ApiGateway","5XXError","ApiName","myApiName",{"label":"Error rate","period":2592000,"stat":"Sum","visible":false,"id":"gatewayErrors"}]],"annotations":{"horizontal":[{"label":"SLO","value":0.99,"fill":"below","color":"#d62728","yAxis":"left"}]},"yAxis":{"left":{"min":0.95,"max":1}}}},{"type":"metric","width":6,"height":6,"x":18,"y":0,"properties":{"view":"timeSeries","title":"My API - Latency 2000ms","region":"',
              {
                Ref: 'AWS::Region',
              },
              '","metrics":[["AWS/ApiGateway","Latency","ApiName","myApiName",{"label":"Latency p99.00","period":2592000,"stat":"p99.00"}]],"annotations":{"horizontal":[{"label":"SLO","value":2000,"fill":"above","color":"#d62728","yAxis":"left"}]},"yAxis":{"left":{"min":0,"max":2800}}}},{"type":"metric","width":6,"height":6,"x":0,"y":6,"properties":{"view":"timeSeries","title":"My Cloudfront - Availability","region":"',
              {
                Ref: 'AWS::Region',
              },
              '","metrics":[[{"label":"Availability","expression":"1-(errorRate/100)"}],["AWS/CloudFront","5xxErrorRate","DistributionId","myDistributionId","Region","Global",{"label":"Error rate","period":2592000,"visible":false,"id":"errorRate"}]],"annotations":{"horizontal":[{"label":"SLO","value":0.999,"fill":"below","color":"#d62728","yAxis":"left"}]},"yAxis":{"left":{"min":0.995,"max":1}}}},{"type":"metric","width":6,"height":6,"x":6,"y":6,"properties":{"view":"timeSeries","title":"My Cloudfront - Latency 200ms","region":"',
              {
                Ref: 'AWS::Region',
              },
              '","metrics":[["AWS/CloudFront","OriginLatency","DistributionId","myDistributionId","Region","Global",{"label":"Latency p95.00","period":2592000,"stat":"p95.00"}]],"annotations":{"horizontal":[{"label":"SLO","value":200,"fill":"above","color":"#d62728","yAxis":"left"}]},"yAxis":{"left":{"min":0,"max":280}}}},{"type":"metric","width":6,"height":6,"x":12,"y":6,"properties":{"view":"timeSeries","title":"My API - Availability","region":"',
              {
                Ref: 'AWS::Region',
              },
              '","metrics":[[{"label":"Availability","expression":"(gatewayRequests - gatewayErrors)/gatewayRequests"}],["AWS/ApiGateway","Count","ApiName","myApiName",{"label":"Requests","period":2592000,"stat":"Sum","visible":false,"id":"gatewayRequests"}],["AWS/ApiGateway","5XXError","ApiName","myApiName",{"label":"Error rate","period":2592000,"stat":"Sum","visible":false,"id":"gatewayErrors"}]],"annotations":{"horizontal":[{"label":"SLO","value":0.99,"fill":"below","color":"#d62728","yAxis":"left"}]},"yAxis":{"left":{"min":0.95,"max":1}}}},{"type":"metric","width":6,"height":6,"x":18,"y":6,"properties":{"view":"timeSeries","title":"My API - Latency 2000ms","region":"',
              {
                Ref: 'AWS::Region',
              },
              '","metrics":[["AWS/ApiGateway","Latency","ApiName","myApiName",{"label":"Latency p99.00","period":2592000,"stat":"p99.00"}]],"annotations":{"horizontal":[{"label":"SLO","value":2000,"fill":"above","color":"#d62728","yAxis":"left"}]},"yAxis":{"left":{"min":0,"max":2800}}}}]}',
            ],
          ],
        },
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

      cdkExpect(stack).to(
        haveResourceLike('AWS::CloudWatch::Dashboard', {
          DashboardBody: {
            'Fn::Join': [
              '',
              [
                '{"start":"-P1Y","widgets":[{"type":"metric","width":6,"height":6,"x":0,"y":0,"properties":{"view":"timeSeries","title":"My Cloudfront - Availability","region":"',
                {
                  Ref: 'AWS::Region',
                },
                '","metrics":[[{"label":"Availability","expression":"1-(errorRate/100)"}],["AWS/CloudFront","5xxErrorRate","DistributionId","myDistributionId","Region","Global",{"label":"Error rate","period":2592000,"visible":false,"id":"errorRate"}]],"annotations":{"horizontal":[{"label":"SLO","value":0.999,"fill":"below","color":"#d62728","yAxis":"left"}]},"yAxis":{"left":{"min":0.995,"max":1}}}}]}',
              ],
            ],
          },
          DashboardName: 'TestPerformanceDashboard',
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

      cdkExpect(stack).to(
        haveResourceLike('AWS::CloudWatch::Dashboard', {
          DashboardBody: {
            'Fn::Join': [
              '',
              [
                '{"start":"-P1Y","widgets":[{"type":"metric","width":6,"height":6,"x":0,"y":0,"properties":{"view":"timeSeries","title":"My Cloudfront - Latency 200ms","region":"',
                {
                  Ref: 'AWS::Region',
                },
                '","metrics":[["AWS/CloudFront","OriginLatency","DistributionId","myDistributionId","Region","Global",{"label":"Latency p95.00","period":2592000,"stat":"p95.00"}]],"annotations":{"horizontal":[{"label":"SLO","value":200,"fill":"above","color":"#d62728","yAxis":"left"}]},"yAxis":{"left":{"min":0,"max":280}}}}]}',
              ],
            ],
          },
          DashboardName: 'TestPerformanceDashboard',
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

      cdkExpect(stack).to(
        haveResourceLike('AWS::CloudWatch::Dashboard', {
          DashboardBody: {
            'Fn::Join': [
              '',
              [
                '{"start":"-P1Y","widgets":[{"type":"metric","width":6,"height":6,"x":0,"y":0,"properties":{"view":"timeSeries","title":"My API - Availability","region":"',
                {
                  Ref: 'AWS::Region',
                },
                '","metrics":[[{"label":"Availability","expression":"(gatewayRequests - gatewayErrors)/gatewayRequests"}],["AWS/ApiGateway","Count","ApiName","myApiName",{"label":"Requests","period":2592000,"stat":"Sum","visible":false,"id":"gatewayRequests"}],["AWS/ApiGateway","5XXError","ApiName","myApiName",{"label":"Error rate","period":2592000,"stat":"Sum","visible":false,"id":"gatewayErrors"}]],"annotations":{"horizontal":[{"label":"SLO","value":0.99,"fill":"below","color":"#d62728","yAxis":"left"}]},"yAxis":{"left":{"min":0.95,"max":1}}}}]}',
              ],
            ],
          },
          DashboardName: 'TestPerformanceDashboard',
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

      cdkExpect(stack).to(
        haveResourceLike('AWS::CloudWatch::Dashboard', {
          DashboardBody: {
            'Fn::Join': [
              '',
              [
                '{"start":"-P1Y","widgets":[{"type":"metric","width":6,"height":6,"x":0,"y":0,"properties":{"view":"timeSeries","title":"My API - Latency 2000ms","region":"',
                {
                  Ref: 'AWS::Region',
                },
                '","metrics":[["AWS/ApiGateway","Latency","ApiName","myApiName",{"label":"Latency p99.00","period":2592000,"stat":"p99.00"}]],"annotations":{"horizontal":[{"label":"SLO","value":2000,"fill":"above","color":"#d62728","yAxis":"left"}]},"yAxis":{"left":{"min":0,"max":2800}}}}]}',
              ],
            ],
          },
          DashboardName: 'TestPerformanceDashboard',
        }),
      );
    });
  });
});
