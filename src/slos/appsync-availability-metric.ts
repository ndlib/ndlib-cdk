import { MathExpression, Metric } from '@aws-cdk/aws-cloudwatch'
import { IAlertConfig } from './types'

export interface IAppSyncAvailabilityMetricProps {
  /**
   * Id of the GraphQL API for this metric
   */
  readonly apiId: string

  /**
   * The SLO window that this metric will be used for.
   */
  readonly sloWindow: IAlertConfig
}

export class AppSyncAvailabilityMetric extends MathExpression {
  /**
   * Creates a metric that can be used as an SLI for AppSync API
   * Availability SLOs
   */
  constructor(props: IAppSyncAvailabilityMetricProps) {
    const errors = new Metric({
      namespace: 'AWS/AppSync',
      metricName: '5XXError',
      dimensions: {
        GraphQLAPIId: props.apiId,
      },
      statistic: 'Sum',
      label: 'Error rate',
    })

    // There is no direct request count metric. Have to get this from the sample
    // count for one of the error metrics.
    // https://docs.aws.amazon.com/appsync/latest/devguide/monitoring.html#cw-metrics
    const requests = new Metric({
      namespace: 'AWS/AppSync',
      metricName: '5XXError',
      dimensions: {
        GraphQLAPIId: props.apiId,
      },
      statistic: 'SampleCount',
      label: 'Requests',
    })

    const myProps = {
      label: 'Availability',
      expression: '(requests - errors)/requests',
      usingMetrics: { requests, errors },
      period: props.sloWindow.alertWindow,
    }
    super({ ...props, ...myProps })
  }
}
