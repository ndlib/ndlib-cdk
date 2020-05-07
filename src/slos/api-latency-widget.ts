import { ApiLatencyMetric } from './api-latency-metric';
import { LatencyWidget } from './latency-widget';
import { ISLOWidgetProps } from './types';

export interface IApiLatencyWidgetProps extends ISLOWidgetProps {
  /**
   * Name of the API for this metric
   */
  readonly apiName: string;

  /**
   * The integer value for the latency threshold in ms.
   */
  readonly latencyThreshold: number;
}

/**
 * Creates a latency widget using an API Gateway latency metric
 */
export class ApiLatencyWidget extends LatencyWidget {
  constructor(props: IApiLatencyWidgetProps) {
    const latency = new ApiLatencyMetric({
      apiName: props.apiName,
      sloThreshold: props.sloThreshold,
      sloWindow: props.sloWindow,
    });
    super({ latency, ...props });
  }
}
