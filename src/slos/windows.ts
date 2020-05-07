import { Duration } from '@aws-cdk/core';
import { IAlertConfig } from './types';

/**
 * Encapsulates the properties of SLO alerting windows and provides a set of presets
 * that we'll commonly use.
 */
export class Windows {
  /**
   * 2% of 30 Day window in 5 minutes
   */
  public static readonly twoPercentShort: IAlertConfig = {
    percent: 2,
    period: Duration.days(30),
    alertWindow: Duration.minutes(5),
    get burnRateThreshold(): number {
      return Windows.burnRate(Windows.twoPercentLong);
    },
    get description(): string {
      return Windows.description(this);
    },
  };

  /**
   * 2% of 30 Day window in 1 hour
   */
  public static readonly twoPercentLong: IAlertConfig = {
    percent: 2,
    period: Duration.days(30),
    alertWindow: Duration.hours(1),
    get burnRateThreshold(): number {
      return Windows.burnRate(this);
    },
    get description(): string {
      return Windows.description(this);
    },
  };

  /**
   * Experimental!
   * 2% of 30 Day window in 2 hours
   */
  public static readonly twoPercentExtraLong: IAlertConfig = {
    percent: 2,
    period: Duration.days(30),
    alertWindow: Duration.hours(2),
    get burnRateThreshold(): number {
      return Windows.burnRate(this);
    },
    get description(): string {
      return Windows.description(this);
    },
  };

  /**
   * 5% of 30 Day window in 30 minutes
   */
  public static readonly fivePercentShort: IAlertConfig = {
    percent: 5,
    period: Duration.days(30),
    alertWindow: Duration.minutes(30),
    get burnRateThreshold(): number {
      return Windows.burnRate(Windows.fivePercentLong);
    },
    get description(): string {
      return Windows.description(this);
    },
  };

  /**
   * 5% of 30 Day window in 6 hours
   */
  public static readonly fivePercentLong: IAlertConfig = {
    percent: 5,
    period: Duration.days(30),
    alertWindow: Duration.hours(6),
    get burnRateThreshold(): number {
      return Windows.burnRate(this);
    },
    get description(): string {
      return Windows.description(this);
    },
  };

  /**
   * Experimental!
   * 5% of 30 Day window in 12 hours
   */
  public static readonly fivePercentExtraLong: IAlertConfig = {
    percent: 5,
    period: Duration.days(30),
    alertWindow: Duration.hours(12),
    get burnRateThreshold(): number {
      return Windows.burnRate(this);
    },
    get description(): string {
      return Windows.description(this);
    },
  };

  /**
   * Experimental!
   * 3.3333% of 30 Day window in 1 day. Useful for low % SLOs, but should not be used if you can avoid
   * it since it will be more sensitive to false positives.
   */
  public static readonly oneDaySensitive: IAlertConfig = {
    percent: 10 / 3,
    period: Duration.days(30),
    alertWindow: Duration.days(1),
    get burnRateThreshold(): number {
      return Windows.burnRate(this);
    },
    get description(): string {
      return Windows.description(this);
    },
  };

  /**
   * 10% of 30 Day window in 1 day.
   */
  public static readonly tenPercentShort: IAlertConfig = {
    percent: 10,
    period: Duration.days(30),
    alertWindow: Duration.hours(6),
    get burnRateThreshold(): number {
      return Windows.burnRate(Windows.tenPercentLong);
    },
    get description(): string {
      return Windows.description(this);
    },
  };

  /**
   * 10% of 30 Day window in 1 day.
   * Note: Google recommends 3 days for 10% long window, but since
   * we cannot do a 3 day alarm for the long window, we're making
   * a 1 day period
   */
  public static readonly tenPercentMedium: IAlertConfig = {
    percent: 10,
    period: Duration.days(30),
    alertWindow: Duration.days(1),
    get burnRateThreshold(): number {
      return Windows.burnRate(Windows.tenPercentLong);
    },
    get description(): string {
      return Windows.description(this);
    },
  };

  /**
   * 10% of 30 Day window in 3 days.
   * NOTE: This one can only be used for graphing in a widget. Cloudwatch Alerts are currently limited to metrics <= 1 day
   */
  public static readonly tenPercentLong: IAlertConfig = {
    percent: 10,
    period: Duration.days(30),
    alertWindow: Duration.days(3),
    get burnRateThreshold(): number {
      return Windows.burnRate(this);
    },
    get description(): string {
      return Windows.description(this);
    },
  };

  /**
   * 100% of 30 Day window in 30 days.
   * NOTE: This one can only be used for graphing in a widget. Cloudwatch Alerts are currently limited to metrics <= 1 day
   */
  public static readonly thirtyDays: IAlertConfig = {
    percent: 100,
    period: Duration.days(30),
    alertWindow: Duration.days(30),
    get burnRateThreshold(): number {
      return Windows.burnRate(this);
    },
    get description(): string {
      return Windows.description(this);
    },
  };

  /**
   * The golden standards from Google.
   */
  public static readonly standardWindows = [Windows.twoPercentLong, Windows.fivePercentLong, Windows.tenPercentLong];

  /**
   * The multi-window golden standards from Google.
   */
  public static readonly standardMultiWindows = [
    { windows: [Windows.twoPercentShort, Windows.twoPercentLong], severity: 'High' },
    { windows: [Windows.fivePercentShort, Windows.fivePercentLong], severity: 'High' },
    { windows: [Windows.tenPercentShort, Windows.tenPercentLong], severity: 'Low' },
  ];

  /**
   * The golden standards from Google, limited to one day for AWS alarms.
   */
  public static readonly standardAlarmWindows = [
    Windows.twoPercentLong,
    Windows.fivePercentLong,
    Windows.tenPercentMedium,
  ];

  /**
   * The multi-window golden standards from Google, limited to one day for AWS alarms.
   */
  public static readonly standardAlarmMultiWindows = [
    { windows: [Windows.twoPercentShort, Windows.twoPercentLong], severity: 'High' },
    { windows: [Windows.fivePercentShort, Windows.fivePercentLong], severity: 'High' },
    { windows: [Windows.tenPercentShort, Windows.tenPercentMedium], severity: 'Low' },
  ];

  /**
   * Experimental!
   * Useful for SLOs between 90 and 93%.
   */
  public static readonly doubleWindows = [
    Windows.twoPercentExtraLong,
    Windows.fivePercentExtraLong,
    Windows.tenPercentLong,
  ];

  /**
   * Experimental!
   * Useful for SLOs between 90 and 93%, limited to one day for AWS alarms.
   */
  public static readonly doubleAlarmWindows = [
    Windows.twoPercentExtraLong,
    Windows.fivePercentExtraLong,
    Windows.tenPercentShort,
  ];

  /**
   * Experimental!
   * Useful for SLOs like 70%, 50% etc. The smallest window we can use is one day here.
   */
  public static readonly lowPercentWindows = [Windows.oneDaySensitive, Windows.tenPercentLong];

  /**
   * Experimental!
   * Useful for SLOs like 70%, 50% etc, limited to one day for AWS alarms. The smallest window we can use is one day here.
   */
  public static readonly lowPercentAlarmWindows = [Windows.oneDaySensitive];

  /**
   * Calculates a target burn rate threshold for an alert config
   */
  public static readonly burnRate = (alertConfig: IAlertConfig) =>
    ((alertConfig.period.toHours() * (alertConfig.percent / 100)) / alertConfig.alertWindow.toMinutes()) * 60;

  /**
   * Ex: "X% of Y Day budget burned in Z hours"
   */
  public static readonly description = (alertConfig: IAlertConfig) =>
    `${alertConfig.percent.toFixed(
      2,
    )}% of ${alertConfig.period.toHumanString()} budget burned in ${alertConfig.alertWindow.toHumanString()}`;

  /**
   * Allows defining a custom alert config if none of the predefined values work
   */
  public static readonly custom = (percent: number, period: Duration, alertWindow: Duration) => {
    return {
      percent,
      period,
      alertWindow,
      get burnRateThreshold(): number {
        return Windows.burnRate(this);
      },
      get description(): string {
        return Windows.description(this);
      },
    };
  };

  /**
   * Experimental!
   * Helper for selecting what windows to use for a given threshold. We can't always use the standard windows that Google defines.
   * Their windows work well for 99.x%, but not for thresholds 93% and below. This will help generate a list of windows to use
   * based on the SLO.
   */
  public static readonly alarmWindowSelector = (sloThreshold: number) => {
    // This is the lowest threshold we can use before we exceed what can be measured for 2% of 30 day budget within a 1 hour window
    const stdWindowLowerLimit = 1 - 1 / (0.02 * 30 * 24); // .930555...
    // This is the lowest threshold we can use before we exceed what can be measured for 2% of 30 day budget within a 2 hour window
    const dblWindowLowerLimit = 1 - 2 / (0.02 * 30 * 24); // .86111...
    if (sloThreshold > stdWindowLowerLimit) {
      return Windows.standardAlarmWindows;
    } else if (sloThreshold > dblWindowLowerLimit) {
      return Windows.doubleAlarmWindows;
    } else {
      return Windows.lowPercentAlarmWindows;
    }
  };

  /**
   * Helper for selecting what windows to use for a given threshold. We can't always use the standard windows that Google defines.
   * Their windows work well for 99.x%, but not for thresholds 93% and below. This will help generate a list of windows to use
   * based on the SLO.
   */
  public static readonly dashWindowSelector = (sloThreshold: number) => {
    // This is the lowest threshold we can use before we exceed what can be measured for 2% of 30 day budget within a 1 hour window
    const stdWindowLowerLimit = 1 - 1 / (0.02 * 30 * 24); // .930555...
    // This is the lowest threshold we can use before we exceed what can be measured for 2% of 30 day budget within a 2 hour window
    const dblWindowLowerLimit = 1 - 2 / (0.02 * 30 * 24); // .86111...
    if (sloThreshold > stdWindowLowerLimit) {
      return Windows.standardWindows;
    } else if (sloThreshold > dblWindowLowerLimit) {
      return Windows.doubleWindows;
    } else {
      return Windows.lowPercentWindows;
    }
  };
}
