import { MathExpression, Metric } from '@aws-cdk/aws-cloudwatch'
import { IAlertConfig } from './types'

export interface IElasticSearchAvailabilityMetricProps {
  /**
   * The Account ID for the ES domain
   */
  readonly accountId: string

  /**
   * The ES Domain Name for this metric
   */
  readonly domainName: string

  /**
   * The SLO window that this metric will be used for.
   */
  readonly sloWindow: IAlertConfig
}

/**
 * Creates a metric that can be used as an SLI for ElasticSearch
 * Availability SLOs
 */
export class ElasticSearchAvailabilityMetric extends MathExpression {
  constructor(props: IElasticSearchAvailabilityMetricProps) {
    const usingMetrics = {
      m2xx: new Metric({
        namespace: 'AWS/ES',
        metricName: '2xx',
        dimensions: {
          DomainName: props.domainName,
          ClientId: props.accountId,
        },
        statistic: 'Sum',
        label: '2xx',
      }),
      m3xx: new Metric({
        namespace: 'AWS/ES',
        metricName: '3xx',
        dimensions: {
          DomainName: props.domainName,
          ClientId: props.accountId,
        },
        statistic: 'Sum',
        label: '3xx',
      }),
      m4xx: new Metric({
        namespace: 'AWS/ES',
        metricName: '4xx',
        dimensions: {
          DomainName: props.domainName,
          ClientId: props.accountId,
        },
        statistic: 'Sum',
        label: '4xx',
      }),
      m5xx: new Metric({
        namespace: 'AWS/ES',
        metricName: '5xx',
        dimensions: {
          DomainName: props.domainName,
          ClientId: props.accountId,
        },
        statistic: 'Sum',
        label: '5xx',
      }),
    }

    const myProps = {
      label: 'Availability',
      expression: '(m2xx + m3xx + m4xx)/(m2xx + m3xx + m4xx + m5xx)',
      usingMetrics,
      period: props.sloWindow.alertWindow,
    }

    super({ ...props, ...myProps })
  }
}
