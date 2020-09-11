import { AvailabilityWidget } from './availability-widget';
import { CustomAvailabilityMetric } from './custom-availability-metric';
import { ISLOWidgetProps } from './types';

export interface ICustomAvailabilityWidgetProps extends ISLOWidgetProps {
  /**
   * Name of the namespace for this metric
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
}

/**
 * Creates an availability widget using an API Gateway availability metric
 */
export class CustomAvailabilityWidget extends AvailabilityWidget {
  constructor(props: ICustomAvailabilityWidgetProps) {
    const availability = new CustomAvailabilityMetric({
      namespace: props.namespace,
      errorsMetricName: props.errorsMetricName,
      countsMetricName: props.countsMetricName,
      sloWindow: props.sloWindow,
    });
    super({ availability, ...props });
  }
}
