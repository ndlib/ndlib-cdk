import { ApiLatencyWidget } from '../../src/slos/api-latency-widget'
import { ApiLatencyMetric } from '../../src/slos/api-latency-metric'
import { LatencyWidget } from '../../src/slos/latency-widget'
import { Windows } from '../../src/slos/windows'
import { mocked } from 'ts-jest/utils'

const mockInstance = { foo: 'bar' }

jest.mock('../../src/slos/api-latency-metric', () => {
  return {
    ApiLatencyMetric: jest.fn().mockImplementation(() => {
      return mockInstance
    }),
  }
})
jest.mock('../../src/slos/latency-widget')

describe('ApiLatencyWidget', () => {
  const MockedApiLatencyMetric = mocked(ApiLatencyMetric, true)
  const MockedLatencyWidget = mocked(LatencyWidget, true)

  beforeEach(() => {
    MockedApiLatencyMetric.mockClear()
    MockedLatencyWidget.mockClear()
  })

  it('uses the ApiLatencyMetric class as its latency metric when constructing an LatencyWidget', () => {
    new ApiLatencyWidget({
      apiName: 'apiName',
      sloThreshold: 0.99,
      latencyThreshold: 200,
      sloWindow: Windows.twoPercentLong,
    })
    expect(MockedLatencyWidget).toHaveBeenCalledWith(expect.objectContaining({ latency: mockInstance }))
  })
})
