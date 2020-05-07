import { Metric } from '@aws-cdk/aws-cloudwatch';
import { IAlertConfig } from './types';

export interface IApiLatencyMetricProps {
  /**
   * Name of the API for this metric
   */
  readonly apiName: string;

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
export class ApiLatencyMetric extends Metric {
  constructor(props: IApiLatencyMetricProps) {
    const sloBudget = 100 - props.sloThreshold * 100;
    let alarmThreshold = 100 - props.sloWindow.burnRateThreshold * sloBudget;
    alarmThreshold = Math.max(0, Math.min(alarmThreshold, 100));
    const statistic = `p${alarmThreshold.toFixed(2)}`;
    const myProps = {
      namespace: 'AWS/ApiGateway',
      metricName: 'Latency',
      dimensions: {
        ApiName: props.apiName,
      },
      statistic,
      label: `Latency ${statistic}`,
      period: props.sloWindow.alertWindow,
    };
    super({ ...props, ...myProps });
  }
}
