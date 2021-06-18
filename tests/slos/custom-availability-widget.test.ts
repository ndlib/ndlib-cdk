import { CustomAvailabilityWidget } from '../../src/slos/custom-availability-widget';
import { CustomAvailabilityMetric } from '../../src/slos/custom-availability-metric';
import { AvailabilityWidget } from '../../src/slos/availability-widget';
import { Windows } from '../../src/slos/windows';
import { mocked } from 'ts-jest/utils';

const mockInstance = { foo: 'bar' };

jest.mock('../../src/slos/custom-availability-metric', () => {
  return {
    CustomAvailabilityMetric: jest.fn().mockImplementation(() => {
      return mockInstance;
    }),
  };
});
jest.mock('../../src/slos/availability-widget');

describe('CustomAvailabilityWidget', () => {
  const MockedCustomAvailabilityMetric = mocked(CustomAvailabilityMetric, true);
  const MockedAvailabilityWidget = mocked(AvailabilityWidget, true);

  beforeEach(() => {
    MockedCustomAvailabilityMetric.mockClear();
    MockedAvailabilityWidget.mockClear();
  });

  it('uses the CustomAvailabilityMetric class as its availability metric when constructing an AvailabilityWidget', () => {
    new CustomAvailabilityWidget({
      namespace: 'namespace',
      errorsMetricName: 'errorsMetricName',
      countsMetricName: 'countsMetricName',
      sloThreshold: 0.99,
      sloWindow: Windows.twoPercentLong,
    });
    expect(MockedAvailabilityWidget).toHaveBeenCalledWith(expect.objectContaining({ availability: mockInstance }));
  });
});
