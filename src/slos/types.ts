import { GraphWidgetProps } from '@aws-cdk/aws-cloudwatch';
import { Duration } from '@aws-cdk/core';

/**
 * The common properties of a Service Level Objective
 */
export interface ISLO {
  /**
   * String name of the SLO type. Valid values are:
   * ApiAvailabilitySLO, ApiLatencySLO, CloudfrontAvailabilitySLO
   */
  readonly type: string;

  /**
   * A title for the SLO. This will be used when creating alarms and widgets
   */
  readonly title: string;

  /**
   * The decimal value for the threshold of the SLO.
   */
  readonly sloThreshold: number;

  /**
   * Optional object to specify which alarm actions should be enabled by severity.
   * Example object:
   * {
   *   High: true,
   *   Low: false,
   * }
   * By default, all actions for all severities are enabled.
   */
  readonly alarmsEnabled?: { [key: string]: boolean };
}

/**
 * Availability Service Level Objective properties.
 * There are no additional properties from the basic SLO but we create this to have an explicit type
 */
export type IAvailabilitySLO = ISLO;

/**
 * Latency Service Level Objective properties.
 * Latency SLOs require a latency threshold in addition to the common props
 */
export interface ILatencySLO extends ISLO {
  readonly latencyThreshold: number;
}

/**
 * Properties specific to API Gateway based Service Level Indicators
 */
export interface IApiSLI {
  readonly apiName: string;
}

/**
 * Properties specific to Cloudfront Distribution based Service Level Indicators
 */
export interface ICloudfrontSLI {
  readonly distributionId: string;
}

/**
 * Properties specific to Elastic Search based Service Level Indicators
 */
export interface IElasticSearchSLI {
  readonly accountId: string;
  readonly domainName: string;
}

/**
 * Properties specific to Custom Availability Metric based Service Level Indicators
 */
export interface ICustomAvailibilitySLI {
  readonly namespace: string;
  readonly errorsMetricName: string;
  readonly countsMetricName: string;
}

/**
 * Properties specific to Custom Latency Metric based Service Level Indicators
 */
export interface ICustomLatencySLI {
  readonly namespace: string;
  readonly latencyMetricName: string;
}

/**
 * Properties specific to Appsync based Service Level Indicators
 */
export interface IAppSyncSLI {
  readonly apiId: string;
}

// SLO types are combinations of the objective and the indicator
export type ApiAvailabilitySLO = IAvailabilitySLO & IApiSLI;
export type ApiLatencySLO = ILatencySLO & IApiSLI;
export type CloudfrontAvailabilitySLO = IAvailabilitySLO & ICloudfrontSLI;
export type CloudfrontLatencySLO = ILatencySLO & ICloudfrontSLI;
export type ElasticSearchAvailabilitySLO = IAvailabilitySLO & IElasticSearchSLI;
export type ElasticSearchLatencySLO = ILatencySLO & IElasticSearchSLI;
export type CustomAvailabilitySLO = IAvailabilitySLO & ICustomAvailibilitySLI;
export type CustomLatencySLO = ILatencySLO & ICustomLatencySLI;
export type AppSyncAvailabilitySLO = IAvailabilitySLO & IAppSyncSLI;
export type AppSyncLatencySLO = ILatencySLO & IAppSyncSLI;
export type AnySLO =
  | ApiAvailabilitySLO
  | ApiLatencySLO
  | CloudfrontAvailabilitySLO
  | CloudfrontLatencySLO
  | ElasticSearchAvailabilitySLO
  | ElasticSearchLatencySLO
  | CustomAvailabilitySLO
  | CustomLatencySLO
  | AppSyncAvailabilitySLO
  | AppSyncLatencySLO;

/**
 * Defines a configuration for alerting on burn rates within a window
 * See https://landing.google.com/sre/workbook/chapters/alerting-on-slos/
 */
export interface IAlertConfig {
  /**
   * The SLO budget consumption to alert on
   */
  readonly percent: number;

  /**
   * The total period for the SLO. Period here is in Google's terms, ex 30 days, not Cloudwatch
   * period. Ex: if measuring "2% of 30 Day budget in 1 hour", period would be Duration.days(30)
   */
  readonly period: Duration;

  /**
   * The time window to use when measuring burn rate. This is in Google's terms,
   * ex: if measuring "2% of 30 Day budget in 1 hour", the alertWindow would be
   * Duration.hours(1)
   */
  readonly alertWindow: Duration;

  /**
   * The burn rate threshold to alert on. Generally this will be calculated by
   * anything implementing this interface from other properties.
   */
  readonly burnRateThreshold: number;

  /**
   * A user friendly description of the alert configuration. Ex: 2% of 30 day budget in 1 hour"
   * This will also generally be created by anything implementing this interface.
   */
  readonly description: string;
}

export interface IMultiWindowAlert {
  readonly windows: IAlertConfig[];
  readonly severity: string;
}

export interface ISLOWidgetProps extends GraphWidgetProps {
  /**
   * The decimal value for the threshold of the SLO.
   */
  readonly sloThreshold: number;

  /**
   * The alert configuration to use when constructing this widget. Will affect
   * things like annotations and scaling of the graphs
   */
  readonly sloWindow: IAlertConfig;

  /**
   * Optionally shows (and scales the graph) to the SLO Burn Rate threshold.
   * Burn rate threshold is a function of the SLO threshold and the SLO window size
   */
  readonly showBurnRateThreshold?: boolean;

  /**
   * Optionally adds a human readable description of the period defined
   * by the sloWindow
   */
  readonly addPeriodToTitle?: boolean;
}

/**
 * Common set of preset colors to use in widgets
 */
export enum Colors {
  red = '#d62728',
  blue = '#1f77b4',
  orange = '#ff7f0e',
}

export enum Severity {
  HIGH = 'High',
  LOW = 'Low',
}
