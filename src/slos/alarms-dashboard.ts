import { Dashboard, DashboardProps } from '@aws-cdk/aws-cloudwatch';
import * as cdk from '@aws-cdk/core';
import { ApiAvailabilityWidget } from './api-availability-widget';
import { ApiLatencyWidget } from './api-latency-widget';
import { CloudfrontAvailabilityWidget } from './cloudfront-availability-widget';
import { CloudfrontLatencyWidget } from './cloudfront-latency-widget';
import {
  AnySLO,
  ApiAvailabilitySLO,
  ApiLatencySLO,
  CloudfrontAvailabilitySLO,
  CloudfrontLatencySLO,
  IAlertConfig,
} from './types';
import { Windows } from './windows';

export interface ISLOAlarmsDashboardProps extends DashboardProps {
  /**
   * Array of slos to create widgets for. All items must match the properties defined
   * by one of the types in AnySLO
   */
  readonly slos: AnySLO[];
}

/**
 * Creates dashboard of multiwindow alarms from a list of slo objects.
 */
export class SLOAlarmsDashboard extends Dashboard {
  // Creates an array of ApiAvailabilityWidgets for each window we are using
  public static apiAvailabilityAlarmsRow = (windows: IAlertConfig[], slo: ApiAvailabilitySLO) => {
    return windows.map(
      sloWindow =>
        new ApiAvailabilityWidget({
          ...slo,
          sloWindow,
          showBurnRateThreshold: true,
          addPeriodToTitle: true,
        }),
    );
  };

  // Creates an array of ApiLatencyWidgets for each window we are using
  public static apiLatencyAlarmsRow = (windows: IAlertConfig[], slo: ApiLatencySLO) => {
    return windows.map(
      sloWindow =>
        new ApiLatencyWidget({
          ...slo,
          sloWindow,
          showBurnRateThreshold: true,
          addPeriodToTitle: true,
        }),
    );
  };

  // Creates an array of CloudfrontAvailabilityWidgets for each window we are using
  public static cloudfrontAvailabilityAlarmsRow = (windows: IAlertConfig[], slo: CloudfrontAvailabilitySLO) => {
    return windows.map(
      sloWindow =>
        new CloudfrontAvailabilityWidget({
          ...slo,
          sloWindow,
          showBurnRateThreshold: true,
          addPeriodToTitle: true,
        }),
    );
  };

  // Creates an array of CloudfrontLatencyWidgets for each window we are using
  public static cloudfrontLatencyAlarmsRow = (windows: IAlertConfig[], slo: CloudfrontLatencySLO) => {
    return windows.map(
      sloWindow =>
        new CloudfrontLatencyWidget({
          ...slo,
          sloWindow,
          showBurnRateThreshold: true,
          addPeriodToTitle: true,
        }),
    );
  };

  constructor(scope: cdk.Construct, id: string, props: ISLOAlarmsDashboardProps) {
    const widgets = props.slos.reduce((result, slo) => {
      // Use standard alarm windows, plus the thirty day window, since the purpose of this dash is to see
      // how well the alarms are predicting when the 30 day window will be exceeded
      const windows = [...Windows.standardAlarmWindows, Windows.thirtyDays];
      switch (slo.type) {
        case 'ApiAvailability':
          result.push(SLOAlarmsDashboard.apiAvailabilityAlarmsRow(windows, slo as ApiAvailabilitySLO));
          break;
        case 'ApiLatency':
          result.push(SLOAlarmsDashboard.apiLatencyAlarmsRow(windows, slo as ApiLatencySLO));
          break;
        case 'CloudfrontAvailability':
          result.push(SLOAlarmsDashboard.cloudfrontAvailabilityAlarmsRow(windows, slo as CloudfrontAvailabilitySLO));
          break;
        case 'CloudfrontLatency':
          result.push(SLOAlarmsDashboard.cloudfrontLatencyAlarmsRow(windows, slo as CloudfrontLatencySLO));
          break;
        default:
          throw new Error(`AlarmsDashboard creation encountered an unknown type for slo: ${JSON.stringify(slo)}.`);
      }
      return result;
    }, [] as any);

    const defaultProps = {
      widgets,
      start: '-P360D',
    };

    super(scope, id, { ...defaultProps, ...props });
  }
}
