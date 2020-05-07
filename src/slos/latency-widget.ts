import { GraphWidget, GraphWidgetProps, IMetric, Shading } from '@aws-cdk/aws-cloudwatch';
import { Colors, ISLOWidgetProps } from './types';

export interface ILatencyWidgetProps extends ISLOWidgetProps {
  /**
   * The Latency metric to use for the widget
   */
  readonly latency: IMetric;

  /**
   * The integer value for the latency threshold in ms.
   */
  readonly latencyThreshold: number;
}

/**
 * Creates a latency widget that adjusts the percentile based on slo window. The smaller the window,
 * the lower the percentile, in effect highlighting more severe issues in the smaller frames.
 * This is not as accurate as using error rates and burn rates, and is especially bad for services
 * that have non-normal distribution in latencies, but it works out of the box with AWS metrics
 * only, so it can serve as a good enough start.
 */
export class LatencyWidget extends GraphWidget {
  constructor(props: ILatencyWidgetProps) {
    const leftYAxis = {
      // By default, scale the left axis to the SLO threshold
      min: 0,
      max: props.latencyThreshold * 1.4,
    };
    const leftAnnotations = [{ label: 'SLO', value: props.latencyThreshold, fill: Shading.ABOVE, color: Colors.red }];

    let title = props.title;
    if (props.addPeriodToTitle === true) {
      title = `${props.title} - ${props.sloWindow.alertWindow.toHumanString()}`;
    }

    const myProps: GraphWidgetProps = {
      title,
      left: [props.latency],
      leftAnnotations,
      leftYAxis,
    };
    super({ ...props, ...myProps });
  }
}
