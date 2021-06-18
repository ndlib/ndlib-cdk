import { AppSyncLatencyWidget } from '../../src/slos/appsync-latency-widget';
import { AppSyncLatencyMetric } from '../../src/slos/appsync-latency-metric';
import { LatencyWidget } from '../../src/slos/latency-widget';
import { Windows } from '../../src/slos/windows';
import { mocked } from 'ts-jest/dist/util/testing';

const mockInstance = { foo: 'bar' };

jest.mock('../../src/slos/appsync-latency-metric', () => {
  return {
    AppSyncLatencyMetric: jest.fn().mockImplementation(() => {
      return mockInstance;
    }),
  };
});
jest.mock('../../src/slos/latency-widget');

describe('AppSyncLatencyWidget', () => {
  const MockedAppSyncLatencyMetric = mocked(AppSyncLatencyMetric, true);
  const MockedLatencyWidget = mocked(LatencyWidget, true);

  beforeEach(() => {
    MockedAppSyncLatencyMetric.mockClear();
    MockedLatencyWidget.mockClear();
  });

  it('uses the AppSyncLatencyMetric class as its latency metric when constructing an LatencyWidget', () => {
    new AppSyncLatencyWidget({
      apiId: 'apiId',
      sloThreshold: 0.99,
      latencyThreshold: 200,
      sloWindow: Windows.twoPercentLong,
    });
    expect(MockedLatencyWidget).toHaveBeenCalledWith(expect.objectContaining({ latency: mockInstance }));
  });
});
