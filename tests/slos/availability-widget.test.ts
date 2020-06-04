import { AvailabilityWidget } from '../../src/slos/availability-widget';
import { Windows } from '../../src/slos/windows';
import { Metric } from '@aws-cdk/aws-cloudwatch';
import { Duration } from '@aws-cdk/core';

test('AvailabilityWidget adds horizontal annotation for the SLO threshold', () => {
  const availability = new Metric({
    namespace: 'namespace',
    metricName: 'metricName',
    statistic: 'p99.9',
    label: 'label',
    period: Duration.hours(1),
  });
  const widget = new AvailabilityWidget({
    title: 'title',
    availability,
    sloThreshold: 0.99,
    sloWindow: Windows.twoPercentLong,
  });
  expect(widget.toJson()[0].properties.annotations).toEqual({
    horizontal: [
      {
        color: '#d62728',
        fill: 'below',
        label: 'SLO',
        value: 0.99,
        yAxis: 'left',
      },
    ],
  });
});

test('AvailabilityWidget by default scales the Y axis based on the order of magnitude of the SLO threshold', () => {
  const expectations = [
    { sloThreshold: 0.9999999, min: 0.9999995 },
    { sloThreshold: 0.999999, min: 0.999995 },
    { sloThreshold: 0.99999, min: 0.99995 },
    { sloThreshold: 0.9999, min: 0.9995 },
    { sloThreshold: 0.999, min: 0.995 },
    { sloThreshold: 0.99, min: 0.95 },
    { sloThreshold: 0.9, min: 0.5 },
  ];
  expectations.forEach(expectation => {
    const availability = new Metric({
      namespace: 'namespace',
      metricName: 'metricName',
      statistic: 'p99.9',
      label: 'label',
      period: Duration.hours(1),
    });
    const widget = new AvailabilityWidget({
      title: 'title',
      availability,
      sloThreshold: expectation.sloThreshold,
      sloWindow: Windows.twoPercentLong,
    });
    const leftBounds = widget.toJson()[0].properties.yAxis.left;
    const minFixed = +leftBounds.min.toFixed(expectation.min.toString().length);
    expect(minFixed).toEqual(expectation.min);
    expect(leftBounds.max).toEqual(1);
  });
});

test('When showing the burn rate threshold, AvailabilityWidget scales the Y axis based on this instead of the SLO threshold', () => {
  const expectations = [
    { sloThreshold: 0.999, min: 0.98272 },
    { sloThreshold: 0.99, min: 0.8272 },
    { sloThreshold: 0.9, min: -0.2 },
  ];
  expectations.forEach(expectation => {
    const availability = new Metric({
      namespace: 'namespace',
      metricName: 'metricName',
      statistic: 'p99.9',
      label: 'label',
      period: Duration.hours(1),
    });
    const widget = new AvailabilityWidget({
      title: 'title',
      availability,
      sloThreshold: expectation.sloThreshold,
      sloWindow: Windows.twoPercentLong,
      showBurnRateThreshold: true,
    });
    const leftBounds = widget.toJson()[0].properties.yAxis.left;
    const minFixed = +leftBounds.min.toFixed(expectation.min.toString().length);
    expect(minFixed).toEqual(expectation.min);
    expect(leftBounds.max).toEqual(1);
  });
});

test('When showing the burn rate threshold, AvailabilityWidget adds horizontal annotations for both the SLO and burn rate thresholds', () => {
  const availability = new Metric({
    namespace: 'namespace',
    metricName: 'metricName',
    statistic: 'p99.9',
    label: 'label',
    period: Duration.hours(1),
  });
  const widget = new AvailabilityWidget({
    title: 'title',
    availability,
    sloThreshold: 0.99,
    sloWindow: Windows.twoPercentLong,
    showBurnRateThreshold: true,
  });
  expect(widget.toJson()[0].properties.annotations).toEqual({
    horizontal: [
      {
        color: '#d62728',
        fill: 'below',
        label: '2% of Budget in 60 minutes',
        value: 0.856,
        yAxis: 'left',
      },
      {
        color: '#ff7f0e',
        fill: 'none',
        label: 'SLO',
        value: 0.99,
        yAxis: 'left',
      },
    ],
  });
});

test('LatencyWidget adds alert window to title', () => {
  const availability = new Metric({
    namespace: 'namespace',
    metricName: 'metricName',
    statistic: 'p99.9',
    label: 'label',
    period: Duration.hours(1),
  });
  const widget = new AvailabilityWidget({
    title: 'title',
    availability,
    sloThreshold: 0.99,
    sloWindow: Windows.twoPercentLong,
    addPeriodToTitle: true,
  });
  expect(widget.toJson()[0].properties.title).toEqual('title - 60 minutes');
});
