import { ApiAvailabilityWidget } from '../../src/slos/api-availability-widget'
import { ApiAvailabilityMetric } from '../../src/slos/api-availability-metric'
import { AvailabilityWidget } from '../../src/slos/availability-widget'
import { Windows } from '../../src/slos/windows'
import { mocked } from 'ts-jest/utils'

const mockInstance = { foo: 'bar' }

jest.mock('../../src/slos/api-availability-metric', () => {
  return {
    ApiAvailabilityMetric: jest.fn().mockImplementation(() => {
      return mockInstance
    }),
  }
})
jest.mock('../../src/slos/availability-widget')

describe('ApiAvailabilityWidget', () => {
  const MockedApiAvailabilityMetric = mocked(ApiAvailabilityMetric, true)
  const MockedAvailabilityWidget = mocked(AvailabilityWidget, true)

  beforeEach(() => {
    MockedApiAvailabilityMetric.mockClear()
    MockedAvailabilityWidget.mockClear()
  })

  it('uses the ApiAvailabilityMetric class as its availability metric when constructing an AvailabilityWidget', () => {
    new ApiAvailabilityWidget({
      apiName: 'apiName',
      sloThreshold: 0.99,
      sloWindow: Windows.twoPercentLong,
    })
    expect(MockedAvailabilityWidget).toHaveBeenCalledWith(expect.objectContaining({ availability: mockInstance }))
  })
})
