import { Metric } from '@aws-cdk/aws-cloudwatch'
import { IAlertConfig } from './types'

export interface IElasticSearchLatencyMetricProps {
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

  /**
   * The decimal value for the threshold of the SLO.
   */
  readonly sloThreshold: number
}

/**
 * Creates a metric that can be used as an SLI for ElasticSearch
 * Latency SLOs
 */
export class ElasticSearchLatencyMetric extends Metric {
  constructor(props: IElasticSearchLatencyMetricProps) {
    const sloBudget = 100 - props.sloThreshold * 100
    let alarmThreshold = 100 - props.sloWindow.burnRateThreshold * sloBudget
    alarmThreshold = Math.max(0, Math.min(alarmThreshold, 100))
    const statistic = `p${alarmThreshold.toFixed(2)}`
    const myProps = {
      namespace: 'AWS/ES',
      metricName: 'SearchLatency',
      dimensions: {
        DomainName: props.domainName,
        ClientId: props.accountId,
      },
      statistic,
      label: `Latency ${statistic}`,
      period: props.sloWindow.alertWindow,
    }
    super({ ...props, ...myProps })
  }
}
