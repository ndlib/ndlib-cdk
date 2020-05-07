import { CloudfrontLatencyMetric } from '../../src/slos/cloudfront-latency-metric';
import { Windows } from '../../src/slos/windows';
import { Duration } from '@aws-cdk/core';

test('CloudfrontLatencyMetric uses the window burn rate threshold for the statistic and puts the statistic in its label', () => {
  const expectations = [
    {
      sloThreshold: 0.999,
      windows: [
        { window: Windows.twoPercentLong, expectedStatistic: 'p98.56' },
        { window: Windows.fivePercentLong, expectedStatistic: 'p99.40' },
        { window: Windows.tenPercentLong, expectedStatistic: 'p99.90' },
      ],
    },
    {
      sloThreshold: 0.95,
      windows: [
        { window: Windows.twoPercentLong, expectedStatistic: 'p28.00' },
        { window: Windows.fivePercentLong, expectedStatistic: 'p70.00' },
        { window: Windows.tenPercentLong, expectedStatistic: 'p95.00' },
      ],
    },
    {
      sloThreshold: 0.5,
      windows: [{ window: Windows.tenPercentLong, expectedStatistic: 'p50.00' }],
    },
  ];
  expectations.forEach(expectation => {
    expectation.windows.forEach(window => {
      const metric = new CloudfrontLatencyMetric({
        distributionId: 'distributionId',
        sloThreshold: expectation.sloThreshold,
        sloWindow: window.window,
      });
      expect(metric.statistic).toEqual(window.expectedStatistic);
      expect(metric.label).toEqual(`Latency ${window.expectedStatistic}`);
    });
  });
});

test('CloudfrontLatencyMetric uses the AWS/CloudFront namespace', () => {
  const metric = new CloudfrontLatencyMetric({
    distributionId: 'distributionId',
    sloThreshold: 0.999,
    sloWindow: Windows.twoPercentLong,
  });
  expect(metric.namespace).toEqual('AWS/CloudFront');
});

// https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/programming-cloudwatch-metrics.html
test('CloudfrontLatencyMetric uses total latency of requests to the origin, not including cached requests', () => {
  const metric = new CloudfrontLatencyMetric({
    distributionId: 'distributionId',
    sloThreshold: 0.999,
    sloWindow: Windows.twoPercentLong,
  });
  expect(metric.metricName).toEqual('OriginLatency');
});

test('CloudfrontLatencyMetric uses the distributionId name for dimensions', () => {
  const metric = new CloudfrontLatencyMetric({
    distributionId: 'distributionId',
    sloThreshold: 0.999,
    sloWindow: Windows.twoPercentLong,
  });
  expect(metric.dimensions).toEqual({ Region: 'Global', DistributionId: 'distributionId' });
});

test('CloudfrontLatencyMetric uses the alert window size for the period', () => {
  const metric = new CloudfrontLatencyMetric({
    distributionId: 'distributionId',
    sloThreshold: 0.999,
    sloWindow: Windows.twoPercentLong,
  });
  expect(metric.period).toEqual(Duration.hours(1));
});

test('CloudfrontLatencyMetric uses p0 for the statistic when too small a window is used for the threshold', () => {
  const metric = new CloudfrontLatencyMetric({
    distributionId: 'distributionId',
    sloThreshold: 0.5,
    sloWindow: Windows.twoPercentLong,
  });
  expect(metric.statistic).toEqual('p0.00');
});
