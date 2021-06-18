import { Alarm, CfnCompositeAlarm, ComparisonOperator } from '@aws-cdk/aws-cloudwatch';
import { Topic } from '@aws-cdk/aws-sns';
import { Construct } from '@aws-cdk/core';
import { ApiAvailabilityMetric } from './api-availability-metric';
import { ApiLatencyMetric } from './api-latency-metric';
import { AppSyncAvailabilityMetric } from './appsync-availability-metric';
import { AppSyncLatencyMetric } from './appsync-latency-metric';
import { CloudfrontAvailabilityMetric } from './cloudfront-availability-metric';
import { CloudfrontLatencyMetric } from './cloudfront-latency-metric';
import { CustomAvailabilityMetric } from './custom-availability-metric';
import { CustomLatencyMetric } from './custom-latency-metric';
import { ElasticSearchAvailabilityMetric } from './elasticsearch-availability-metric';
import { ElasticSearchLatencyMetric } from './elasticsearch-latency-metric';
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
  IMultiWindowAlert,
  Severity,
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
 * Function signature for an Alarm factory
 */
type AlarmFactory = (sloWindow: IAlertConfig, scope: Construct, slo: AnySLO, alarmName: string) => Alarm;

/**
 * KVPs where the key is the severity and the value is the SNS topic associated with that severity
 */
interface ITopicSeverities {
  [key: string]: Topic;
}

/**
 * Grouping of parent (composite) alarms, the child alarms that their expression is based on, and the severity
 * that they are assosciated with
 */
interface IAlarmsBySeverities {
  severity: string;
  parentAlarm: CfnCompositeAlarm;
  childAlarms: Alarm[][];
}

/**
 * Creates multi-window alarms using CloudWatch composite alarms from a list of slo objects.
 * Also creates an SNS topic as an action for the parent alarm.
 */
export class SLOAlarms extends Construct {
  /**
   * Factory method for constructing an Alarm based on an ApiAvailabilitySLO
   */
  public static apiAvailabilityAlarm = (sloWindow: IAlertConfig, scope: Construct, slo: AnySLO, alarmName: string) => {
    const typedSlo = slo as ApiAvailabilitySLO;
    const metric = new ApiAvailabilityMetric({
      ...typedSlo,
      sloWindow,
    });
    const sloBudget = 1 - typedSlo.sloThreshold;
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
  };

  /**
   * Factory method for constructing an Alarm based on an ApiLatencySLO
   */
  public static apiLatencyAlarm = (sloWindow: IAlertConfig, scope: Construct, slo: AnySLO, alarmName: string) => {
    const typedSlo = slo as ApiLatencySLO;
    const metric = new ApiLatencyMetric({
      ...typedSlo,
      sloWindow,
    });
    return new Alarm(scope, alarmName, {
      metric,
      threshold: typedSlo.latencyThreshold,
      alarmName,
      evaluationPeriods: 1,
      datapointsToAlarm: 1,
      comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
    });
  };

  /**
   * Factory method for constructing an Alarm based on an AppSyncAvailabilitySLO
   */
  public static appSyncAvailabilityAlarm = (
    sloWindow: IAlertConfig,
    scope: Construct,
    slo: AnySLO,
    alarmName: string,
  ) => {
    const typedSlo = slo as AppSyncAvailabilitySLO;
    const metric = new AppSyncAvailabilityMetric({
      ...typedSlo,
      sloWindow,
    });
    const sloBudget = 1 - typedSlo.sloThreshold;
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
  };

  /**
   * Factory method for constructing an Alarm based on an AppSyncLatencySLO
   */
  public static appSyncLatencyAlarm = (sloWindow: IAlertConfig, scope: Construct, slo: AnySLO, alarmName: string) => {
    const typedSlo = slo as AppSyncLatencySLO;
    const metric = new AppSyncLatencyMetric({
      ...typedSlo,
      sloWindow,
    });
    return new Alarm(scope, alarmName, {
      metric,
      threshold: typedSlo.latencyThreshold,
      alarmName,
      evaluationPeriods: 1,
      datapointsToAlarm: 1,
      comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
    });
  };

  /**
   * Factory method for constructing an Alarm based on an CloudfrontAvailabilitySLO
   */
  public static cloudfrontAvailabilityAlarm = (
    sloWindow: IAlertConfig,
    scope: Construct,
    slo: AnySLO,
    alarmName: string,
  ) => {
    const typedSlo = slo as CloudfrontAvailabilitySLO;
    const metric = new CloudfrontAvailabilityMetric({
      ...typedSlo,
      sloWindow,
    });
    const sloBudget = 1 - typedSlo.sloThreshold;
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
  };

  /**
   * Factory method for constructing an Alarm based on an CloudfrontLatencySLO
   */
  public static cloudfrontLatencyAlarm = (
    sloWindow: IAlertConfig,
    scope: Construct,
    slo: AnySLO,
    alarmName: string,
  ) => {
    const typedSlo = slo as CloudfrontLatencySLO;
    const metric = new CloudfrontLatencyMetric({
      ...typedSlo,
      sloWindow,
    });
    return new Alarm(scope, alarmName, {
      metric,
      threshold: typedSlo.latencyThreshold,
      alarmName,
      evaluationPeriods: 1,
      datapointsToAlarm: 1,
      comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
    });
  };

  /**
   * Factory method for constructing an Alarm based on an ElasticSearchAvailabilitySLO
   */
  public static elasticSearchAvailabilityAlarm = (
    sloWindow: IAlertConfig,
    scope: Construct,
    slo: AnySLO,
    alarmName: string,
  ) => {
    const typedSlo = slo as ElasticSearchAvailabilitySLO;
    const metric = new ElasticSearchAvailabilityMetric({
      ...typedSlo,
      sloWindow,
    });
    const sloBudget = 1 - typedSlo.sloThreshold;
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
  };

  /**
   * Factory method for constructing an Alarm based on an ElasticSearchLatencySLO
   */
  public static elasticSearchLatencyAlarm = (
    sloWindow: IAlertConfig,
    scope: Construct,
    slo: AnySLO,
    alarmName: string,
  ) => {
    const typedSlo = slo as ElasticSearchLatencySLO;
    const metric = new ElasticSearchLatencyMetric({
      ...typedSlo,
      sloWindow,
    });
    return new Alarm(scope, alarmName, {
      metric,
      threshold: typedSlo.latencyThreshold,
      alarmName,
      evaluationPeriods: 1,
      datapointsToAlarm: 1,
      comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
    });
  };

  /**
   * Factory method for constructing an Alarm based on an CustomAvailabilitySLO
   */
  public static customAvailabilityAlarm = (
    sloWindow: IAlertConfig,
    scope: Construct,
    slo: AnySLO,
    alarmName: string,
  ) => {
    const typedSlo = slo as CustomAvailabilitySLO;
    const metric = new CustomAvailabilityMetric({
      ...typedSlo,
      sloWindow,
    });
    const sloBudget = 1 - typedSlo.sloThreshold;
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
  };

  /**
   * Factory method for constructing an Alarm based on an CustomLatencySLO
   */
  public static customLatencyAlarm = (sloWindow: IAlertConfig, scope: Construct, slo: AnySLO, alarmName: string) => {
    const typedSlo = slo as CustomLatencySLO;
    const metric = new CustomLatencyMetric({
      ...typedSlo,
      sloWindow,
    });
    return new Alarm(scope, alarmName, {
      metric,
      threshold: typedSlo.latencyThreshold,
      alarmName,
      evaluationPeriods: 1,
      datapointsToAlarm: 1,
      comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
    });
  };

  /**
   * Factory method for creating a composite alarm expression from the grid of alarms
   */
  public static createCompositeAlarm = (childAlarms: Alarm[][]) => {
    return childAlarms.reduce((previousOr, currentOr) => {
      const ands = currentOr.reduce(
        (previousAnd, currentAnd) =>
          previousAnd === ''
            ? `ALARM("${currentAnd.alarmName}")`
            : `${previousAnd} AND ALARM("${currentAnd.alarmName}")`,
        '',
      );
      return previousOr === '' ? `(${ands})` : `${previousOr} OR (${ands})`;
    }, '');
  };

  /**
   * Factory method for creating all multi-window, multi-burn rate alarms for an SLO
   */
  public static createAlarms = (
    windows: IMultiWindowAlert[],
    scope: Construct,
    alarmDescription: string,
    topics: ITopicSeverities,
    slo: AnySLO,
    parentName: string,
    alarmFactory: AlarmFactory,
  ) => {
    const alarms = Object.keys(topics).map(topicSeverity => {
      // Create child alarms for all windows associated with this severity
      const childAlarms = windows.reduce((previous, current) => {
        if (current.severity === topicSeverity) {
          const windowsForSeverity = current.windows.map(sloWindow => {
            return alarmFactory(sloWindow, scope, slo, `${parentName} - ${sloWindow.description}`);
          });
          previous.push(windowsForSeverity);
        }
        return previous;
      }, [] as Alarm[][]);

      // Create a composite alarm that sends its notification to the topic associated with this severity
      const parentSeverityName = `${parentName} (${topicSeverity} Severity)`;
      const parentAlarm = new CfnCompositeAlarm(scope, parentSeverityName, {
        alarmName: parentSeverityName,
        alarmRule: SLOAlarms.createCompositeAlarm(childAlarms),
        alarmDescription,
        alarmActions: [topics[topicSeverity].topicArn],
        actionsEnabled: slo.alarmsEnabled === undefined ? true : slo.alarmsEnabled[topicSeverity] ?? true,
      });
      return { severity: topicSeverity, parentAlarm, childAlarms };
    });
    return alarms;
  };

  /**
   * List of alarms that were created, grouped by severity
   */
  public alarms!: IAlarmsBySeverities[];

  /**
   * Each SNS topic created for each severity
   */
  public topics: ITopicSeverities;

  constructor(scope: Construct, id: string, props: ISLOAlarmsProps) {
    super(scope, id);

    const windows = Windows.standardAlarmMultiWindows;
    this.alarms = [];

    let alarmDescription = `Service is at risk of exceeding its error budget. Please use the links below to troubleshoot the problem:\n\nDashboard: ${props.dashboardLink}\nRun book: ${props.runbookLink}\n`;
    if (props.alarmsDashboardLink) {
      alarmDescription = `${alarmDescription}Alarms Dashboard: ${props.alarmsDashboardLink}\n`;
    }

    // Construct an SNS Topic for each unique severity type in the windows
    this.topics = windows.reduce((previous, current) => {
      if (previous[current.severity] === undefined) {
        previous[current.severity] = new Topic(scope, `${current.severity}SeverityTopic`);
      }
      return previous;
    }, {} as ITopicSeverities);

    // Create multi-window, multi-burn rate alarms for each SLO based on its type
    props.slos.forEach(slo => {
      let parentName: string;
      let alarmFactory: AlarmFactory;
      switch (slo.type) {
        case 'ApiAvailability':
          parentName = `${slo.title} Availability <= ${slo.sloThreshold}`;
          alarmFactory = SLOAlarms.apiAvailabilityAlarm;
          break;
        case 'ApiLatency':
          const apiLatencySLO = slo as ApiLatencySLO;
          parentName = `${slo.title} Latency P${slo.sloThreshold * 100} >= ${apiLatencySLO.latencyThreshold}ms`;
          alarmFactory = SLOAlarms.apiLatencyAlarm;
          break;
        case 'AppSyncAvailability':
          parentName = `${slo.title} Availability <= ${slo.sloThreshold}`;
          alarmFactory = SLOAlarms.appSyncAvailabilityAlarm;
          break;
        case 'AppSyncLatency':
          const appSyncLatencySLO = slo as AppSyncLatencySLO;
          parentName = `${slo.title} Latency P${slo.sloThreshold * 100} >= ${appSyncLatencySLO.latencyThreshold}ms`;
          alarmFactory = SLOAlarms.appSyncLatencyAlarm;
          break;
        case 'CloudfrontAvailability':
          parentName = `${slo.title} Availability <= ${slo.sloThreshold}`;
          alarmFactory = SLOAlarms.cloudfrontAvailabilityAlarm;
          break;
        case 'CloudfrontLatency':
          const cloudfrontLatencySLO = slo as CloudfrontLatencySLO;
          parentName = `${slo.title} Latency P${slo.sloThreshold * 100} >= ${cloudfrontLatencySLO.latencyThreshold}ms`;
          alarmFactory = SLOAlarms.cloudfrontLatencyAlarm;
          break;
        case 'ElasticSearchAvailability':
          parentName = `${slo.title} Availability <= ${slo.sloThreshold}`;
          alarmFactory = SLOAlarms.elasticSearchAvailabilityAlarm;
          break;
        case 'ElasticSearchLatency':
          const esLatencySLO = slo as ElasticSearchLatencySLO;
          parentName = `${slo.title} Latency P${slo.sloThreshold * 100} >= ${esLatencySLO.latencyThreshold}ms`;
          alarmFactory = SLOAlarms.elasticSearchLatencyAlarm;
          break;
        case 'CustomAvailability':
          parentName = `${slo.title} Availability <= ${slo.sloThreshold}`;
          alarmFactory = SLOAlarms.customAvailabilityAlarm;
          break;
        case 'CustomLatency':
          const customLatencySLO = slo as CustomLatencySLO;
          parentName = `${slo.title} Latency P${slo.sloThreshold * 100} >= ${customLatencySLO.latencyThreshold}ms`;
          alarmFactory = SLOAlarms.customLatencyAlarm;
          break;
        default:
          throw new Error(`Alarms creation encountered an unknown type for slo: ${JSON.stringify(slo)}.`);
      }

      this.alarms.push(
        ...SLOAlarms.createAlarms(windows, this, alarmDescription, this.topics, slo, parentName, alarmFactory),
      );
    });
  }
}
