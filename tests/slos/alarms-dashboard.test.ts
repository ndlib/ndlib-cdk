import { expect as cdkExpect, haveResourceLike } from '@aws-cdk/assert';
import { SLOAlarmsDashboard } from '../../src/slos/alarms-dashboard';
import { Stack } from '@aws-cdk/core';

describe('SLOAlarmsDashboard', () => {
  const invalidSlos = [{ type: 'SomeUndefined', apiName: 'apiName', title: 'My Made Up SLO', sloThreshold: 0.999 }];

  it('throws an excpetion if theres an unknown type', () => {
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

    cdkExpect(stack).to(
      haveResourceLike('AWS::CloudWatch::Dashboard', {
        DashboardBody: {
          'Fn::Join': [
            '',
            [
              '{"start":"-P1234D","widgets":[{"type":"metric","width":6,"height":6,"x":0,"y":0,"properties":{"view":"timeSeries","title":"My Cloudfront - 60 minutes","region":"',
              {
                Ref: 'AWS::Region',
              },
              '","metrics":[[{"label":"Availability","expression":"1-(errorRate/100)"}],["AWS/CloudFront","5xxErrorRate","DistributionId","myDistributionId","Region","Global",{"label":"Error rate","period":3600,"visible":false,"id":"errorRate"}]],"annotations":{"horizontal":[{"label":"2% of Budget in 60 minutes","value":0.9856,"fill":"below","color":"#d62728","yAxis":"left"},{"label":"SLO","value":0.999,"fill":"none","color":"#ff7f0e","yAxis":"left"}]},"yAxis":{"left":{"min":0.98272,"max":1}}}},{"type":"metric","width":6,"height":6,"x":6,"y":0,"properties":{"view":"timeSeries","title":"My Cloudfront - 6 hours","region":"',
              {
                Ref: 'AWS::Region',
              },
              '","metrics":[[{"label":"Availability","expression":"1-(errorRate/100)"}],["AWS/CloudFront","5xxErrorRate","DistributionId","myDistributionId","Region","Global",{"label":"Error rate","period":21600,"visible":false,"id":"errorRate"}]],"annotations":{"horizontal":[{"label":"5% of Budget in 6 hours","value":0.994,"fill":"below","color":"#d62728","yAxis":"left"},{"label":"SLO","value":0.999,"fill":"none","color":"#ff7f0e","yAxis":"left"}]},"yAxis":{"left":{"min":0.9928,"max":1}}}},{"type":"metric","width":6,"height":6,"x":12,"y":0,"properties":{"view":"timeSeries","title":"My Cloudfront - 1 day","region":"',
              {
                Ref: 'AWS::Region',
              },
              '","metrics":[[{"label":"Availability","expression":"1-(errorRate/100)"}],["AWS/CloudFront","5xxErrorRate","DistributionId","myDistributionId","Region","Global",{"label":"Error rate","period":86400,"visible":false,"id":"errorRate"}]],"annotations":{"horizontal":[{"label":"10% of Budget in 1 day","value":0.999,"fill":"below","color":"#d62728","yAxis":"left"},{"label":"SLO","value":0.999,"fill":"none","color":"#ff7f0e","yAxis":"left"}]},"yAxis":{"left":{"min":0.9988,"max":1}}}},{"type":"metric","width":6,"height":6,"x":18,"y":0,"properties":{"view":"timeSeries","title":"My Cloudfront - 30 days","region":"',
              {
                Ref: 'AWS::Region',
              },
              '","metrics":[[{"label":"Availability","expression":"1-(errorRate/100)"}],["AWS/CloudFront","5xxErrorRate","DistributionId","myDistributionId","Region","Global",{"label":"Error rate","period":2592000,"visible":false,"id":"errorRate"}]],"annotations":{"horizontal":[{"label":"100% of Budget in 30 days","value":0.999,"fill":"below","color":"#d62728","yAxis":"left"},{"label":"SLO","value":0.999,"fill":"none","color":"#ff7f0e","yAxis":"left"}]},"yAxis":{"left":{"min":0.9988,"max":1}}}}]}',
            ],
          ],
        },
        DashboardName: 'TestAlarmsDashboard',
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

      cdkExpect(stack).to(
        haveResourceLike('AWS::CloudWatch::Dashboard', {
          DashboardBody: {
            'Fn::Join': [
              '',
              [
                '{"start":"-P360D","widgets":[{"type":"metric","width":6,"height":6,"x":0,"y":0,"properties":{"view":"timeSeries","title":"My Cloudfront - 60 minutes","region":"',
                {
                  Ref: 'AWS::Region',
                },
                '","metrics":[[{"label":"Availability","expression":"1-(errorRate/100)"}],["AWS/CloudFront","5xxErrorRate","DistributionId","myDistributionId","Region","Global",{"label":"Error rate","period":3600,"visible":false,"id":"errorRate"}]],"annotations":{"horizontal":[{"label":"2% of Budget in 60 minutes","value":0.9856,"fill":"below","color":"#d62728","yAxis":"left"},{"label":"SLO","value":0.999,"fill":"none","color":"#ff7f0e","yAxis":"left"}]},"yAxis":{"left":{"min":0.98272,"max":1}}}},{"type":"metric","width":6,"height":6,"x":6,"y":0,"properties":{"view":"timeSeries","title":"My Cloudfront - 6 hours","region":"',
                {
                  Ref: 'AWS::Region',
                },
                '","metrics":[[{"label":"Availability","expression":"1-(errorRate/100)"}],["AWS/CloudFront","5xxErrorRate","DistributionId","myDistributionId","Region","Global",{"label":"Error rate","period":21600,"visible":false,"id":"errorRate"}]],"annotations":{"horizontal":[{"label":"5% of Budget in 6 hours","value":0.994,"fill":"below","color":"#d62728","yAxis":"left"},{"label":"SLO","value":0.999,"fill":"none","color":"#ff7f0e","yAxis":"left"}]},"yAxis":{"left":{"min":0.9928,"max":1}}}},{"type":"metric","width":6,"height":6,"x":12,"y":0,"properties":{"view":"timeSeries","title":"My Cloudfront - 1 day","region":"',
                {
                  Ref: 'AWS::Region',
                },
                '","metrics":[[{"label":"Availability","expression":"1-(errorRate/100)"}],["AWS/CloudFront","5xxErrorRate","DistributionId","myDistributionId","Region","Global",{"label":"Error rate","period":86400,"visible":false,"id":"errorRate"}]],"annotations":{"horizontal":[{"label":"10% of Budget in 1 day","value":0.999,"fill":"below","color":"#d62728","yAxis":"left"},{"label":"SLO","value":0.999,"fill":"none","color":"#ff7f0e","yAxis":"left"}]},"yAxis":{"left":{"min":0.9988,"max":1}}}},{"type":"metric","width":6,"height":6,"x":18,"y":0,"properties":{"view":"timeSeries","title":"My Cloudfront - 30 days","region":"',
                {
                  Ref: 'AWS::Region',
                },
                '","metrics":[[{"label":"Availability","expression":"1-(errorRate/100)"}],["AWS/CloudFront","5xxErrorRate","DistributionId","myDistributionId","Region","Global",{"label":"Error rate","period":2592000,"visible":false,"id":"errorRate"}]],"annotations":{"horizontal":[{"label":"100% of Budget in 30 days","value":0.999,"fill":"below","color":"#d62728","yAxis":"left"},{"label":"SLO","value":0.999,"fill":"none","color":"#ff7f0e","yAxis":"left"}]},"yAxis":{"left":{"min":0.9988,"max":1}}}}]}',
              ],
            ],
          },
          DashboardName: 'TestAlarmsDashboard',
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

      cdkExpect(stack).to(
        haveResourceLike('AWS::CloudWatch::Dashboard', {
          DashboardBody: {
            'Fn::Join': [
              '',
              [
                '{"start":"-P360D","widgets":[{"type":"metric","width":6,"height":6,"x":0,"y":0,"properties":{"view":"timeSeries","title":"My Cloudfront - 60 minutes","region":"',
                {
                  Ref: 'AWS::Region',
                },
                '","metrics":[["AWS/CloudFront","OriginLatency","DistributionId","myDistributionId","Region","Global",{"label":"Latency p28.00","period":3600,"stat":"p28.00"}]],"annotations":{"horizontal":[{"label":"SLO","value":200,"fill":"above","color":"#d62728","yAxis":"left"}]},"yAxis":{"left":{"min":0,"max":280}}}},{"type":"metric","width":6,"height":6,"x":6,"y":0,"properties":{"view":"timeSeries","title":"My Cloudfront - 6 hours","region":"',
                {
                  Ref: 'AWS::Region',
                },
                '","metrics":[["AWS/CloudFront","OriginLatency","DistributionId","myDistributionId","Region","Global",{"label":"Latency p70.00","period":21600,"stat":"p70.00"}]],"annotations":{"horizontal":[{"label":"SLO","value":200,"fill":"above","color":"#d62728","yAxis":"left"}]},"yAxis":{"left":{"min":0,"max":280}}}},{"type":"metric","width":6,"height":6,"x":12,"y":0,"properties":{"view":"timeSeries","title":"My Cloudfront - 1 day","region":"',
                {
                  Ref: 'AWS::Region',
                },
                '","metrics":[["AWS/CloudFront","OriginLatency","DistributionId","myDistributionId","Region","Global",{"label":"Latency p95.00","period":86400,"stat":"p95.00"}]],"annotations":{"horizontal":[{"label":"SLO","value":200,"fill":"above","color":"#d62728","yAxis":"left"}]},"yAxis":{"left":{"min":0,"max":280}}}},{"type":"metric","width":6,"height":6,"x":18,"y":0,"properties":{"view":"timeSeries","title":"My Cloudfront - 30 days","region":"',
                {
                  Ref: 'AWS::Region',
                },
                '","metrics":[["AWS/CloudFront","OriginLatency","DistributionId","myDistributionId","Region","Global",{"label":"Latency p95.00","period":2592000,"stat":"p95.00"}]],"annotations":{"horizontal":[{"label":"SLO","value":200,"fill":"above","color":"#d62728","yAxis":"left"}]},"yAxis":{"left":{"min":0,"max":280}}}}]}',
              ],
            ],
          },
          DashboardName: 'TestAlarmsDashboard',
        }),
      );
    });
  });

  describe('ApiAvailability', () => {
    const slos = [{ type: 'ApiAvailability', apiName: 'myApiName', title: 'My API', sloThreshold: 0.99 }];

    it('constructs a dashboard with all four windows: 2%, 5%, 10%, and 100%', () => {
      const stack = new Stack();
      new SLOAlarmsDashboard(stack, 'TestAlarmsDashboard', { slos, dashboardName: 'TestAlarmsDashboard' });

      cdkExpect(stack).to(
        haveResourceLike('AWS::CloudWatch::Dashboard', {
          DashboardBody: {
            'Fn::Join': [
              '',
              [
                '{"start":"-P360D","widgets":[{"type":"metric","width":6,"height":6,"x":0,"y":0,"properties":{"view":"timeSeries","title":"My API - 60 minutes","region":"',
                {
                  Ref: 'AWS::Region',
                },
                '","metrics":[[{"label":"Availability","expression":"(gatewayRequests - gatewayErrors)/gatewayRequests"}],["AWS/ApiGateway","Count","ApiName","myApiName",{"label":"Requests","period":3600,"stat":"Sum","visible":false,"id":"gatewayRequests"}],["AWS/ApiGateway","5XXError","ApiName","myApiName",{"label":"Error rate","period":3600,"stat":"Sum","visible":false,"id":"gatewayErrors"}]],"annotations":{"horizontal":[{"label":"2% of Budget in 60 minutes","value":0.856,"fill":"below","color":"#d62728","yAxis":"left"},{"label":"SLO","value":0.99,"fill":"none","color":"#ff7f0e","yAxis":"left"}]},"yAxis":{"left":{"min":0.8271999999999998,"max":1}}}},{"type":"metric","width":6,"height":6,"x":6,"y":0,"properties":{"view":"timeSeries","title":"My API - 6 hours","region":"',
                {
                  Ref: 'AWS::Region',
                },
                '","metrics":[[{"label":"Availability","expression":"(gatewayRequests - gatewayErrors)/gatewayRequests"}],["AWS/ApiGateway","Count","ApiName","myApiName",{"label":"Requests","period":21600,"stat":"Sum","visible":false,"id":"gatewayRequests"}],["AWS/ApiGateway","5XXError","ApiName","myApiName",{"label":"Error rate","period":21600,"stat":"Sum","visible":false,"id":"gatewayErrors"}]],"annotations":{"horizontal":[{"label":"5% of Budget in 6 hours","value":0.94,"fill":"below","color":"#d62728","yAxis":"left"},{"label":"SLO","value":0.99,"fill":"none","color":"#ff7f0e","yAxis":"left"}]},"yAxis":{"left":{"min":0.9279999999999999,"max":1}}}},{"type":"metric","width":6,"height":6,"x":12,"y":0,"properties":{"view":"timeSeries","title":"My API - 1 day","region":"',
                {
                  Ref: 'AWS::Region',
                },
                '","metrics":[[{"label":"Availability","expression":"(gatewayRequests - gatewayErrors)/gatewayRequests"}],["AWS/ApiGateway","Count","ApiName","myApiName",{"label":"Requests","period":86400,"stat":"Sum","visible":false,"id":"gatewayRequests"}],["AWS/ApiGateway","5XXError","ApiName","myApiName",{"label":"Error rate","period":86400,"stat":"Sum","visible":false,"id":"gatewayErrors"}]],"annotations":{"horizontal":[{"label":"10% of Budget in 1 day","value":0.99,"fill":"below","color":"#d62728","yAxis":"left"},{"label":"SLO","value":0.99,"fill":"none","color":"#ff7f0e","yAxis":"left"}]},"yAxis":{"left":{"min":0.988,"max":1}}}},{"type":"metric","width":6,"height":6,"x":18,"y":0,"properties":{"view":"timeSeries","title":"My API - 30 days","region":"',
                {
                  Ref: 'AWS::Region',
                },
                '","metrics":[[{"label":"Availability","expression":"(gatewayRequests - gatewayErrors)/gatewayRequests"}],["AWS/ApiGateway","Count","ApiName","myApiName",{"label":"Requests","period":2592000,"stat":"Sum","visible":false,"id":"gatewayRequests"}],["AWS/ApiGateway","5XXError","ApiName","myApiName",{"label":"Error rate","period":2592000,"stat":"Sum","visible":false,"id":"gatewayErrors"}]],"annotations":{"horizontal":[{"label":"100% of Budget in 30 days","value":0.99,"fill":"below","color":"#d62728","yAxis":"left"},{"label":"SLO","value":0.99,"fill":"none","color":"#ff7f0e","yAxis":"left"}]},"yAxis":{"left":{"min":0.988,"max":1}}}}]}',
              ],
            ],
          },
          DashboardName: 'TestAlarmsDashboard',
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

      cdkExpect(stack).to(
        haveResourceLike('AWS::CloudWatch::Dashboard', {
          DashboardBody: {
            'Fn::Join': [
              '',
              [
                '{"start":"-P360D","widgets":[{"type":"metric","width":6,"height":6,"x":0,"y":0,"properties":{"view":"timeSeries","title":"My API - 60 minutes","region":"',
                {
                  Ref: 'AWS::Region',
                },
                '","metrics":[["AWS/ApiGateway","Latency","ApiName","myApiName",{"label":"Latency p85.60","period":3600,"stat":"p85.60"}]],"annotations":{"horizontal":[{"label":"SLO","value":2000,"fill":"above","color":"#d62728","yAxis":"left"}]},"yAxis":{"left":{"min":0,"max":2800}}}},{"type":"metric","width":6,"height":6,"x":6,"y":0,"properties":{"view":"timeSeries","title":"My API - 6 hours","region":"',
                {
                  Ref: 'AWS::Region',
                },
                '","metrics":[["AWS/ApiGateway","Latency","ApiName","myApiName",{"label":"Latency p94.00","period":21600,"stat":"p94.00"}]],"annotations":{"horizontal":[{"label":"SLO","value":2000,"fill":"above","color":"#d62728","yAxis":"left"}]},"yAxis":{"left":{"min":0,"max":2800}}}},{"type":"metric","width":6,"height":6,"x":12,"y":0,"properties":{"view":"timeSeries","title":"My API - 1 day","region":"',
                {
                  Ref: 'AWS::Region',
                },
                '","metrics":[["AWS/ApiGateway","Latency","ApiName","myApiName",{"label":"Latency p99.00","period":86400,"stat":"p99.00"}]],"annotations":{"horizontal":[{"label":"SLO","value":2000,"fill":"above","color":"#d62728","yAxis":"left"}]},"yAxis":{"left":{"min":0,"max":2800}}}},{"type":"metric","width":6,"height":6,"x":18,"y":0,"properties":{"view":"timeSeries","title":"My API - 30 days","region":"',
                {
                  Ref: 'AWS::Region',
                },
                '","metrics":[["AWS/ApiGateway","Latency","ApiName","myApiName",{"label":"Latency p99.00","period":2592000,"stat":"p99.00"}]],"annotations":{"horizontal":[{"label":"SLO","value":2000,"fill":"above","color":"#d62728","yAxis":"left"}]},"yAxis":{"left":{"min":0,"max":2800}}}}]}',
              ],
            ],
          },
          DashboardName: 'TestAlarmsDashboard',
        }),
      );
    });
  });
});
