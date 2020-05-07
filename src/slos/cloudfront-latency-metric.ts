import { Metric } from '@aws-cdk/aws-cloudwatch';
import { IAlertConfig } from './types';

export interface ICloudfrontLatencyMetricProps {
  /**
   * Identifier of the Distribution for this metric
   */
  readonly distributionId: string;

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
 * Creates a metric that can be used as an SLI for Cloudfront Distribution
 * Latency SLOs
 */
export class CloudfrontLatencyMetric extends Metric {
  constructor(props: ICloudfrontLatencyMetricProps) {
    const sloBudget = 100 - props.sloThreshold * 100;
    let alarmThreshold = 100 - props.sloWindow.burnRateThreshold * sloBudget;
    alarmThreshold = Math.max(0, Math.min(alarmThreshold, 100));
    const statistic = `p${alarmThreshold.toFixed(2)}`;
    const myProps = {
      namespace: 'AWS/CloudFront',
      metricName: 'OriginLatency',
      dimensions: {
        Region: 'Global',
        DistributionId: props.distributionId,
      },
      statistic,
      label: `Latency ${statistic}`,
      period: props.sloWindow.alertWindow,
    };
    super({ ...props, ...myProps });
  }
}
