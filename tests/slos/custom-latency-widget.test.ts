import { CustomLatencyWidget } from '../../src/slos/custom-latency-widget';
import { CustomLatencyMetric } from '../../src/slos/custom-latency-metric';
import { LatencyWidget } from '../../src/slos/latency-widget';
import { Windows } from '../../src/slos/windows';
import { mocked } from 'ts-jest/dist/util/testing';

const mockInstance = { foo: 'bar' };

jest.mock('../../src/slos/custom-latency-metric', () => {
  return {
    CustomLatencyMetric: jest.fn().mockImplementation(() => {
      return mockInstance;
    }),
  };
});
jest.mock('../../src/slos/latency-widget');

describe('CustomLatencyWidget', () => {
  const MockedCustomLatencyMetric = mocked(CustomLatencyMetric, true);
  const MockedLatencyWidget = mocked(LatencyWidget, true);

  beforeEach(() => {
    MockedCustomLatencyMetric.mockClear();
    MockedLatencyWidget.mockClear();
  });

  it('uses the CustomLatencyMetric class as its latency metric when constructing an LatencyWidget', () => {
    new CustomLatencyWidget({
      namespace: 'namespace',
      latencyMetricName: 'latencyMetricName',
      sloThreshold: 0.99,
      latencyThreshold: 200,
      sloWindow: Windows.twoPercentLong,
    });
    expect(MockedLatencyWidget).toHaveBeenCalledWith(expect.objectContaining({ latency: mockInstance }));
  });
});
