import { CustomAvailabilityMetric } from '../../src/slos/custom-availability-metric';
import { Windows } from '../../src/slos/windows';
import { Duration } from '@aws-cdk/core';
import { Metric } from '@aws-cdk/aws-cloudwatch';

describe('CustomAvailabilityMetric', () => {
  const defaultProps = {
    namespace: 'testNamespace',
    errorsMetricName: 'testErrorsMetricName',
    countsMetricName: 'testCountsMetricName',
    sloWindow: Windows.twoPercentLong,
  };

  test('uses sum for the statistic in all metrics', () => {
    const expression = new CustomAvailabilityMetric(defaultProps);
    Object.keys(expression.usingMetrics).forEach(metric => {
      const typedMetric = expression.usingMetrics[metric] as Metric;
      expect(typedMetric.statistic).toEqual('Sum');
    });
  });

  test('uses the given namespace for all metrics', () => {
    const expression = new CustomAvailabilityMetric(defaultProps);
    Object.keys(expression.usingMetrics).forEach(metric => {
      const typedMetric = expression.usingMetrics[metric] as Metric;
      expect(typedMetric.namespace).toEqual('testNamespace');
    });
  });

  test('uses the given countsMetricName as request count', () => {
    const expression = new CustomAvailabilityMetric(defaultProps);
    const typedMetric = expression.usingMetrics.requests as Metric;
    expect(typedMetric.metricName).toEqual('testCountsMetricName');
  });

  test('uses the given errorsMetricName as error count', () => {
    const expression = new CustomAvailabilityMetric(defaultProps);
    const typedMetric = expression.usingMetrics.errors as Metric;
    expect(typedMetric.metricName).toEqual('testErrorsMetricName');
  });

  test('uses fraction of successful requests as the expression', () => {
    const expression = new CustomAvailabilityMetric(defaultProps);
    expect(expression.expression).toEqual('(requests - errors)/requests');
  });

  test('uses no other dimensions in any metrics, since custom metrics cannot be pushed with dimensions', () => {
    const expression = new CustomAvailabilityMetric(defaultProps);
    Object.keys(expression.usingMetrics).forEach(metric => {
      const typedMetric = expression.usingMetrics[metric] as Metric;
      expect(typedMetric.dimensions).toEqual(undefined);
    });
  });

  test('uses the alert window size for the period in all metrics', () => {
    const expression = new CustomAvailabilityMetric(defaultProps);
    Object.keys(expression.usingMetrics).forEach(metric => {
      const typedMetric = expression.usingMetrics[metric] as Metric;
      expect(typedMetric.period).toEqual(Duration.hours(1));
    });
  });
});
