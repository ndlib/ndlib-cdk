import { AvailabilityWidget } from './availability-widget'
import { CloudfrontAvailabilityMetric } from './cloudfront-availability-metric'
import { ISLOWidgetProps } from './types'

export interface ICloudfrontAvailabilityWidgetProps extends ISLOWidgetProps {
  /**
   * Identifier of the Distribution for this metric
   */
  readonly distributionId: string
}

/**
 * Creates a dashboard widget for a Cloudfront Distribution
 * Availability SLO
 */
export class CloudfrontAvailabilityWidget extends AvailabilityWidget {
  constructor(props: ICloudfrontAvailabilityWidgetProps) {
    const availability = new CloudfrontAvailabilityMetric({
      distributionId: props.distributionId,
      sloWindow: props.sloWindow,
    })
    super({ availability, ...props })
  }
}
