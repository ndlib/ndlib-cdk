import { AppSyncAvailabilityWidget } from '../../src/slos/appsync-availability-widget'
import { AppSyncAvailabilityMetric } from '../../src/slos/appsync-availability-metric'
import { AvailabilityWidget } from '../../src/slos/availability-widget'
import { Windows } from '../../src/slos/windows'
import { mocked } from 'ts-jest/utils'

const mockInstance = { foo: 'bar' }

jest.mock('../../src/slos/appsync-availability-metric', () => {
  return {
    AppSyncAvailabilityMetric: jest.fn().mockImplementation(() => {
      return mockInstance
    }),
  }
})
jest.mock('../../src/slos/availability-widget')

describe('AppSyncAvailabilityWidget', () => {
  const MockedAppSyncAvailabilityMetric = mocked(AppSyncAvailabilityMetric, true)
  const MockedAvailabilityWidget = mocked(AvailabilityWidget, true)

  beforeEach(() => {
    MockedAppSyncAvailabilityMetric.mockClear()
    MockedAvailabilityWidget.mockClear()
  })

  it('uses AppSyncAvailabilityMetric class as its availability metric when constructing an AvailabilityWidget', () => {
    new AppSyncAvailabilityWidget({
      apiId: 'apiId',
      sloThreshold: 0.99,
      sloWindow: Windows.twoPercentLong,
    })
    expect(MockedAvailabilityWidget).toHaveBeenCalledWith(expect.objectContaining({ availability: mockInstance }))
  })
})
