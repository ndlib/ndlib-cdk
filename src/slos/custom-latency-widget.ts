import { CustomLatencyMetric } from './custom-latency-metric';
import { LatencyWidget } from './latency-widget';
import { ISLOWidgetProps } from './types';

export interface ICustomLatencyWidgetProps extends ISLOWidgetProps {
  /**
   * The custom namespace to find the errors and requests metrics
   */
  readonly namespace: string;

  /**
   * The custom metric name that will give the count of 5xx errors
   */
  readonly latencyMetricName: string;

  /**
   * The integer value for the latency threshold in ms.
   */
  readonly latencyThreshold: number;
}

/**
 * Creates a latency widget using a Custom latency metric
 */
export class CustomLatencyWidget extends LatencyWidget {
  constructor(props: ICustomLatencyWidgetProps) {
    const latency = new CustomLatencyMetric({
      namespace: props.namespace,
      latencyMetricName: props.latencyMetricName,
      sloThreshold: props.sloThreshold,
      sloWindow: props.sloWindow,
    });
    super({ latency, ...props });
  }
}
