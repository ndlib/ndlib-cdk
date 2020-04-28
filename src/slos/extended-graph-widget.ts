import { GraphWidget, GraphWidgetProps } from '@aws-cdk/aws-cloudwatch';

export enum LegendPosition {
  Bottom = 'bottom',
  Right = 'right',
  Hidden = 'hidden',
}

export interface IExtendedGraphWidgetProps extends GraphWidgetProps {
  /**
   * Where to position the legend for this widget
   */
  readonly legendPosition: LegendPosition;
}

/**
 * Adds support for legend position. Can remove once cdk fixes
 * https://github.com/aws/aws-cdk/issues/3625
 */
export class ExtendedGraphWidget extends GraphWidget {
  private legendPosition: LegendPosition;
  constructor(props: IExtendedGraphWidgetProps) {
    super(props);
    this.legendPosition = props.legendPosition || LegendPosition.Bottom;
  }

  public toJson(): any[] {
    const widgetConfig = super.toJson();

    return widgetConfig.map(obj => ({
      ...obj,
      properties: {
        ...obj.properties,
        legend: {
          position: this.legendPosition,
        },
      },
    }));
  }
}
