import { AppSyncAvailabilityMetric } from './appsync-availability-metric';
import { AvailabilityWidget } from './availability-widget';
import { ISLOWidgetProps } from './types';

export interface IAppSyncAvailabilityWidgetProps extends ISLOWidgetProps {
  /**
   * Id of the API for this metric
   */
  readonly apiId: string;
}

export class AppSyncAvailabilityWidget extends AvailabilityWidget {
  /**
   * Creates an availability widget using an AppSync API availability metric
   */
  constructor(props: IAppSyncAvailabilityWidgetProps) {
    const availability = new AppSyncAvailabilityMetric({ apiId: props.apiId, sloWindow: props.sloWindow });
    super({ availability, ...props });
  }
}
