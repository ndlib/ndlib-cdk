# NDLIB CDK - Service Level Objectives

Creates Cloudwatch Dashboards and Alarms from a list of SLOs based on the Google SRE workbook for [Alerting on SLOs](https://landing.google.com/sre/workbook/chapters/alerting-on-slos/)

```typescript
const slos = [
  {
    type: 'CloudfrontAvailability',
    distributionId: 'E123456789ABC',
    title: 'My Website',
    sloThreshold: 0.999,
  },
  {
    type: 'CloudfrontLatency',
    distributionId: 'E123456789ABC',
    title: 'My Website',
    sloThreshold: 0.95,
    latencyThreshold: 200,
  },
];
const stack = new cdk.Stack();

// Create a dashboard that shows the 30 day performance of all of our SLOs
const perfDash = new SLOPerformanceDashboard(stack, 'PerformanceDashboard', {
  slos,
  dashboardName: 'PerformanceDashboard',
});

// Create the multi-window alarms for each of the SLOs. This will also create an SNS topic that will
// receive the alerts. The alarm will include links to the dashboards and runbooks given in its
// description.
const alarms = new SLOAlarms(stack, 'Alarms', {
  slos,
  dashboardLink: `https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=My-Website`,
  runbookLink: 'https://github.com/myorg/myrunbooks',
});
```

## Alarm Actions

The `SLOAlarms` Construct does not manage what actions to perform when alarms are raised. Instead, the alarm topics for each severity are exposed variables, allowing you to add subscriptions to them. For example, to add an email notification when both High and Low severity alarms are triggered:

```typescript
import * as subs from '@aws-cdk/aws-sns-subscriptions';
alarms.topics.High.addSubscription(new subs.EmailSubscription('myemail@mydomain'));
alarms.topics.Low.addSubscription(new subs.EmailSubscription('myemail@mydomain'));
```

## Silencing Alarms

Alarms created by the `SLOAlarms` construct can be silenced by specifying which severities should be enabled within an alarmsEnabled object in the SLO. The following example will create a Cloudfront Availability SLO, but will disable both High and Low severity alarms:

```typescript
  {
    type: 'CloudfrontAvailability',
    distributionId: 'E123456789ABC',
    title: 'My Website',
    sloThreshold: 0.999,
    alarmsEnabled: {
      High: false,
      Low: false,
    },
  },
```

## Alarm Limitations

[Google recommends](https://sre.google/workbook/alerting-on-slos/#recommended_parameters_for_an_slo_based_a) using a 3 day period for the long window of low severity issues. AWS can only base alarms on a maximum of a 1 day period. The current implementation for Low Severity alarms continues to use a 10% error budget within 1 day instead of 3, which may make Low Severity alarms too sensitive. A future improvement may require calculating more appropriate error budget and window sizes for the Low Severity alarms.

## Supported SLO Types

The following is a list of the supported SLO types, required fields for the type, and the metric(s) used in calculating a Service Level Indicator for that type.

### Cloudfront Availablity

Type: `CloudfrontAvailability`  
SLIs: [5xxErrorRate](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/viewing-cloudfront-metrics.html)  
Required: `distributionId`  
Example:

```typescript
{
  type: 'CloudfrontAvailability',
  distributionId: 'E123456789ABC',
  title: 'HTTPS - CDN',
  sloThreshold: 0.999,
},
```

### Cloudfront Latency

Type: `CloudfrontLatency`  
SLIs: [OriginLatency](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/viewing-cloudfront-metrics.html)  
Required: `distributionId`  
Example:

```typescript
  {
    type: 'CloudfrontLatency',
    distributionId: 'E123456789ABC',
    title: 'HTTPS - CDN',
    sloThreshold: 0.95,
    latencyThreshold: 200,
  },
```

Additional metrics must be enabled on the Cloudfront in order for the `CloudfrontLatency` type to work. See [Enabling additional metrics](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/viewing-cloudfront-metrics.html#monitoring-console.distributions-additional)

#### Cloudfront Latency Limitations

The `OriginLatency` metric does not correctly represent the latencies for all requests. It only represents the latencies when Cloudfront has to make a request to the origin (cache misses). It is recommended you collect statistics from the Cloudfront logs for all requests to calculate the latency threshold to use for the SLO. For example, if your users expect 95% of all requests to be 100ms or faster, and you find that the p95 of cache misses take 2x as long as compared to the p95 of all requests, then you would need to specify a `latencyThreshold` of 200 instead of 100. For example, assuming you've pulled the Cloudfront logs into an Athena table, you can run the following query:

```SQL
SELECT
  "year"("date") "year"
, "month"("date") "month"
, "sum"(IF(("result_type" IN ('Miss', 'RefreshHit')), 1, 0)) "count_origin"
, "count"(*) "count_all"
, "approx_percentile"(IF(("result_type" IN ('Miss', 'RefreshHit')), "time_taken", null), 0.95) "p95_origin"
, "approx_percentile"("time_taken", 0.95) "p95_all"
, ("approx_percentile"(IF(("result_type" IN ('Miss', 'RefreshHit')), "time_taken", null), 0.95) / "approx_percentile"("time_taken", 0.95)) "p95_scale"
FROM
  unified_website_cloudfront_logs
GROUP BY "year"("date"), "month"("date")
ORDER BY "year"("date") DESC, "month"("date") DESC
```

It's important to note that using this method makes a lot of assumptions about the distribution of latencies. For instance, it assumes that the distribution for cache misses strongly correlates with the distribution of all requests. This _should_ generally be true when serving up static files from an origin such as S3, but this may not be the case with other origins. Additionally, since calculating this multiplier must be manually performed, if the files served out from the Cloudfront change over time, this could cause false positives or negatives if you don't continuously check that the multiplier used still correctly represents the behavior of the origin. Unforunately, at the moment, this is the closest approximation that we can use as the SLI for Cloudfront latencies.

### API Gateway Availability

Type: `ApiAvailability`  
SLIs: [5XXError,Count](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-metrics-and-dimensions.html)  
Required: `apiName`  
Example:

```typescript
  {
    type: 'ApiAvailability',
    apiName: 'myapi-prod',
    title: 'Backend API',
    sloThreshold: 0.99,
  },
```

### API Gateway Latency

Type: `ApiLatency`  
SLIs: [Latency](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-metrics-and-dimensions.html)  
Required: `apiName`  
Example:

```typescript
  {
    type: 'ApiLatency',
    apiName: 'myapi-prod',
    title: 'Backend API',
    sloThreshold: 0.95,
    latencyThreshold: 2000,
  },
```

### AppSync API Availability

Type: `AppSyncAvailability`  
SLIs: [5XXError](https://docs.aws.amazon.com/appsync/latest/devguide/monitoring.html#cw-metrics)  
Required: `apiId`  
Example:

```typescript
  {
    type: 'AppSyncAvailability',
    apiId: 'myAppSyncAPI-prod',
    title: 'AppSync API',
    sloThreshold: 0.99,
  },
```

### AppSync API Latency

Type: `AppSyncLatency`  
SLIs: [Latency](https://docs.aws.amazon.com/appsync/latest/devguide/monitoring.html#cw-metrics)  
Required: `apiId`  
Example:

```typescript
  {
    type: 'AppSyncLatency',
    apiId: 'myAppSyncAPI-prod',
    title: 'AppSync API',
    sloThreshold: 0.95,
    latencyThreshold: 2000,
  },
```

### Elasticsearch Availability

Type: `ElasticSearchAvailability`  
SLIs: [2xx, 3xx, 4xx, 5xx](https://docs.aws.amazon.com/elasticsearch-service/latest/developerguide/es-managedomains-cloudwatchmetrics.html#es-managedomains-cloudwatchmetrics-cluster-metrics)  
Required: `domainName`, `accountId`  
Example:

```typescript
  {
    type: 'ElasticSearchAvailability',
    domainName: 'myes-prod',
    accountId: '1234567890',
    title: 'Search API',
    sloThreshold: 0.99999,
  },
```

### Elasticsearch Latency

Type: `ElasticSearchLatency`  
SLIs: [SearchLatency](https://docs.aws.amazon.com/elasticsearch-service/latest/developerguide/es-managedomains-cloudwatchmetrics.html#es-managedomains-cloudwatchmetrics-instance-metrics)  
Required: `domainName`, `accountId`  
Example:

```typescript
  {
    type: 'ElasticSearchLatency',
    domainName: 'myes-prod',
    accountId: '1234567890',
    title: 'Search API',
    sloThreshold: 0.99,
    latencyThreshold: 100,
  },
```

### Custom Availability

All other SLOs that are based on built-in AWS metrics will use the appropriate SLIs for the service. There may be cases where you need to use a custom metric as an SLO. In this case, you must provide metric information and ensure that the metric data is accurate. For an Availability metric, provide an error count and a request count metric, and the availability SLI will be calculated from these.

Type: `CustomAvailability`  
SLIs: Custom  
Required: `namespace`, `errorsMetricName`, `countsMetricName`  
Example:

```typescript
  {
    type: 'CustomAvailability',
    namespace: 'CustomNamespace',
    errorsMetricName: 'CustomErrorCountMetric',
    countsMetricName: 'CustomRequestCountMetric',
    title: 'My Custom Availability',
    sloThreshold: 0.99,
  },
```

This assumes metrics are already generated for the service. As an example, assuming you are pushing [nginx logs](https://www.nginx.com/blog/using-nginx-logging-for-application-performance-monitoring/) to CloudWatch, you could create [CloudWatch Metric Filters](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/MonitoringPolicyExamples.html) to extract request and error counts for the root of the site:

```typescript
import * as cw from '@aws-cdk/aws-logs';
new cw.MetricFilter(this, 'CustomRequestCountMetric', {
  metricName: 'CustomRequestCountMetric',
  metricNamespace: 'CustomNamespace',
  logGroup,
  filterPattern: cw.FilterPattern.literal(
    '[ip, user, timestamp, request="GET / HTTP*", status, size, request_time, upstream_response_time, upstream_connect_time, upstream_header_time]',
  ),
  metricValue: '1',
});
new cw.MetricFilter(this, 'CustomErrorCountMetric', {
  metricName: 'CustomErrorCountMetric',
  metricNamespace: 'CustomNamespace',
  logGroup,
  filterPattern: cw.FilterPattern.literal(
    '[ip, user, timestamp, request="GET / HTTP*", status=5*, size, request_time, upstream_response_time, upstream_connect_time, upstream_header_time]',
  ),
  metricValue: '1',
  defaultValue: 0,
});
```

### Custom Latency

Similar to `CustomAvailability`, you can create an SLO based on a custom latency metric as long as the namespace and metric name are provided.

Type: `CustomLatency`  
SLIs: Custom  
Required: `namespace`, `latencyMetricName`  
Example:

```typescript
  {
    type: 'CustomLatency',
    namespace: 'CustomNamespace',
    latencyMetricName: 'CustomLatencyMetric',
    title: 'My Custom Latency',
    sloThreshold: 0.99,
    latencyThreshold: 2000,
  },
```

This assumes metrics are already generated for the service. As an example, assuming you are pushing [nginx logs](https://www.nginx.com/blog/using-nginx-logging-for-application-performance-monitoring/) to CloudWatch, you could create a [CloudWatch Metric Filter](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/MonitoringPolicyExamples.html) to extract latencies for the root of the site:

```typescript
new cw.MetricFilter(this, 'CustomLatencyMetric', {
  metricName: 'CustomLatencyMetric',
  metricNamespace: 'CustomNamespace',
  logGroup,
  filterPattern: cw.FilterPattern.literal(
    '[ip, user, timestamp, request="GET / HTTP*", status, size, request_time, upstream_response_time, upstream_connect_time, upstream_header_time]',
  ),
  metricValue: '$request_time',
});
```

## Optional - Alarms Dashboard

You can render a dashboard that shows the calculations for each window size used by the alarms. This is an optional dashboard and is not required for the Alarms to work. It has mostly proved to be a useful resource during development of these SLO constructs to examine if the Alarms are working the way we would expect.

```typescript
const alarmsDash = new SLOAlarmsDashboard(stack, 'AlarmsDashboard', {
  slos,
  dashboardName: 'AlarmsDashboard',
});
const alarmsDashboardName = Fn.ref((alarmsDash.node.defaultChild as CfnDashboard).logicalId);

// Create the multi-window alarms for each of the SLOs. This will also create an SNS topic that will
// receive the alerts. The alarm will include links to the dashboards and runbooks given in its
// description.
const alarms = new SLOAlarms(stack, 'Alarms', {
  slos,
  dashboardLink: `https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=My-Website`,
  runbookLink: 'https://github.com/myorg/myrunbooks',
  alarmsDashboardLink: `https://console.aws.amazon.com/cloudwatch/home?region=${
    cdk.Stack.of(this).region
  }#dashboards:name=${alarmsDashboardName}`,
});
```
