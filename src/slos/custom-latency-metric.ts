import { Metric } from '@aws-cdk/aws-cloudwatch';
import { IAlertConfig } from './types';

export interface ICustomLatencyMetricProps {
  /**
   * The custom namespace to find the errors and requests metrics
   */
  readonly namespace: string;

  /**
   * The custom metric name that will give the count of 5xx errors
   */
  readonly latencyMetricName: string;

  /**
   * The SLO window that this metric will be used for.
   */
  readonly sloWindow: IAlertConfig;

  /**
   * The decimal value for the threshold of the SLO.
   */
  readonly sloThreshold: number;
}

/**
 * Creates a metric that can be used as an SLI for API Gateway
 * Latency SLOs
 */
export class CustomLatencyMetric extends Metric {
  constructor(props: ICustomLatencyMetricProps) {
    const sloBudget = 100 - props.sloThreshold * 100;
    let alarmThreshold = 100 - props.sloWindow.burnRateThreshold * sloBudget;
    alarmThreshold = Math.max(0, Math.min(alarmThreshold, 100));
    const statistic = `p${alarmThreshold.toFixed(2)}`;
    const myProps = {
      namespace: props.namespace,
      metricName: props.latencyMetricName,
      statistic,
      label: `Latency ${statistic}`,
      period: props.sloWindow.alertWindow,
    };
    super({ ...props, ...myProps });
  }
}
