import { Metric } from '@aws-cdk/aws-cloudwatch';
import { IAlertConfig } from './types';

export interface IAppSyncLatencyMetricProps {
  /**
   * Id of the GraphQL API for this metric
   */
  readonly apiId: string;

  /**
   * The SLO window that this metric will be used for.
   */
  readonly sloWindow: IAlertConfig;

  /**
   * The decimal value for the threshold of the SLO.
   */
  readonly sloThreshold: number;
}

export class AppSyncLatencyMetric extends Metric {
  /**
   * Creates a metric that can be used as an SLI for AppSync API
   * Latency SLOs
   */
  constructor(props: IAppSyncLatencyMetricProps) {
    const sloBudget = 100 - props.sloThreshold * 100;
    let alarmThreshold = 100 - props.sloWindow.burnRateThreshold * sloBudget;
    alarmThreshold = Math.max(0, Math.min(alarmThreshold, 100));
    const statistic = `p${alarmThreshold.toFixed(2)}`;
    const myProps = {
      namespace: 'AWS/AppSync',
      metricName: 'Latency',
      dimensions: {
        GraphQLAPIId: props.apiId,
      },
      statistic,
      label: `Latency ${statistic}`,
      period: props.sloWindow.alertWindow,
    };
    super({ ...props, ...myProps });
  }
}
