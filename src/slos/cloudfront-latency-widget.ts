import { CloudfrontLatencyMetric } from './cloudfront-latency-metric';
import { LatencyWidget } from './latency-widget';
import { ISLOWidgetProps } from './types';

export interface ICloudfrontLatencyWidgetProps extends ISLOWidgetProps {
  /**
   * Identifier of the Distribution for this metric
   */
  readonly distributionId: string;

  /**
   * The integer value for the latency threshold in ms.
   */
  readonly latencyThreshold: number;
}

/**
 * Creates a dashboard widget for Cloudfront Distribution
 * Latency SLO
 */
export class CloudfrontLatencyWidget extends LatencyWidget {
  constructor(props: ICloudfrontLatencyWidgetProps) {
    const latency = new CloudfrontLatencyMetric({
      distributionId: props.distributionId,
      sloThreshold: props.sloThreshold,
      sloWindow: props.sloWindow,
    });
    super({ latency, ...props });
  }
}
