import { MathExpression, Metric } from '@aws-cdk/aws-cloudwatch';
import { IAlertConfig } from './types';

export interface ICloudfrontAvailabilityMetricProps {
  /**
   * Identifier of the Distribution for this metric
   */
  readonly distributionId: string;

  /**
   * The SLO window that this metric will be used for.
   */
  readonly sloWindow: IAlertConfig;
}

/**
 * Creates a metric that can be used as an SLI for Cloudfront Distribution
 * Availability SLOs
 */
export class CloudfrontAvailabilityMetric extends MathExpression {
  constructor(props: ICloudfrontAvailabilityMetricProps) {
    const errorRate = new Metric({
      namespace: 'AWS/CloudFront',
      metricName: '5xxErrorRate',
      dimensions: {
        Region: 'Global',
        DistributionId: props.distributionId,
      },
      statistic: 'Average',
      label: 'Error rate',
    });

    const myProps = {
      label: 'Availability',
      expression: '1-(errorRate/100)',
      usingMetrics: { errorRate },
      period: props.sloWindow.alertWindow,
    };

    super({ ...props, ...myProps });
  }
}
