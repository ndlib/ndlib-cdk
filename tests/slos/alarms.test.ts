import { expect as cdkExpect, haveResourceLike } from '@aws-cdk/assert';
import { SLOAlarms } from '../../src/slos/alarms';
import { Stack } from '@aws-cdk/core';

describe('SLOAlarms', () => {
  const slos = [
    { type: 'CloudfrontAvailability', distributionId: 'myDistributionId', title: 'My Cloudfront', sloThreshold: 0.999 },
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
  const invalidSlos = [{ type: 'SomeUndefined', apiName: 'apiName', title: 'My Made Up SLO', sloThreshold: 0.999 }];

  it('throws an excpetion if theres an unknown type', () => {
    const stack = new Stack();
    expect(
      () =>
        new SLOAlarms(stack, 'TestAlarms', {
          dashboardLink: 'dashboardLink',
          runbookLink: 'runbookLink',
          slos: invalidSlos,
        }),
    ).toThrow(
      'Alarms creation encountered an unknown type for slo: {"type":"SomeUndefined","apiName":"apiName","title":"My Made Up SLO","sloThreshold":0.999}.',
    );
  });

  describe('CloudfrontAvailability', () => {
    it('constructs an alarm for the 2.00% of 30 days budget burned in 60 minutes window', () => {
      const stack = new Stack();
      new SLOAlarms(stack, 'TestAlarms', { dashboardLink: 'dashboardLink', runbookLink: 'runbookLink', slos });

      cdkExpect(stack).to(
        haveResourceLike('AWS::CloudWatch::Alarm', {
          ComparisonOperator: 'LessThanOrEqualToThreshold',
          EvaluationPeriods: 1,
          AlarmName: 'My Cloudfront Availability <= 0.999 - 2.00% of 30 days budget burned in 60 minutes',
          DatapointsToAlarm: 1,
          Metrics: [
            {
              Expression: '1-(errorRate/100)',
              Label: 'Availability',
            },
            {
              Id: 'errorRate',
              Label: 'Error rate',
              MetricStat: {
                Metric: {
                  Dimensions: [
                    {
                      Name: 'DistributionId',
                      Value: 'myDistributionId',
                    },
                    {
                      Name: 'Region',
                      Value: 'Global',
                    },
                  ],
                  MetricName: '5xxErrorRate',
                  Namespace: 'AWS/CloudFront',
                },
                Period: 3600,
                Stat: 'Average',
              },
              ReturnData: false,
            },
          ],
          Threshold: 0.9856,
        }),
      );
    });

    it('constructs an alarm for the 5.00% of 30 days budget burned in 6 hours window', () => {
      const stack = new Stack();
      new SLOAlarms(stack, 'TestAlarms', { dashboardLink: 'dashboardLink', runbookLink: 'runbookLink', slos });

      cdkExpect(stack).to(
        haveResourceLike('AWS::CloudWatch::Alarm', {
          ComparisonOperator: 'LessThanOrEqualToThreshold',
          EvaluationPeriods: 1,
          AlarmName: 'My Cloudfront Availability <= 0.999 - 5.00% of 30 days budget burned in 6 hours',
          DatapointsToAlarm: 1,
          Metrics: [
            {
              Expression: '1-(errorRate/100)',
              Id: 'expr_1',
              Label: 'Availability',
            },
            {
              Id: 'errorRate',
              Label: 'Error rate',
              MetricStat: {
                Metric: {
                  Dimensions: [
                    {
                      Name: 'DistributionId',
                      Value: 'myDistributionId',
                    },
                    {
                      Name: 'Region',
                      Value: 'Global',
                    },
                  ],
                  MetricName: '5xxErrorRate',
                  Namespace: 'AWS/CloudFront',
                },
                Period: 21600,
                Stat: 'Average',
              },
              ReturnData: false,
            },
          ],
          Threshold: 0.994,
        }),
      );
    });

    it('constructs an alarm for the 10.00% of 30 days budget burned in 1 day window', () => {
      const stack = new Stack();
      new SLOAlarms(stack, 'TestAlarms', { dashboardLink: 'dashboardLink', runbookLink: 'runbookLink', slos });

      cdkExpect(stack).to(
        haveResourceLike('AWS::CloudWatch::Alarm', {
          ComparisonOperator: 'LessThanOrEqualToThreshold',
          EvaluationPeriods: 1,
          AlarmName: 'My Cloudfront Availability <= 0.999 - 10.00% of 30 days budget burned in 1 day',
          DatapointsToAlarm: 1,
          Metrics: [
            {
              Expression: '1-(errorRate/100)',
              Id: 'expr_1',
              Label: 'Availability',
            },
            {
              Id: 'errorRate',
              Label: 'Error rate',
              MetricStat: {
                Metric: {
                  Dimensions: [
                    {
                      Name: 'DistributionId',
                      Value: 'myDistributionId',
                    },
                    {
                      Name: 'Region',
                      Value: 'Global',
                    },
                  ],
                  MetricName: '5xxErrorRate',
                  Namespace: 'AWS/CloudFront',
                },
                Period: 86400,
                Stat: 'Average',
              },
              ReturnData: false,
            },
          ],
          Threshold: 0.997,
        }),
      );
    });

    it('constructs a parent alarm that messages the SNS topic', () => {
      const stack = new Stack();
      new SLOAlarms(stack, 'TestAlarms', { dashboardLink: 'dashboardLink', runbookLink: 'runbookLink', slos });

      cdkExpect(stack).to(
        haveResourceLike('AWS::CloudWatch::CompositeAlarm', {
          AlarmName: 'My Cloudfront Availability <= 0.999',
          AlarmRule: {
            'Fn::Join': [
              '',
              [
                'ALARM("',
                {
                  Ref: 'TestAlarmsMyCloudfrontAvailability0999200of30daysbudgetburnedin60minutes2F1522E9',
                },
                '") OR ALARM("',
                {
                  Ref: 'TestAlarmsMyCloudfrontAvailability0999500of30daysbudgetburnedin6hoursC5F6FECD',
                },
                '") OR ALARM("',
                {
                  Ref: 'TestAlarmsMyCloudfrontAvailability09991000of30daysbudgetburnedin1day498C36D9',
                },
                '")',
              ],
            ],
          },
          AlarmActions: [
            {
              Ref: 'AlarmTopicD01E77F9',
            },
          ],
          AlarmDescription:
            'Service is at risk of exceeding its error budget. Please use the links below to troubleshoot the problem:\n\nDashboard: dashboardLink\nRun book: runbookLink\n',
        }),
      );
    });

    it('constructs a parent alarm with an alarms dashboard link when one is included', () => {
      const stack = new Stack();
      new SLOAlarms(stack, 'TestAlarms', {
        alarmsDashboardLink: 'alarmsDashboardLink',
        dashboardLink: 'dashboardLink',
        runbookLink: 'runbookLink',
        slos,
      });

      cdkExpect(stack).to(
        haveResourceLike('AWS::CloudWatch::CompositeAlarm', {
          AlarmName: 'My Cloudfront Availability <= 0.999',
          AlarmRule: {
            'Fn::Join': [
              '',
              [
                'ALARM("',
                {
                  Ref: 'TestAlarmsMyCloudfrontAvailability0999200of30daysbudgetburnedin60minutes2F1522E9',
                },
                '") OR ALARM("',
                {
                  Ref: 'TestAlarmsMyCloudfrontAvailability0999500of30daysbudgetburnedin6hoursC5F6FECD',
                },
                '") OR ALARM("',
                {
                  Ref: 'TestAlarmsMyCloudfrontAvailability09991000of30daysbudgetburnedin1day498C36D9',
                },
                '")',
              ],
            ],
          },
          AlarmActions: [
            {
              Ref: 'AlarmTopicD01E77F9',
            },
          ],
          AlarmDescription:
            'Service is at risk of exceeding its error budget. Please use the links below to troubleshoot the problem:\n\nDashboard: dashboardLink\nRun book: runbookLink\n\nAlarms Dashboard: alarmsDashboardLink',
        }),
      );
    });
  });

  describe('CloudfrontLatency', () => {
    it('constructs an alarm for the 2.00% of 30 days budget burned in 60 minutes window', () => {
      const stack = new Stack();
      new SLOAlarms(stack, 'TestAlarms', { dashboardLink: 'dashboardLink', runbookLink: 'runbookLink', slos });

      cdkExpect(stack).to(
        haveResourceLike('AWS::CloudWatch::Alarm', {
          ComparisonOperator: 'GreaterThanOrEqualToThreshold',
          EvaluationPeriods: 1,
          AlarmName: 'My Cloudfront Latency P95 >= 200ms - 2.00% of 30 days budget burned in 60 minutes',
          DatapointsToAlarm: 1,
          Dimensions: [
            {
              Name: 'DistributionId',
              Value: 'myDistributionId',
            },
            {
              Name: 'Region',
              Value: 'Global',
            },
          ],
          ExtendedStatistic: 'p28.00',
          MetricName: 'OriginLatency',
          Namespace: 'AWS/CloudFront',
          Period: 3600,
          Threshold: 200,
        }),
      );
    });

    it('constructs an alarm for the 5.00% of 30 days budget burned in 6 hours window', () => {
      const stack = new Stack();
      new SLOAlarms(stack, 'TestAlarms', { dashboardLink: 'dashboardLink', runbookLink: 'runbookLink', slos });

      cdkExpect(stack).to(
        haveResourceLike('AWS::CloudWatch::Alarm', {
          ComparisonOperator: 'GreaterThanOrEqualToThreshold',
          EvaluationPeriods: 1,
          AlarmName: 'My Cloudfront Latency P95 >= 200ms - 5.00% of 30 days budget burned in 6 hours',
          DatapointsToAlarm: 1,
          Dimensions: [
            {
              Name: 'DistributionId',
              Value: 'myDistributionId',
            },
            {
              Name: 'Region',
              Value: 'Global',
            },
          ],
          ExtendedStatistic: 'p70.00',
          MetricName: 'OriginLatency',
          Namespace: 'AWS/CloudFront',
          Period: 21600,
          Threshold: 200,
        }),
      );
    });

    it('constructs an alarm for the 10.00% of 30 days budget burned in 1 day window', () => {
      const stack = new Stack();
      new SLOAlarms(stack, 'TestAlarms', { dashboardLink: 'dashboardLink', runbookLink: 'runbookLink', slos });

      cdkExpect(stack).to(
        haveResourceLike('AWS::CloudWatch::Alarm', {
          ComparisonOperator: 'GreaterThanOrEqualToThreshold',
          EvaluationPeriods: 1,
          AlarmName: 'My Cloudfront Latency P95 >= 200ms - 10.00% of 30 days budget burned in 1 day',
          DatapointsToAlarm: 1,
          Dimensions: [
            {
              Name: 'DistributionId',
              Value: 'myDistributionId',
            },
            {
              Name: 'Region',
              Value: 'Global',
            },
          ],
          ExtendedStatistic: 'p85.00',
          MetricName: 'OriginLatency',
          Namespace: 'AWS/CloudFront',
          Period: 86400,
          Threshold: 200,
        }),
      );
    });

    it('constructs a parent alarm that messages the SNS topic', () => {
      const stack = new Stack();
      new SLOAlarms(stack, 'TestAlarms', { dashboardLink: 'dashboardLink', runbookLink: 'runbookLink', slos });

      cdkExpect(stack).to(
        haveResourceLike('AWS::CloudWatch::CompositeAlarm', {
          AlarmName: 'My Cloudfront Latency P95 >= 200ms',
          AlarmRule: {
            'Fn::Join': [
              '',
              [
                'ALARM("',
                {
                  Ref: 'TestAlarmsMyCloudfrontLatencyP95200ms200of30daysbudgetburnedin60minutes7E69B8C6',
                },
                '") OR ALARM("',
                {
                  Ref: 'TestAlarmsMyCloudfrontLatencyP95200ms500of30daysbudgetburnedin6hours2541A9B8',
                },
                '") OR ALARM("',
                {
                  Ref: 'TestAlarmsMyCloudfrontLatencyP95200ms1000of30daysbudgetburnedin1dayD2D47B20',
                },
                '")',
              ],
            ],
          },
          AlarmActions: [
            {
              Ref: 'AlarmTopicD01E77F9',
            },
          ],
          AlarmDescription:
            'Service is at risk of exceeding its error budget. Please use the links below to troubleshoot the problem:\n\nDashboard: dashboardLink\nRun book: runbookLink\n',
        }),
      );
    });

    it('constructs a parent alarm with an alarms dashboard link when one is included', () => {
      const stack = new Stack();
      new SLOAlarms(stack, 'TestAlarms', {
        alarmsDashboardLink: 'alarmsDashboardLink',
        dashboardLink: 'dashboardLink',
        runbookLink: 'runbookLink',
        slos,
      });

      cdkExpect(stack).to(
        haveResourceLike('AWS::CloudWatch::CompositeAlarm', {
          AlarmName: 'My Cloudfront Latency P95 >= 200ms',
          AlarmRule: {
            'Fn::Join': [
              '',
              [
                'ALARM("',
                {
                  Ref: 'TestAlarmsMyCloudfrontLatencyP95200ms200of30daysbudgetburnedin60minutes7E69B8C6',
                },
                '") OR ALARM("',
                {
                  Ref: 'TestAlarmsMyCloudfrontLatencyP95200ms500of30daysbudgetburnedin6hours2541A9B8',
                },
                '") OR ALARM("',
                {
                  Ref: 'TestAlarmsMyCloudfrontLatencyP95200ms1000of30daysbudgetburnedin1dayD2D47B20',
                },
                '")',
              ],
            ],
          },
          AlarmActions: [
            {
              Ref: 'AlarmTopicD01E77F9',
            },
          ],
          AlarmDescription:
            'Service is at risk of exceeding its error budget. Please use the links below to troubleshoot the problem:\n\nDashboard: dashboardLink\nRun book: runbookLink\n\nAlarms Dashboard: alarmsDashboardLink',
        }),
      );
    });
  });

  describe('ApiAvailability', () => {
    it('constructs an alarm for the 2.00% of 30 days budget burned in 60 minutes window', () => {
      const stack = new Stack();
      new SLOAlarms(stack, 'TestAlarms', { dashboardLink: 'dashboardLink', runbookLink: 'runbookLink', slos });

      cdkExpect(stack).to(
        haveResourceLike('AWS::CloudWatch::Alarm', {
          ComparisonOperator: 'LessThanOrEqualToThreshold',
          EvaluationPeriods: 1,
          AlarmName: 'My API Availability <= 0.99 - 2.00% of 30 days budget burned in 60 minutes',
          DatapointsToAlarm: 1,
          Metrics: [
            {
              Expression: '(gatewayRequests - gatewayErrors)/gatewayRequests',
              Id: 'expr_1',
              Label: 'Availability',
            },
            {
              Id: 'gatewayRequests',
              Label: 'Requests',
              MetricStat: {
                Metric: {
                  Dimensions: [
                    {
                      Name: 'ApiName',
                      Value: 'myApiName',
                    },
                  ],
                  MetricName: 'Count',
                  Namespace: 'AWS/ApiGateway',
                },
                Period: 3600,
                Stat: 'Sum',
              },
              ReturnData: false,
            },
            {
              Id: 'gatewayErrors',
              Label: 'Error rate',
              MetricStat: {
                Metric: {
                  Dimensions: [
                    {
                      Name: 'ApiName',
                      Value: 'myApiName',
                    },
                  ],
                  MetricName: '5XXError',
                  Namespace: 'AWS/ApiGateway',
                },
                Period: 3600,
                Stat: 'Sum',
              },
              ReturnData: false,
            },
          ],
          Threshold: 0.8559999999999999,
        }),
      );
    });

    it('constructs an alarm for the 5.00% of 30 days budget burned in 6 hours window', () => {
      const stack = new Stack();
      new SLOAlarms(stack, 'TestAlarms', { dashboardLink: 'dashboardLink', runbookLink: 'runbookLink', slos });

      cdkExpect(stack).to(
        haveResourceLike('AWS::CloudWatch::Alarm', {
          ComparisonOperator: 'LessThanOrEqualToThreshold',
          EvaluationPeriods: 1,
          AlarmName: 'My API Availability <= 0.99 - 5.00% of 30 days budget burned in 6 hours',
          DatapointsToAlarm: 1,
          Metrics: [
            {
              Expression: '(gatewayRequests - gatewayErrors)/gatewayRequests',
              Id: 'expr_1',
              Label: 'Availability',
            },
            {
              Id: 'gatewayRequests',
              Label: 'Requests',
              MetricStat: {
                Metric: {
                  Dimensions: [
                    {
                      Name: 'ApiName',
                      Value: 'myApiName',
                    },
                  ],
                  MetricName: 'Count',
                  Namespace: 'AWS/ApiGateway',
                },
                Period: 21600,
                Stat: 'Sum',
              },
              ReturnData: false,
            },
            {
              Id: 'gatewayErrors',
              Label: 'Error rate',
              MetricStat: {
                Metric: {
                  Dimensions: [
                    {
                      Name: 'ApiName',
                      Value: 'myApiName',
                    },
                  ],
                  MetricName: '5XXError',
                  Namespace: 'AWS/ApiGateway',
                },
                Period: 21600,
                Stat: 'Sum',
              },
              ReturnData: false,
            },
          ],
          Threshold: 0.94,
        }),
      );
    });

    it('constructs an alarm for the 10.00% of 30 days budget burned in 1 day window', () => {
      const stack = new Stack();
      new SLOAlarms(stack, 'TestAlarms', { dashboardLink: 'dashboardLink', runbookLink: 'runbookLink', slos });

      cdkExpect(stack).to(
        haveResourceLike('AWS::CloudWatch::Alarm', {
          ComparisonOperator: 'LessThanOrEqualToThreshold',
          EvaluationPeriods: 1,
          AlarmName: 'My API Availability <= 0.99 - 10.00% of 30 days budget burned in 1 day',
          DatapointsToAlarm: 1,
          Metrics: [
            {
              Expression: '(gatewayRequests - gatewayErrors)/gatewayRequests',
              Id: 'expr_1',
              Label: 'Availability',
            },
            {
              Id: 'gatewayRequests',
              Label: 'Requests',
              MetricStat: {
                Metric: {
                  Dimensions: [
                    {
                      Name: 'ApiName',
                      Value: 'myApiName',
                    },
                  ],
                  MetricName: 'Count',
                  Namespace: 'AWS/ApiGateway',
                },
                Period: 86400,
                Stat: 'Sum',
              },
              ReturnData: false,
            },
            {
              Id: 'gatewayErrors',
              Label: 'Error rate',
              MetricStat: {
                Metric: {
                  Dimensions: [
                    {
                      Name: 'ApiName',
                      Value: 'myApiName',
                    },
                  ],
                  MetricName: '5XXError',
                  Namespace: 'AWS/ApiGateway',
                },
                Period: 86400,
                Stat: 'Sum',
              },
              ReturnData: false,
            },
          ],
          Threshold: 0.97,
        }),
      );
    });

    it('constructs a parent alarm that messages the SNS topic', () => {
      const stack = new Stack();
      new SLOAlarms(stack, 'TestAlarms', { dashboardLink: 'dashboardLink', runbookLink: 'runbookLink', slos });

      cdkExpect(stack).to(
        haveResourceLike('AWS::CloudWatch::CompositeAlarm', {
          AlarmName: 'My API Availability <= 0.99',
          AlarmRule: {
            'Fn::Join': [
              '',
              [
                'ALARM("',
                {
                  Ref: 'TestAlarmsMyAPIAvailability099200of30daysbudgetburnedin60minutes4765EC8C',
                },
                '") OR ALARM("',
                {
                  Ref: 'TestAlarmsMyAPIAvailability099500of30daysbudgetburnedin6hours40794194',
                },
                '") OR ALARM("',
                {
                  Ref: 'TestAlarmsMyAPIAvailability0991000of30daysbudgetburnedin1day0AB16FC7',
                },
                '")',
              ],
            ],
          },
          AlarmActions: [
            {
              Ref: 'AlarmTopicD01E77F9',
            },
          ],
          AlarmDescription:
            'Service is at risk of exceeding its error budget. Please use the links below to troubleshoot the problem:\n\nDashboard: dashboardLink\nRun book: runbookLink\n',
        }),
      );
    });

    it('constructs a parent alarm with an alarms dashboard link when one is included', () => {
      const stack = new Stack();
      new SLOAlarms(stack, 'TestAlarms', {
        alarmsDashboardLink: 'alarmsDashboardLink',
        dashboardLink: 'dashboardLink',
        runbookLink: 'runbookLink',
        slos,
      });

      cdkExpect(stack).to(
        haveResourceLike('AWS::CloudWatch::CompositeAlarm', {
          AlarmName: 'My API Availability <= 0.99',
          AlarmRule: {
            'Fn::Join': [
              '',
              [
                'ALARM("',
                {
                  Ref: 'TestAlarmsMyAPIAvailability099200of30daysbudgetburnedin60minutes4765EC8C',
                },
                '") OR ALARM("',
                {
                  Ref: 'TestAlarmsMyAPIAvailability099500of30daysbudgetburnedin6hours40794194',
                },
                '") OR ALARM("',
                {
                  Ref: 'TestAlarmsMyAPIAvailability0991000of30daysbudgetburnedin1day0AB16FC7',
                },
                '")',
              ],
            ],
          },
          AlarmActions: [
            {
              Ref: 'AlarmTopicD01E77F9',
            },
          ],
          AlarmDescription:
            'Service is at risk of exceeding its error budget. Please use the links below to troubleshoot the problem:\n\nDashboard: dashboardLink\nRun book: runbookLink\n\nAlarms Dashboard: alarmsDashboardLink',
        }),
      );
    });
  });

  describe('ApiLatency', () => {
    it('constructs an alarm for the 2.00% of 30 days budget burned in 60 minutes window', () => {
      const stack = new Stack();
      new SLOAlarms(stack, 'TestAlarms', { dashboardLink: 'dashboardLink', runbookLink: 'runbookLink', slos });

      cdkExpect(stack).to(
        haveResourceLike('AWS::CloudWatch::Alarm', {
          ComparisonOperator: 'GreaterThanOrEqualToThreshold',
          EvaluationPeriods: 1,
          AlarmName: 'My API Latency P99 >= 2000ms - 2.00% of 30 days budget burned in 60 minutes',
          DatapointsToAlarm: 1,
          Dimensions: [
            {
              Name: 'ApiName',
              Value: 'myApiName',
            },
          ],
          ExtendedStatistic: 'p85.60',
          MetricName: 'Latency',
          Namespace: 'AWS/ApiGateway',
          Period: 3600,
          Threshold: 2000,
        }),
      );
    });

    it('constructs an alarm for the 5.00% of 30 days budget burned in 6 hours window', () => {
      const stack = new Stack();
      new SLOAlarms(stack, 'TestAlarms', { dashboardLink: 'dashboardLink', runbookLink: 'runbookLink', slos });

      cdkExpect(stack).to(
        haveResourceLike('AWS::CloudWatch::Alarm', {
          ComparisonOperator: 'GreaterThanOrEqualToThreshold',
          EvaluationPeriods: 1,
          AlarmName: 'My API Latency P99 >= 2000ms - 5.00% of 30 days budget burned in 6 hours',
          DatapointsToAlarm: 1,
          Dimensions: [
            {
              Name: 'ApiName',
              Value: 'myApiName',
            },
          ],
          ExtendedStatistic: 'p94.00',
          MetricName: 'Latency',
          Namespace: 'AWS/ApiGateway',
          Period: 21600,
          Threshold: 2000,
        }),
      );
    });

    it('constructs an alarm for the 10.00% of 30 days budget burned in 1 day window', () => {
      const stack = new Stack();
      new SLOAlarms(stack, 'TestAlarms', { dashboardLink: 'dashboardLink', runbookLink: 'runbookLink', slos });

      cdkExpect(stack).to(
        haveResourceLike('AWS::CloudWatch::Alarm', {
          ComparisonOperator: 'GreaterThanOrEqualToThreshold',
          EvaluationPeriods: 1,
          AlarmName: 'My API Latency P99 >= 2000ms - 10.00% of 30 days budget burned in 1 day',
          DatapointsToAlarm: 1,
          Dimensions: [
            {
              Name: 'ApiName',
              Value: 'myApiName',
            },
          ],
          ExtendedStatistic: 'p97.00',
          MetricName: 'Latency',
          Namespace: 'AWS/ApiGateway',
          Period: 86400,
          Threshold: 2000,
        }),
      );
    });

    it('constructs a parent alarm that messages the SNS topic', () => {
      const stack = new Stack();
      new SLOAlarms(stack, 'TestAlarms', { dashboardLink: 'dashboardLink', runbookLink: 'runbookLink', slos });

      cdkExpect(stack).to(
        haveResourceLike('AWS::CloudWatch::CompositeAlarm', {
          AlarmName: 'My API Latency P99 >= 2000ms',
          AlarmRule: {
            'Fn::Join': [
              '',
              [
                'ALARM("',
                {
                  Ref: 'TestAlarmsMyAPILatencyP992000ms200of30daysbudgetburnedin60minutesDC09F63E',
                },
                '") OR ALARM("',
                {
                  Ref: 'TestAlarmsMyAPILatencyP992000ms500of30daysbudgetburnedin6hours290D051F',
                },
                '") OR ALARM("',
                {
                  Ref: 'TestAlarmsMyAPILatencyP992000ms1000of30daysbudgetburnedin1day82FC555F',
                },
                '")',
              ],
            ],
          },
          AlarmActions: [
            {
              Ref: 'AlarmTopicD01E77F9',
            },
          ],
          AlarmDescription:
            'Service is at risk of exceeding its error budget. Please use the links below to troubleshoot the problem:\n\nDashboard: dashboardLink\nRun book: runbookLink\n',
        }),
      );
    });

    it('constructs a parent alarm with an alarms dashboard link when one is included', () => {
      const stack = new Stack();
      new SLOAlarms(stack, 'TestAlarms', {
        alarmsDashboardLink: 'alarmsDashboardLink',
        dashboardLink: 'dashboardLink',
        runbookLink: 'runbookLink',
        slos,
      });

      cdkExpect(stack).to(
        haveResourceLike('AWS::CloudWatch::CompositeAlarm', {
          AlarmName: 'My API Latency P99 >= 2000ms',
          AlarmRule: {
            'Fn::Join': [
              '',
              [
                'ALARM("',
                {
                  Ref: 'TestAlarmsMyAPILatencyP992000ms200of30daysbudgetburnedin60minutesDC09F63E',
                },
                '") OR ALARM("',
                {
                  Ref: 'TestAlarmsMyAPILatencyP992000ms500of30daysbudgetburnedin6hours290D051F',
                },
                '") OR ALARM("',
                {
                  Ref: 'TestAlarmsMyAPILatencyP992000ms1000of30daysbudgetburnedin1day82FC555F',
                },
                '")',
              ],
            ],
          },
          AlarmActions: [
            {
              Ref: 'AlarmTopicD01E77F9',
            },
          ],
          AlarmDescription:
            'Service is at risk of exceeding its error budget. Please use the links below to troubleshoot the problem:\n\nDashboard: dashboardLink\nRun book: runbookLink\n\nAlarms Dashboard: alarmsDashboardLink',
        }),
      );
    });
  });
});
