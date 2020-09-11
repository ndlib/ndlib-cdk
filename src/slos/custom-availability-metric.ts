import { MathExpression, Metric } from '@aws-cdk/aws-cloudwatch';
import { IAlertConfig } from './types';

export interface ICustomAvailabilityMetricProps {
  /**
   * The custom namespace to find the errors and requests metrics
   */
  readonly namespace: string;

  /**
   * The custom metric name that will give the count of 5xx errors
   */
  readonly errorsMetricName: string;

  /**
   * The custom metric name that will give the count of requests
   */
  readonly countsMetricName: string;

  /**
   * The SLO window that this metric will be used for.
   */
  readonly sloWindow: IAlertConfig;
}

/**
 * Creates a metric that can be used as an SLI for Custom Metrics
 * Availability SLOs
 */
export class CustomAvailabilityMetric extends MathExpression {
  constructor(props: ICustomAvailabilityMetricProps) {
    const errors = new Metric({
      namespace: props.namespace,
      metricName: props.errorsMetricName,
      statistic: 'Sum',
      label: 'Errors',
    });

    const requests = new Metric({
      namespace: props.namespace,
      metricName: props.countsMetricName,
      statistic: 'Sum',
      label: 'Requests',
    });

    const myProps = {
      label: 'Availability',
      expression: '(requests - errors)/requests',
      usingMetrics: { requests, errors },
      period: props.sloWindow.alertWindow,
    };

    super({ ...props, ...myProps });
  }
}
