import { CustomLatencyMetric } from '../../src/slos/custom-latency-metric';
import { Windows } from '../../src/slos/windows';
import { Duration } from '@aws-cdk/core';

describe('CustomAvailabilityMetric', () => {
  const defaultProps = {
    namespace: 'testNamespace',
    latencyMetricName: 'testLatencyMetric',
    sloThreshold: 0.99,
    latencyThreshold: 200,
    sloWindow: Windows.twoPercentLong,
  };

  test('uses the window burn rate threshold for the statistic and puts the statistic in its label', () => {
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
        const metric = new CustomLatencyMetric({
          namespace: 'testNamespace',
          latencyMetricName: 'testLatencyMetric',
          sloThreshold: expectation.sloThreshold,
          sloWindow: window.window,
        });
        expect(metric.statistic).toEqual(window.expectedStatistic);
        expect(metric.label).toEqual(`Latency ${window.expectedStatistic}`);
      });
    });
  });

  test('uses the given namespace', () => {
    const metric = new CustomLatencyMetric(defaultProps);
    expect(metric.namespace).toEqual('testNamespace');
  });

  test('uses given latency metric name', () => {
    const metric = new CustomLatencyMetric(defaultProps);
    expect(metric.metricName).toEqual('testLatencyMetric');
  });

  test('uses no other dimensions in any metrics, since custom metrics cannot be pushed with dimensions', () => {
    const metric = new CustomLatencyMetric(defaultProps);
    expect(metric.dimensions).toEqual(undefined);
  });

  test('uses the alert window size for the period', () => {
    const metric = new CustomLatencyMetric(defaultProps);
    expect(metric.period).toEqual(Duration.hours(1));
  });

  test('uses p0 for the statistic when too small a window is used for the threshold', () => {
    const props = defaultProps;
    props.sloThreshold = 0.5;
    const metric = new CustomLatencyMetric(props);
    expect(metric.statistic).toEqual('p0.00');
  });
});
