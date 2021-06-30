import { CloudfrontLatencyWidget } from '../../src/slos/cloudfront-latency-widget'
import { CloudfrontLatencyMetric } from '../../src/slos/cloudfront-latency-metric'
import { LatencyWidget } from '../../src/slos/latency-widget'
import { Windows } from '../../src/slos/windows'
import { mocked } from 'ts-jest/utils'

const mockInstance = { foo: 'bar' }

jest.mock('../../src/slos/cloudfront-latency-metric', () => {
  return {
    CloudfrontLatencyMetric: jest.fn().mockImplementation(() => {
      return mockInstance
    }),
  }
})
jest.mock('../../src/slos/latency-widget')

describe('CloudfrontLatencyWidget', () => {
  const MockedCloudfrontLatencyMetric = mocked(CloudfrontLatencyMetric, true)
  const MockedLatencyWidget = mocked(LatencyWidget, true)

  beforeEach(() => {
    MockedCloudfrontLatencyMetric.mockClear()
    MockedLatencyWidget.mockClear()
  })

  it('uses the CloudfrontLatencyMetric class as its latency metric when constructing an LatencyWidget', () => {
    new CloudfrontLatencyWidget({
      distributionId: 'distributionId',
      sloThreshold: 0.99,
      latencyThreshold: 200,
      sloWindow: Windows.twoPercentLong,
    })
    expect(MockedLatencyWidget).toHaveBeenCalledWith(expect.objectContaining({ latency: mockInstance }))
  })
})
