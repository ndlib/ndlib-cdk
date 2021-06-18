import { Dashboard, DashboardProps } from '@aws-cdk/aws-cloudwatch';
import * as cdk from '@aws-cdk/core';
import { ApiAvailabilityWidget } from './api-availability-widget';
import { ApiLatencyWidget } from './api-latency-widget';
import { AppSyncAvailabilityWidget } from './appsync-availability-widget';
import { AppSyncLatencyWidget } from './appsync-latency-widget';
import { CloudfrontAvailabilityWidget } from './cloudfront-availability-widget';
import { CloudfrontLatencyWidget } from './cloudfront-latency-widget';
import { CustomAvailabilityWidget } from './custom-availability-widget';
import { CustomLatencyWidget } from './custom-latency-widget';
import { ElasticSearchAvailabilityWidget } from './elasticsearch-availability-widget';
import { ElasticSearchLatencyWidget } from './elasticsearch-latency-widget';
import {
  AnySLO,
  ApiAvailabilitySLO,
  ApiLatencySLO,
  AppSyncAvailabilitySLO,
  AppSyncLatencySLO,
  CloudfrontAvailabilitySLO,
  CloudfrontLatencySLO,
  CustomAvailabilitySLO,
  CustomLatencySLO,
  ElasticSearchAvailabilitySLO,
  ElasticSearchLatencySLO,
} from './types';
import { Windows } from './windows';

export interface ISLOPerformanceDashboardProps extends DashboardProps {
  /**
   * Array of slos to create widgets for. All items must match the properties defined
   * by one of the types in AnySLO
   */
  readonly slos: AnySLO[];
}

/**
 * Creates dashboard showing SLO performance for the last 30 days from a list of slo objects.
 */
export class SLOPerformanceDashboard extends Dashboard {
  constructor(scope: cdk.Construct, id: string, props: ISLOPerformanceDashboardProps) {
    const widgets = props.slos.reduce(
      (result, slo) => {
        // Create rows with 4 widgets
        let lastRow = result[result.length - 1];
        if (lastRow.length >= 4) {
          lastRow = [];
          result.push(lastRow);
        }

        switch (slo.type) {
          case 'ApiAvailability':
            const apiAvailabilitySlo = slo as ApiAvailabilitySLO;
            lastRow.push(
              new ApiAvailabilityWidget({
                ...apiAvailabilitySlo,
                sloWindow: Windows.thirtyDays,
                title: `${apiAvailabilitySlo.title} - Availability`,
              }),
            );
            break;
          case 'ApiLatency':
            const apiLatencySlo = slo as ApiLatencySLO;
            lastRow.push(
              new ApiLatencyWidget({
                ...apiLatencySlo,
                sloWindow: Windows.thirtyDays,
                title: `${apiLatencySlo.title} - Latency ${apiLatencySlo.latencyThreshold}ms`,
              }),
            );
            break;
          case 'AppSyncAvailability':
            const appSyncAvailabilitySlo = slo as AppSyncAvailabilitySLO;
            lastRow.push(
              new AppSyncAvailabilityWidget({
                ...appSyncAvailabilitySlo,
                sloWindow: Windows.thirtyDays,
                title: `${appSyncAvailabilitySlo.title} - Availability`,
              }),
            );
            break;
          case 'AppSyncLatency':
            const appSyncLatencySlo = slo as AppSyncLatencySLO;
            lastRow.push(
              new AppSyncLatencyWidget({
                ...appSyncLatencySlo,
                sloWindow: Windows.thirtyDays,
                title: `${appSyncLatencySlo.title} - Latency ${appSyncLatencySlo.latencyThreshold}ms`,
              }),
            );
            break;
          case 'CloudfrontAvailability':
            const cloudfrontAvailaiblitySlo = slo as CloudfrontAvailabilitySLO;
            lastRow.push(
              new CloudfrontAvailabilityWidget({
                ...cloudfrontAvailaiblitySlo,
                sloWindow: Windows.thirtyDays,
                title: `${slo.title} - Availability`,
              }),
            );
            break;
          case 'CloudfrontLatency':
            const cloudfrontLatencySlo = slo as CloudfrontLatencySLO;
            lastRow.push(
              new CloudfrontLatencyWidget({
                ...cloudfrontLatencySlo,
                sloWindow: Windows.thirtyDays,
                title: `${cloudfrontLatencySlo.title} - Latency ${cloudfrontLatencySlo.latencyThreshold}ms`,
              }),
            );
            break;
          case 'CustomAvailability':
            const customAvailabilitySlo = slo as CustomAvailabilitySLO;
            lastRow.push(
              new CustomAvailabilityWidget({
                ...customAvailabilitySlo,
                sloWindow: Windows.thirtyDays,
                title: `${customAvailabilitySlo.title} - Availability`,
              }),
            );
            break;
          case 'CustomLatency':
            const customLatencySlo = slo as CustomLatencySLO;
            lastRow.push(
              new CustomLatencyWidget({
                ...customLatencySlo,
                sloWindow: Windows.thirtyDays,
                title: `${customLatencySlo.title} - Latency ${customLatencySlo.latencyThreshold}ms`,
              }),
            );
            break;
          case 'ElasticSearchAvailability':
            const elasticSearchAvailabilitySlo = slo as ElasticSearchAvailabilitySLO;
            lastRow.push(
              new ElasticSearchAvailabilityWidget({
                ...elasticSearchAvailabilitySlo,
                sloWindow: Windows.thirtyDays,
                title: `${elasticSearchAvailabilitySlo.title} - Availability`,
              }),
            );
            break;
          case 'ElasticSearchLatency':
            const esLatencySlo = slo as ElasticSearchLatencySLO;
            lastRow.push(
              new ElasticSearchLatencyWidget({
                ...esLatencySlo,
                sloWindow: Windows.thirtyDays,
                title: `${esLatencySlo.title} - Latency ${esLatencySlo.latencyThreshold}ms`,
              }),
            );
            break;
          default:
            throw new Error(
              `PerformanceDashboard creation encountered an unknown type for slo: ${JSON.stringify(slo)}.`,
            );
        }
        return result;
      },
      [[]] as any,
    );

    const defaultProps = {
      widgets,
      start: '-P360D',
    };

    super(scope, id, { ...defaultProps, ...props });
  }
}
