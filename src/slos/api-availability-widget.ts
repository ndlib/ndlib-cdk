import { ApiAvailabilityMetric } from './api-availability-metric'
import { AvailabilityWidget } from './availability-widget'
import { ISLOWidgetProps } from './types'

export interface IApiAvailabilityWidgetProps extends ISLOWidgetProps {
  /**
   * Name of the API for this metric
   */
  readonly apiName: string
}

/**
 * Creates an availability widget using an API Gateway availability metric
 */
export class ApiAvailabilityWidget extends AvailabilityWidget {
  constructor(props: IApiAvailabilityWidgetProps) {
    const availability = new ApiAvailabilityMetric({ apiName: props.apiName, sloWindow: props.sloWindow })
    super({ availability, ...props })
  }
}
