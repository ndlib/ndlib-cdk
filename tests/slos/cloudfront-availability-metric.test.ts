import { CloudfrontAvailabilityMetric } from '../../src/slos/cloudfront-availability-metric'
import { Windows } from '../../src/slos/windows'
import { Duration } from '@aws-cdk/core'
import { Metric } from '@aws-cdk/aws-cloudwatch'

// The metric is already given in percentage form so we need to use average for statistitc here
// https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/programming-cloudwatch-metrics.html
test('CloudfrontAvailabilityMetric uses average for the error rate statistic', () => {
  const expression = new CloudfrontAvailabilityMetric({
    distributionId: 'distributionId',
    sloWindow: Windows.twoPercentLong,
  })
  const typedMetric = expression.usingMetrics.errorRate as Metric
  expect(typedMetric.statistic).toEqual('Average')
})

test('CloudfrontAvailabilityMetric uses the AWS/CloudFront namespace for all metrics', () => {
  const expression = new CloudfrontAvailabilityMetric({
    distributionId: 'distributionId',
    sloWindow: Windows.twoPercentLong,
  })
  Object.keys(expression.usingMetrics).forEach(metric => {
    const typedMetric = expression.usingMetrics[metric] as Metric
    expect(typedMetric.namespace).toEqual('AWS/CloudFront')
  })
})

test('CloudfrontAvailabilityMetric uses 5xx errors', () => {
  const expression = new CloudfrontAvailabilityMetric({
    distributionId: 'distributionId',
    sloWindow: Windows.twoPercentLong,
  })
  const typedMetric = expression.usingMetrics.errorRate as Metric
  expect(typedMetric.metricName).toEqual('5xxErrorRate')
})

test('CloudfrontAvailabilityMetric uses fraction of successful requests as the expression', () => {
  const expression = new CloudfrontAvailabilityMetric({
    distributionId: 'distributionId',
    sloWindow: Windows.twoPercentLong,
  })
  expect(expression.expression).toEqual('1-(errorRate/100)')
})

test('CloudfrontAvailabilityMetric uses the distributionId name for dimensions in all metrics', () => {
  const expression = new CloudfrontAvailabilityMetric({
    distributionId: 'distributionId',
    sloWindow: Windows.twoPercentLong,
  })
  Object.keys(expression.usingMetrics).forEach(metric => {
    const typedMetric = expression.usingMetrics[metric] as Metric
    expect(typedMetric.dimensions).toEqual({ Region: 'Global', DistributionId: 'distributionId' })
  })
})

test('CloudfrontAvailabilityMetric uses the alert window size for the period in all metrics', () => {
  const expression = new CloudfrontAvailabilityMetric({
    distributionId: 'distributionId',
    sloWindow: Windows.twoPercentLong,
  })
  Object.keys(expression.usingMetrics).forEach(metric => {
    const typedMetric = expression.usingMetrics[metric] as Metric
    expect(typedMetric.period).toEqual(Duration.hours(1))
  })
})
