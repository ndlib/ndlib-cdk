import { AvailabilityWidget } from './availability-widget'
import { ElasticSearchAvailabilityMetric } from './elasticsearch-availability-metric'
import { ISLOWidgetProps } from './types'

export interface IElasticSearchAvailabilityWidgetProps extends ISLOWidgetProps {
  /**
   * The Account ID for the ES domain
   */
  readonly accountId: string

  /**
   * The ES Domain Name for this metric
   */
  readonly domainName: string
}

/**
 * Creates an availability widget using an ElasticSearch availability metric
 */
export class ElasticSearchAvailabilityWidget extends AvailabilityWidget {
  constructor(props: IElasticSearchAvailabilityWidgetProps) {
    const availability = new ElasticSearchAvailabilityMetric({
      accountId: props.accountId,
      domainName: props.domainName,
      sloWindow: props.sloWindow,
    })
    super({ availability, ...props })
  }
}
