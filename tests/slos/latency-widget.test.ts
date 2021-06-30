import { LatencyWidget } from '../../src/slos/latency-widget'
import { Windows } from '../../src/slos/windows'
import { Metric } from '@aws-cdk/aws-cloudwatch'
import { Duration } from '@aws-cdk/core'

test('LatencyWidget adds horizontal annotation for the latency threshold', () => {
  const latency = new Metric({
    namespace: 'namespace',
    metricName: 'metricName',
    statistic: 'p99.9',
    label: 'label',
    period: Duration.hours(1),
  })
  const widget = new LatencyWidget({
    title: 'title',
    latencyThreshold: 100,
    latency,
    sloThreshold: 0.99,
    sloWindow: Windows.twoPercentLong,
  })
  expect(widget.toJson()[0].properties.annotations).toEqual({
    horizontal: [
      {
        color: '#d62728',
        fill: 'above',
        label: 'SLO',
        value: 100,
        yAxis: 'left',
      },
    ],
  })
})

test('LatencyWidget scales the Y axis based on latency threshold', () => {
  const latency = new Metric({
    namespace: 'namespace',
    metricName: 'metricName',
    statistic: 'p99.9',
    label: 'label',
    period: Duration.hours(1),
  })
  const widget = new LatencyWidget({
    title: 'title',
    latencyThreshold: 100,
    latency,
    sloThreshold: 0.99,
    sloWindow: Windows.twoPercentLong,
  })
  expect(widget.toJson()[0].properties.yAxis).toEqual({
    left: {
      max: 140,
      min: 0,
    },
  })
})

test('LatencyWidget adds alert window to title', () => {
  const latency = new Metric({
    namespace: 'namespace',
    metricName: 'metricName',
    statistic: 'p99.9',
    label: 'label',
    period: Duration.hours(1),
  })
  const widget = new LatencyWidget({
    title: 'title',
    latencyThreshold: 100,
    latency,
    sloThreshold: 0.99,
    sloWindow: Windows.twoPercentLong,
    addPeriodToTitle: true,
  })
  expect(widget.toJson()[0].properties.title).toEqual('title - 60 minutes')
})
