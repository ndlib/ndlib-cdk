import { AppSyncAvailabilityMetric } from '../../src/slos/appsync-availability-metric';
import { Windows } from '../../src/slos/windows';
import { Duration } from '@aws-cdk/core';
import { Metric } from '@aws-cdk/aws-cloudwatch';

describe('AppSyncAvailabilityMetric', () => {
  test('uses sum for the statistic for the error metric', () => {
    const expression = new AppSyncAvailabilityMetric({ apiId: 'apiId', sloWindow: Windows.twoPercentLong });
    const typedMetric = expression.usingMetrics.errors as Metric;
    expect(typedMetric.statistic).toEqual('Sum');
  });

  test('uses the AWS/AppSync namespace for all metrics', () => {
    const expression = new AppSyncAvailabilityMetric({ apiId: 'apiId', sloWindow: Windows.twoPercentLong });
    Object.keys(expression.usingMetrics).forEach(metric => {
      const typedMetric = expression.usingMetrics[metric] as Metric;
      expect(typedMetric.namespace).toEqual('AWS/AppSync');
    });
  });

  test('uses sample count of errors as the requests', () => {
    const expression = new AppSyncAvailabilityMetric({ apiId: 'apiId', sloWindow: Windows.twoPercentLong });
    const typedMetric = expression.usingMetrics.requests as Metric;
    expect(typedMetric.metricName).toEqual('5XXError');
    expect(typedMetric.statistic).toEqual('SampleCount');
  });

  test('uses 5xx as errors', () => {
    const expression = new AppSyncAvailabilityMetric({ apiId: 'apiId', sloWindow: Windows.twoPercentLong });
    const typedMetric = expression.usingMetrics.errors as Metric;
    expect(typedMetric.metricName).toEqual('5XXError');
  });

  test('uses fraction of successful requests as the expression', () => {
    const expression = new AppSyncAvailabilityMetric({ apiId: 'apiId', sloWindow: Windows.twoPercentLong });
    expect(expression.expression).toEqual('(requests - errors)/requests');
  });

  test('uses the api id for dimensions in all metrics', () => {
    const expression = new AppSyncAvailabilityMetric({ apiId: 'apiId', sloWindow: Windows.twoPercentLong });
    Object.keys(expression.usingMetrics).forEach(metric => {
      const typedMetric = expression.usingMetrics[metric] as Metric;
      expect(typedMetric.dimensions).toEqual({ GraphQLAPIId: 'apiId' });
    });
  });

  test('uses the alert window size for the period in all metrics', () => {
    const expression = new AppSyncAvailabilityMetric({ apiId: 'apiId', sloWindow: Windows.twoPercentLong });
    Object.keys(expression.usingMetrics).forEach(metric => {
      const typedMetric = expression.usingMetrics[metric] as Metric;
      expect(typedMetric.period).toEqual(Duration.hours(1));
    });
  });
});
