import { GraphWidget, GraphWidgetProps, IMetric, Shading } from '@aws-cdk/aws-cloudwatch';
import { Colors, ISLOWidgetProps } from './types';

export interface IAvailabilityWidgetProps extends ISLOWidgetProps {
  /**
   * The Availability metric to use for the widget
   */
  readonly availability: IMetric;
}

/**
 * Creates a dashboard widget for an Availability SLO
 */
export class AvailabilityWidget extends GraphWidget {
  constructor(props: IAvailabilityWidgetProps) {
    const sloBudget = 1 - props.sloThreshold;

    const leftYAxis = {
      // By default, scale the left axis to the SLO threshold
      // Should put it at 0.95, .995, etc, based on order of magnitude of the SLO threshold
      min: props.sloThreshold - (1 - props.sloThreshold) * 4,
      max: 1,
    };
    let leftAnnotations = [{ label: 'SLO', value: props.sloThreshold, fill: Shading.BELOW, color: Colors.red }];
    if (props.showBurnRateThreshold === true) {
      // Calculate the SLO alarm threshold in "error rate space".
      let alarmThreshold = 1 - props.sloWindow.burnRateThreshold * sloBudget;
      alarmThreshold = Math.max(0, Math.min(alarmThreshold, 1));
      const roundedPercent = Math.round(props.sloWindow.percent * 100) / 100;
      const alarmLabel = `${roundedPercent}% of Budget in ${props.sloWindow.alertWindow.toHumanString()}`;
      // Scale the left axis according to the burn rate threshold instead of the slo threshold
      leftYAxis.min = alarmThreshold - (1 - alarmThreshold) * 0.2;
      leftAnnotations = [
        { label: alarmLabel, value: +alarmThreshold.toFixed(4), fill: Shading.BELOW, color: Colors.red },
        { label: 'SLO', value: props.sloThreshold, fill: Shading.NONE, color: Colors.orange },
      ];
    }
    let title = props.title;
    if (props.addPeriodToTitle === true) {
      title = `${props.title} - ${props.sloWindow.alertWindow.toHumanString()}`;
    }

    const myProps: GraphWidgetProps = {
      title,
      left: [props.availability],
      leftAnnotations,
      leftYAxis,
    };
    super({ ...props, ...myProps });
  }
}
