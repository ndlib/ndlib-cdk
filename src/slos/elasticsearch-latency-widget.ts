import { ElasticSearchLatencyMetric } from './elasticsearch-latency-metric';
import { LatencyWidget } from './latency-widget';
import { ISLOWidgetProps } from './types';

export interface IElasticSearchLatencyWidgetProps extends ISLOWidgetProps {
  /**
   * The Account ID for the ES domain
   */
  readonly accountId: string;

  /**
   * The ES Domain Name for this metric
   */
  readonly domainName: string;

  /**
   * The integer value for the latency threshold in ms.
   */
  readonly latencyThreshold: number;
}

/**
 * Creates a dashboard widget for an ElasticSearch domain
 * Latency SLO
 */
export class ElasticSearchLatencyWidget extends LatencyWidget {
  constructor(props: IElasticSearchLatencyWidgetProps) {
    const latency = new ElasticSearchLatencyMetric({
      accountId: props.accountId,
      domainName: props.domainName,
      sloThreshold: props.sloThreshold,
      sloWindow: props.sloWindow,
    });
    super({ latency, ...props });
  }
}
