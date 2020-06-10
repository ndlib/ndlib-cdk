import { MathExpression, Metric } from '@aws-cdk/aws-cloudwatch';
import { IAlertConfig } from './types';

export interface IElasticSearchAvailabilityMetricProps {
  /**
   * The Account ID for the ES domain
   */
  readonly accountId: string;

  /**
   * The ES Domain Name for this metric
   */
  readonly domainName: string;

  /**
   * The SLO window that this metric will be used for.
   */
  readonly sloWindow: IAlertConfig;
}

/**
 * Creates a metric that can be used as an SLI for ElasticSearch
 * Availability SLOs
 */
export class ElasticSearchAvailabilityMetric extends MathExpression {
  constructor(props: IElasticSearchAvailabilityMetricProps) {
    const errors = new Metric({
      namespace: 'AWS/ES',
      metricName: '5xx',
      dimensions: {
        DomainName: props.domainName,
        ClientId: props.accountId,
      },
      statistic: 'Sum',
      label: 'Errors',
    });

    const requests = new Metric({
      namespace: 'AWS/ES',
      metricName: 'ElasticsearchRequests',
      dimensions: {
        DomainName: props.domainName,
        ClientId: props.accountId,
      },
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
