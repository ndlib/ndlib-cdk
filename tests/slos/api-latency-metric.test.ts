import { ApiLatencyMetric } from '../../src/slos/api-latency-metric'
import { Windows } from '../../src/slos/windows'
import { Duration } from '@aws-cdk/core'

test('ApiLatencyMetric uses window burn rate threshold for the statistic and puts the statistic in its label', () => {
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
  ]
  expectations.forEach(expectation => {
    expectation.windows.forEach(window => {
      const metric = new ApiLatencyMetric({
        apiName: 'apiName',
        sloThreshold: expectation.sloThreshold,
        sloWindow: window.window,
      })
      expect(metric.statistic).toEqual(window.expectedStatistic)
      expect(metric.label).toEqual(`Latency ${window.expectedStatistic}`)
    })
  })
})

test('ApiLatencyMetric uses the AWS/ApiGateway namespace', () => {
  const metric = new ApiLatencyMetric({ apiName: 'apiName', sloThreshold: 0.999, sloWindow: Windows.twoPercentLong })
  expect(metric.namespace).toEqual('AWS/ApiGateway')
})

// https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-metrics-and-dimensions.html
test('ApiLatencyMetric uses total latency of the client request', () => {
  const metric = new ApiLatencyMetric({ apiName: 'apiName', sloThreshold: 0.999, sloWindow: Windows.twoPercentLong })
  expect(metric.metricName).toEqual('Latency')
})

test('ApiLatencyMetric uses the api name for dimensions', () => {
  const metric = new ApiLatencyMetric({ apiName: 'apiName', sloThreshold: 0.999, sloWindow: Windows.twoPercentLong })
  expect(metric.dimensions).toEqual({ ApiName: 'apiName' })
})

test('ApiLatencyMetric uses the alert window size for the period', () => {
  const metric = new ApiLatencyMetric({ apiName: 'apiName', sloThreshold: 0.999, sloWindow: Windows.twoPercentLong })
  expect(metric.period).toEqual(Duration.hours(1))
})

test('ApiLatencyMetric uses p0 for the statistic when too small a window is used for the threshold', () => {
  const metric = new ApiLatencyMetric({ apiName: 'apiName', sloThreshold: 0.5, sloWindow: Windows.twoPercentLong })
  expect(metric.statistic).toEqual('p0.00')
})
