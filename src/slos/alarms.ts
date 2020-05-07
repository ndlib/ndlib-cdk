import { Alarm, CfnCompositeAlarm, ComparisonOperator } from '@aws-cdk/aws-cloudwatch';
import { Topic } from '@aws-cdk/aws-sns';
import { Construct } from '@aws-cdk/core';
import { ApiAvailabilityMetric } from './api-availability-metric';
import { ApiLatencyMetric } from './api-latency-metric';
import { CloudfrontAvailabilityMetric } from './cloudfront-availability-metric';
import { CloudfrontLatencyMetric } from './cloudfront-latency-metric';
import {
  AnySLO,
  ApiAvailabilitySLO,
  ApiLatencySLO,
  CloudfrontAvailabilitySLO,
  CloudfrontLatencySLO,
  IAlertConfig,
} from './types';
import { Windows } from './windows';

export interface ISLOAlarmsProps {
  /**
   * Link to the primary dashboard to direct the responder to for troubleshooting
   */
  readonly dashboardLink: string;

  /**
   * Link to the runbook for performing troubleshooting steps
   */
  readonly runbookLink: string;

  /**
   * Optional link to a dashboard of all of the alarms
   */
  readonly alarmsDashboardLink?: string;

  /**
   * Array of slos to create alarms for. All items must match the properties defined
   * by one of the types in AnySLO
   */
  readonly slos: AnySLO[];
}

/**
 * Creates multi-window alarms using CloudWatch composite alarms from a list of slo objects.
 * Also creates an SNS topic as an action for the parent alarm.
 */
export class SLOAlarms extends Construct {
  public static apiAvailabilityAlarms = (
    windows: IAlertConfig[],
    scope: Construct,
    alarmDescription: string,
    sns: Topic,
    slo: ApiAvailabilitySLO,
  ) => {
    const parentName = `${slo.title} Availability <= ${slo.sloThreshold}`;
    const childAlarms = windows.map(sloWindow => {
      const metric = new ApiAvailabilityMetric({
        ...slo,
        sloWindow,
      });
      const alarmName = `${parentName} - ${sloWindow.description}`;
      const sloBudget = 1 - slo.sloThreshold;
      let alarmThreshold = 1 - sloWindow.burnRateThreshold * sloBudget;
      alarmThreshold = Math.max(0, Math.min(alarmThreshold, 1));
      return new Alarm(scope, alarmName, {
        metric,
        threshold: alarmThreshold,
        alarmName,
        evaluationPeriods: 1,
        datapointsToAlarm: 1,
        comparisonOperator: ComparisonOperator.LESS_THAN_OR_EQUAL_TO_THRESHOLD,
      });
    });
    const alarmRule = childAlarms.reduce(
      (previous, current) =>
        previous === '' ? `ALARM("${current.alarmName}")` : `${previous} OR ALARM("${current.alarmName}")`,
      '',
    );
    const parentAlarm = new CfnCompositeAlarm(scope, parentName, {
      alarmName: parentName,
      alarmRule,
      alarmDescription,
      alarmActions: [sns.topicArn],
    });
    return { parentAlarm, childAlarms };
  };

  public static apiLatencyAlarms = (
    windows: IAlertConfig[],
    scope: Construct,
    alarmDescription: string,
    sns: Topic,
    slo: ApiLatencySLO,
  ) => {
    const parentName = `${slo.title} Latency P${slo.sloThreshold * 100} >= ${slo.latencyThreshold}ms`;
    const childAlarms = windows.map(sloWindow => {
      const metric = new ApiLatencyMetric({
        ...slo,
        sloWindow,
      });
      const alarmName = `${parentName} - ${sloWindow.description}`;
      return new Alarm(scope, alarmName, {
        metric,
        threshold: slo.latencyThreshold,
        alarmName,
        evaluationPeriods: 1,
        datapointsToAlarm: 1,
        comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      });
    });
    const alarmRule = childAlarms.reduce(
      (previous, current) =>
        previous === '' ? `ALARM("${current.alarmName}")` : `${previous} OR ALARM("${current.alarmName}")`,
      '',
    );
    const parentAlarm = new CfnCompositeAlarm(scope, parentName, {
      alarmName: parentName,
      alarmRule,
      alarmDescription,
      alarmActions: [sns.topicArn],
    });
    return { parentAlarm, childAlarms };
  };

  public static cloudfrontAvailabilityAlarms = (
    windows: IAlertConfig[],
    scope: Construct,
    alarmDescription: string,
    sns: Topic,
    slo: CloudfrontAvailabilitySLO,
  ) => {
    const parentName = `${slo.title} Availability <= ${slo.sloThreshold}`;
    const childAlarms = windows.map(sloWindow => {
      const metric = new CloudfrontAvailabilityMetric({
        ...slo,
        sloWindow,
      });
      const alarmName = `${parentName} - ${sloWindow.description}`;
      const sloBudget = 1 - slo.sloThreshold;
      let alarmThreshold = 1 - sloWindow.burnRateThreshold * sloBudget;
      alarmThreshold = Math.max(0, Math.min(alarmThreshold, 1));
      return new Alarm(scope, alarmName, {
        metric,
        threshold: alarmThreshold,
        alarmName,
        evaluationPeriods: 1,
        datapointsToAlarm: 1,
        comparisonOperator: ComparisonOperator.LESS_THAN_OR_EQUAL_TO_THRESHOLD,
      });
    });
    const alarmRule = childAlarms.reduce(
      (previous, current) =>
        previous === '' ? `ALARM("${current.alarmName}")` : `${previous} OR ALARM("${current.alarmName}")`,
      '',
    );
    const parentAlarm = new CfnCompositeAlarm(scope, parentName, {
      alarmName: parentName,
      alarmRule,
      alarmDescription,
      alarmActions: [sns.topicArn],
    });
    return { parentAlarm, childAlarms };
  };

  public static cloudfrontLatencyAlarms = (
    windows: IAlertConfig[],
    scope: Construct,
    alarmDescription: string,
    sns: Topic,
    slo: CloudfrontLatencySLO,
  ) => {
    const parentName = `${slo.title} Latency P${slo.sloThreshold * 100} >= ${slo.latencyThreshold}ms`;
    const childAlarms = windows.map(sloWindow => {
      const metric = new CloudfrontLatencyMetric({
        ...slo,
        sloWindow,
      });
      const alarmName = `${parentName} - ${sloWindow.description}`;
      return new Alarm(scope, alarmName, {
        metric,
        threshold: slo.latencyThreshold,
        alarmName,
        evaluationPeriods: 1,
        datapointsToAlarm: 1,
        comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      });
    });
    const alarmRule = childAlarms.reduce(
      (previous, current) =>
        previous === '' ? `ALARM("${current.alarmName}")` : `${previous} OR ALARM("${current.alarmName}")`,
      '',
    );
    const parentAlarm = new CfnCompositeAlarm(scope, parentName, {
      alarmName: parentName,
      alarmRule,
      alarmDescription,
      alarmActions: [sns.topicArn],
    });
    return { parentAlarm, childAlarms };
  };

  constructor(scope: Construct, id: string, props: ISLOAlarmsProps) {
    super(scope, id);

    let alarmDescription = `Service is at risk of exceeding its error budget. Please use the links below to troubleshoot the problem:\n\nDashboard: ${props.dashboardLink}\nRun book: ${props.runbookLink}\n`;
    if (props.alarmsDashboardLink) {
      alarmDescription = `${alarmDescription}\nAlarms Dashboard: ${props.alarmsDashboardLink}`;
    }

    const sns = new Topic(scope, 'AlarmTopic');

    props.slos.forEach(slo => {
      const windows = Windows.standardAlarmWindows;
      switch (slo.type) {
        case 'ApiAvailability':
          SLOAlarms.apiAvailabilityAlarms(windows, this, alarmDescription, sns, slo as ApiAvailabilitySLO);
          break;
        case 'ApiLatency':
          SLOAlarms.apiLatencyAlarms(windows, this, alarmDescription, sns, slo as ApiLatencySLO);
          break;
        case 'CloudfrontAvailability':
          SLOAlarms.cloudfrontAvailabilityAlarms(
            windows,
            this,
            alarmDescription,
            sns,
            slo as CloudfrontAvailabilitySLO,
          );
          break;
        case 'CloudfrontLatency':
          SLOAlarms.cloudfrontLatencyAlarms(windows, this, alarmDescription, sns, slo as CloudfrontLatencySLO);
          break;
        default:
          throw new Error(`Alarms creation encountered an unknown type for slo: ${JSON.stringify(slo)}.`);
      }
    });
  }
}
