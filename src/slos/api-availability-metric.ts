import { MathExpression, Metric } from '@aws-cdk/aws-cloudwatch';
import { IAlertConfig } from './types';

export interface IApiAvailabilityMetricProps {
  /**
   * Name of the API for this metric
   */
  readonly apiName: string;

  /**
   * The SLO window that this metric will be used for.
   */
  readonly sloWindow: IAlertConfig;
}

/**
 * Creates a metric that can be used as an SLI for API Gateway
 * Availability SLOs
 */
export class ApiAvailabilityMetric extends MathExpression {
  constructor(props: IApiAvailabilityMetricProps) {
    const gatewayErrors = new Metric({
      namespace: 'AWS/ApiGateway',
      metricName: '5XXError',
      dimensions: {
        ApiName: props.apiName,
      },
      statistic: 'Sum',
      label: 'Error rate',
    });

    const gatewayRequests = new Metric({
      namespace: 'AWS/ApiGateway',
      metricName: 'Count',
      dimensions: {
        ApiName: props.apiName,
      },
      statistic: 'Sum',
      label: 'Requests',
    });

    const myProps = {
      label: 'Availability',
      expression: '(gatewayRequests - gatewayErrors)/gatewayRequests',
      usingMetrics: { gatewayRequests, gatewayErrors },
      period: props.sloWindow.alertWindow,
    };

    super({ ...props, ...myProps });
  }
}
