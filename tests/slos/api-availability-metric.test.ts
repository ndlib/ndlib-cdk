import { ApiAvailabilityMetric } from '../../src/slos/api-availability-metric'
import { Windows } from '../../src/slos/windows'
import { Duration } from '@aws-cdk/core'
import { Metric } from '@aws-cdk/aws-cloudwatch'

test('ApiAvailabilityMetric uses sum for the statistic in all metrics', () => {
  const expression = new ApiAvailabilityMetric({ apiName: 'apiName', sloWindow: Windows.twoPercentLong })
  Object.keys(expression.usingMetrics).forEach(metric => {
    const typedMetric = expression.usingMetrics[metric] as Metric
    expect(typedMetric.statistic).toEqual('Sum')
  })
})

test('ApiAvailabilityMetric uses the AWS/ApiGateway namespace for all metrics', () => {
  const expression = new ApiAvailabilityMetric({ apiName: 'apiName', sloWindow: Windows.twoPercentLong })
  Object.keys(expression.usingMetrics).forEach(metric => {
    const typedMetric = expression.usingMetrics[metric] as Metric
    expect(typedMetric.namespace).toEqual('AWS/ApiGateway')
  })
})

test('ApiAvailabilityMetric uses count of requests', () => {
  const expression = new ApiAvailabilityMetric({ apiName: 'apiName', sloWindow: Windows.twoPercentLong })
  const typedMetric = expression.usingMetrics.gatewayRequests as Metric
  expect(typedMetric.metricName).toEqual('Count')
})

test('ApiAvailabilityMetric uses 5xx errors', () => {
  const expression = new ApiAvailabilityMetric({ apiName: 'apiName', sloWindow: Windows.twoPercentLong })
  const typedMetric = expression.usingMetrics.gatewayErrors as Metric
  expect(typedMetric.metricName).toEqual('5XXError')
})

test('ApiAvailabilityMetric uses fraction of successful requests as the expression', () => {
  const expression = new ApiAvailabilityMetric({ apiName: 'apiName', sloWindow: Windows.twoPercentLong })
  expect(expression.expression).toEqual('(gatewayRequests - gatewayErrors)/gatewayRequests')
})

test('ApiAvailabilityMetric uses the api name for dimensions in all metrics', () => {
  const expression = new ApiAvailabilityMetric({ apiName: 'apiName', sloWindow: Windows.twoPercentLong })
  Object.keys(expression.usingMetrics).forEach(metric => {
    const typedMetric = expression.usingMetrics[metric] as Metric
    expect(typedMetric.dimensions).toEqual({ ApiName: 'apiName' })
  })
})

test('ApiAvailabilityMetric uses the alert window size for the period in all metrics', () => {
  const expression = new ApiAvailabilityMetric({ apiName: 'apiName', sloWindow: Windows.twoPercentLong })
  Object.keys(expression.usingMetrics).forEach(metric => {
    const typedMetric = expression.usingMetrics[metric] as Metric
    expect(typedMetric.period).toEqual(Duration.hours(1))
  })
})
