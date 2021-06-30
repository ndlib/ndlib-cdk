import { Dashboard, DashboardProps, GraphWidget } from '@aws-cdk/aws-cloudwatch'
import * as cdk from '@aws-cdk/core'
import { ApiAvailabilityWidget } from './api-availability-widget'
import { ApiLatencyWidget } from './api-latency-widget'
import { AppSyncAvailabilityWidget } from './appsync-availability-widget'
import { AppSyncLatencyWidget } from './appsync-latency-widget'
import { CloudfrontAvailabilityWidget } from './cloudfront-availability-widget'
import { CloudfrontLatencyWidget } from './cloudfront-latency-widget'
import { CustomAvailabilityWidget } from './custom-availability-widget'
import { CustomLatencyWidget } from './custom-latency-widget'
import { ElasticSearchAvailabilityWidget } from './elasticsearch-availability-widget'
import { ElasticSearchLatencyWidget } from './elasticsearch-latency-widget'
import {
  AnySLO,
  ApiAvailabilitySLO,
  ApiLatencySLO,
  AppSyncAvailabilitySLO,
  AppSyncLatencySLO,
  CloudfrontAvailabilitySLO,
  CloudfrontLatencySLO,
  CustomAvailabilitySLO,
  CustomLatencySLO,
  ElasticSearchAvailabilitySLO,
  ElasticSearchLatencySLO,
  IAlertConfig,
} from './types'

import { Windows } from './windows'

export interface ISLOAlarmsDashboardProps extends DashboardProps {
  /**
   * Array of slos to create widgets for. All items must match the properties defined
   * by one of the types in AnySLO
   */
  readonly slos: AnySLO[]
}

/**
 * Creates dashboard of multiwindow alarms from a list of slo objects.
 */
export class SLOAlarmsDashboard extends Dashboard {
  // Creates an array of ApiAvailabilityWidgets for each window we are using
  public static apiAvailabilityAlarmsRow = (
    windows: IAlertConfig[],
    slo: ApiAvailabilitySLO,
  ): ApiAvailabilityWidget[] => {
    return windows.map(
      sloWindow =>
        new ApiAvailabilityWidget({
          ...slo,
          sloWindow,
          showBurnRateThreshold: true,
          addPeriodToTitle: true,
        }),
    )
  }

  // Creates an array of ApiLatencyWidgets for each window we are using
  public static apiLatencyAlarmsRow = (
    windows: IAlertConfig[],
    slo: ApiLatencySLO,
  ): ApiLatencyWidget[] => {
    return windows.map(
      sloWindow =>
        new ApiLatencyWidget({
          ...slo,
          sloWindow,
          showBurnRateThreshold: true,
          addPeriodToTitle: true,
        }),
    )
  }

  // Creates an array of AppSyncAvailabilityWidgets for each window we are using
  public static appSyncAvailabilityAlarmsRow = (
    windows: IAlertConfig[],
    slo: AppSyncAvailabilitySLO,
  ): AppSyncAvailabilityWidget[] => {
    return windows.map(
      sloWindow =>
        new AppSyncAvailabilityWidget({
          ...slo,
          sloWindow,
          showBurnRateThreshold: true,
          addPeriodToTitle: true,
        }),
    )
  }

  // Creates an array of AppSyncLatencyWidgets for each window we are using
  public static appSyncLatencyAlarmsRow = (
    windows: IAlertConfig[],
    slo: AppSyncLatencySLO,
  ): AppSyncLatencyWidget[] => {
    return windows.map(
      sloWindow =>
        new AppSyncLatencyWidget({
          ...slo,
          sloWindow,
          showBurnRateThreshold: true,
          addPeriodToTitle: true,
        }),
    )
  }

  // Creates an array of CloudfrontAvailabilityWidgets for each window we are using
  public static cloudfrontAvailabilityAlarmsRow = (
    windows: IAlertConfig[],
    slo: CloudfrontAvailabilitySLO,
  ): CloudfrontAvailabilityWidget[] => {
    return windows.map(
      sloWindow =>
        new CloudfrontAvailabilityWidget({
          ...slo,
          sloWindow,
          showBurnRateThreshold: true,
          addPeriodToTitle: true,
        }),
    )
  }

  // Creates an array of CloudfrontLatencyWidgets for each window we are using
  public static cloudfrontLatencyAlarmsRow = (
    windows: IAlertConfig[],
    slo: CloudfrontLatencySLO,
  ): CloudfrontLatencyWidget[] => {
    return windows.map(
      sloWindow =>
        new CloudfrontLatencyWidget({
          ...slo,
          sloWindow,
          showBurnRateThreshold: true,
          addPeriodToTitle: true,
        }),
    )
  }

  // Creates an array of CustomAvailabilityWidgets for each window we are using
  public static customAvailabilityAlarmsRow = (
    windows: IAlertConfig[],
    slo: CustomAvailabilitySLO,
  ): CustomAvailabilityWidget[] => {
    return windows.map(
      sloWindow =>
        new CustomAvailabilityWidget({
          ...slo,
          sloWindow,
          showBurnRateThreshold: true,
          addPeriodToTitle: true,
        }),
    )
  }

  // Creates an array of ApiLatencyWidgets for each window we are using
  public static customLatencyAlarmsRow = (
    windows: IAlertConfig[],
    slo: CustomLatencySLO,
  ): CustomLatencyWidget[] => {
    return windows.map(
      sloWindow =>
        new CustomLatencyWidget({
          ...slo,
          sloWindow,
          showBurnRateThreshold: true,
          addPeriodToTitle: true,
        }),
    )
  }
  // Creates an array of ElasticSearchAvailabilityWidgets for each window we are using
  public static elasticSearchAvailabilityAlarmsRow = (
    windows: IAlertConfig[],
    slo: ElasticSearchAvailabilitySLO,
  ): ElasticSearchAvailabilityWidget[] => {
    return windows.map(
      sloWindow =>
        new ElasticSearchAvailabilityWidget({
          ...slo,
          sloWindow,
          showBurnRateThreshold: true,
          addPeriodToTitle: true,
        }),
    )
  }

  // Creates an array of ElasticSearchLatencyWidgets for each window we are using
  public static elasticSearchLatencyAlarmsRow = (
    windows: IAlertConfig[],
    slo: ElasticSearchLatencySLO,
  ): ElasticSearchLatencyWidget[] => {
    return windows.map(
      sloWindow =>
        new ElasticSearchLatencyWidget({
          ...slo,
          sloWindow,
          showBurnRateThreshold: true,
          addPeriodToTitle: true,
        }),
    )
  }

  constructor(scope: cdk.Construct, id: string, props: ISLOAlarmsDashboardProps) {
    const widgets = props.slos.reduce((result: GraphWidget[][], slo) => {
      // Use standard alarm windows, plus the thirty day window, since the purpose of this dash is to see
      // how well the alarms are predicting when the 30 day window will be exceeded
      const windows = [...Windows.standardAlarmWindows, Windows.thirtyDays]
      switch (slo.type) {
        case 'ApiAvailability':
          result.push(SLOAlarmsDashboard.apiAvailabilityAlarmsRow(windows, slo as ApiAvailabilitySLO))
          break
        case 'ApiLatency':
          result.push(SLOAlarmsDashboard.apiLatencyAlarmsRow(windows, slo as ApiLatencySLO))
          break
        case 'AppSyncAvailability':
          result.push(SLOAlarmsDashboard.appSyncAvailabilityAlarmsRow(windows, slo as AppSyncAvailabilitySLO))
          break
        case 'AppSyncLatency':
          result.push(SLOAlarmsDashboard.appSyncLatencyAlarmsRow(windows, slo as AppSyncLatencySLO))
          break
        case 'CloudfrontAvailability':
          result.push(SLOAlarmsDashboard.cloudfrontAvailabilityAlarmsRow(windows, slo as CloudfrontAvailabilitySLO))
          break
        case 'CloudfrontLatency':
          result.push(SLOAlarmsDashboard.cloudfrontLatencyAlarmsRow(windows, slo as CloudfrontLatencySLO))
          break
        case 'CustomAvailability':
          result.push(SLOAlarmsDashboard.customAvailabilityAlarmsRow(windows, slo as CustomAvailabilitySLO))
          break
        case 'CustomLatency':
          result.push(SLOAlarmsDashboard.customLatencyAlarmsRow(windows, slo as CustomLatencySLO))
          break
        case 'ElasticSearchAvailability':
          result.push(
            SLOAlarmsDashboard.elasticSearchAvailabilityAlarmsRow(windows, slo as ElasticSearchAvailabilitySLO),
          )
          break
        case 'ElasticSearchLatency':
          result.push(SLOAlarmsDashboard.elasticSearchLatencyAlarmsRow(windows, slo as ElasticSearchLatencySLO))
          break
        default:
          throw new Error(`AlarmsDashboard creation encountered an unknown type for slo: ${JSON.stringify(slo)}.`)
      }
      return result
    }, [])

    const defaultProps = {
      widgets,
      start: '-P360D',
    }

    super(scope, id, { ...defaultProps, ...props })
  }
}
