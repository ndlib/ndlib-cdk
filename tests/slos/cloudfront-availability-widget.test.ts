import { CloudfrontAvailabilityWidget } from '../../src/slos/cloudfront-availability-widget';
import { CloudfrontAvailabilityMetric } from '../../src/slos/cloudfront-availability-metric';
import { AvailabilityWidget } from '../../src/slos/availability-widget';
import { Windows } from '../../src/slos/windows';
import { mocked } from 'ts-jest/dist/util/testing';

const mockInstance = { foo: 'bar' };

jest.mock('../../src/slos/cloudfront-availability-metric', () => {
  return {
    CloudfrontAvailabilityMetric: jest.fn().mockImplementation(() => {
      return mockInstance;
    }),
  };
});
jest.mock('../../src/slos/availability-widget');

describe('CloudfrontAvailabilityWidget', () => {
  const MockedCloudfrontAvailabilityMetric = mocked(CloudfrontAvailabilityMetric, true);
  const MockedAvailabilityWidget = mocked(AvailabilityWidget, true);

  beforeEach(() => {
    MockedCloudfrontAvailabilityMetric.mockClear();
    MockedAvailabilityWidget.mockClear();
  });

  it('uses the CloudfrontAvailabilityMetric class as its availability metric when constructing an AvailabilityWidget', () => {
    new CloudfrontAvailabilityWidget({
      distributionId: 'distributionId',
      sloThreshold: 0.99,
      sloWindow: Windows.twoPercentLong,
    });
    expect(MockedAvailabilityWidget).toHaveBeenCalledWith(expect.objectContaining({ availability: mockInstance }));
  });
});
