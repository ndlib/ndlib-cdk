import { AppSyncLatencyMetric } from './appsync-latency-metric';
import { LatencyWidget } from './latency-widget';
import { ISLOWidgetProps } from './types';

export interface IAppSyncLatencyWidgetProps extends ISLOWidgetProps {
  /**
   * Id of the API for this metric
   */
  readonly apiId: string;

  /**
   * The integer value for the latency threshold in ms.
   */
  readonly latencyThreshold: number;
}

export class AppSyncLatencyWidget extends LatencyWidget {
  /**
   * Creates a latency widget using an AppSync API latency metric
   */
  constructor(props: IAppSyncLatencyWidgetProps) {
    const latency = new AppSyncLatencyMetric({
      apiId: props.apiId,
      sloThreshold: props.sloThreshold,
      sloWindow: props.sloWindow,
    });
    super({ latency, ...props });
  }
}
