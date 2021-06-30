import { Windows } from '../../src/slos/windows'
import { Duration } from '@aws-cdk/core'

describe('Windows', () => {
  const expectations = [
    {
      window: Windows.twoPercentShort,
      burnRate: 14.4,
      percent: 2,
      alertWindow: Duration.minutes(5),
      description: '2.00% of 30 days budget burned in 5 minutes',
    },
    {
      window: Windows.twoPercentLong,
      burnRate: 14.4,
      percent: 2,
      alertWindow: Duration.hours(1),
      description: '2.00% of 30 days budget burned in 60 minutes',
    },
    {
      window: Windows.twoPercentExtraLong,
      burnRate: 7.2,
      percent: 2,
      alertWindow: Duration.hours(2),
      description: '2.00% of 30 days budget burned in 1 hour 60 minutes',
    },
    {
      window: Windows.fivePercentShort,
      burnRate: 6,
      percent: 5,
      alertWindow: Duration.minutes(30),
      description: '5.00% of 30 days budget burned in 30 minutes',
    },
    {
      window: Windows.fivePercentLong,
      burnRate: 6,
      percent: 5,
      alertWindow: Duration.hours(6),
      description: '5.00% of 30 days budget burned in 6 hours',
    },
    {
      window: Windows.fivePercentExtraLong,
      burnRate: 3,
      percent: 5,
      alertWindow: Duration.hours(12),
      description: '5.00% of 30 days budget burned in 12 hours',
    },
    {
      window: Windows.oneDaySensitive,
      burnRate: 1,
      percent: 10 / 3,
      alertWindow: Duration.days(1),
      description: '3.33% of 30 days budget burned in 1 day',
    },
    {
      window: Windows.tenPercentShort,
      burnRate: 1,
      percent: 10,
      alertWindow: Duration.hours(6),
      description: '10.00% of 30 days budget burned in 6 hours',
    },
    {
      window: Windows.tenPercentLong,
      burnRate: 1,
      percent: 10,
      alertWindow: Duration.days(3),
      description: '10.00% of 30 days budget burned in 3 days',
    },
    {
      window: Windows.thirtyDays,
      burnRate: 1,
      percent: 100,
      alertWindow: Duration.days(30),
      description: '100.00% of 30 days budget burned in 30 days',
    },
  ]

  expectations.forEach(windowExpectation => {
    it(`${windowExpectation.description} returns a burnRate of ${windowExpectation.burnRate}`, () => {
      expect(windowExpectation.window.burnRateThreshold).toEqual(windowExpectation.burnRate)
    })
  })

  expectations.forEach(windowExpectation => {
    it(`${
      windowExpectation.description
    } returns a alertWindow of ${windowExpectation.alertWindow.toHumanString()}`, () => {
      expect(windowExpectation.window.alertWindow).toEqual(windowExpectation.alertWindow)
    })
  })

  expectations.forEach(windowExpectation => {
    it(`${windowExpectation.description} returns a percent of ${windowExpectation.percent}`, () => {
      expect(windowExpectation.window.percent).toEqual(windowExpectation.percent)
    })
  })

  expectations.forEach(windowExpectation => {
    it(`${windowExpectation.description} returns a description of ${windowExpectation.description}`, () => {
      expect(windowExpectation.window.description).toEqual(windowExpectation.description)
    })
  })

  expectations.forEach(windowExpectation => {
    it(`${windowExpectation.description} uses a period of 30 days`, () => {
      expect(windowExpectation.window.period).toEqual(Duration.days(30))
    })
  })

  it('alarmWindowSelector returns appropriate windows based on slo threshold', () => {
    const alarmSelectorExpectations = [
      { slo: 0.9999999, windows: [Windows.twoPercentLong, Windows.fivePercentLong, Windows.tenPercentMedium] },
      {
        slo: 0.93055555555,
        windows: [Windows.twoPercentExtraLong, Windows.fivePercentExtraLong, Windows.tenPercentShort],
      },
      { slo: 0.86111111111, windows: [Windows.oneDaySensitive] },
    ]
    alarmSelectorExpectations.forEach(expectation => {
      expect(Windows.alarmWindowSelector(expectation.slo)).toEqual(expectation.windows)
    })
  })

  it('dashWindowSelector returns appropriate windows based on slo threshold', () => {
    const alarmSelectorExpectations = [
      {
        slo: 0.9999999,
        windows: [Windows.twoPercentLong, Windows.fivePercentLong, Windows.tenPercentLong],
      },
      {
        slo: 0.93055555555,
        windows: [Windows.twoPercentExtraLong, Windows.fivePercentExtraLong, Windows.tenPercentLong],
      },
      { slo: 0.86111111111, windows: [Windows.oneDaySensitive, Windows.tenPercentLong] },
    ]
    alarmSelectorExpectations.forEach(expectation => {
      expect(Windows.dashWindowSelector(expectation.slo)).toEqual(expectation.windows)
    })
  })

  it('allows creating custom configs', () => {
    const customConfig = Windows.custom(2, Duration.days(30), Duration.hours(1))
    expect(customConfig.burnRateThreshold).toEqual(14.4)
    expect(customConfig.description).toEqual('2.00% of 30 days budget burned in 60 minutes')
  })
})
