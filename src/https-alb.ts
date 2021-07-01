import elbv2 = require('@aws-cdk/aws-elasticloadbalancingv2')
import cdk = require('@aws-cdk/core')

export interface IHttpsAlbProps extends elbv2.ApplicationLoadBalancerProps {
  /**
   * The certificate used to terminate SSL at the ALB
   */
  readonly certificateArns: string[]
}

export class HttpsAlb extends elbv2.ApplicationLoadBalancer {
  /**
   * This is the default SSL listener. Attach additional rules
   * to this listener using new elbv2.ApplicationListenerRule.
   */
  public readonly defaultListener: elbv2.ApplicationListener

  /**
   * Defines a public Application Load Balancer with an SSL listener that 404's by default,
   * and redirects all http traffic to https.
   *
   * @param scope The scope in which to define this construct
   * @param id The scoped construct ID. Must be unique amongst siblings. If
   * the ID includes a path separator (`/`), then it will be replaced by double
   * dash `--`.
   * @param props IHttpsAlbProps properties.
   */
  constructor(scope: cdk.Construct, id: string, props: IHttpsAlbProps) {
    super(scope, id, props)

    this.addHttpRedirect()

    // Add https listener that by default 404s until other rules are added.
    this.defaultListener = this.addListener('HttpsListener', {
      certificateArns: props.certificateArns,
      open: true,
      port: 443,
      protocol: elbv2.ApplicationProtocol.HTTPS,
      sslPolicy: elbv2.SslPolicy.RECOMMENDED,
    })
    this.defaultListener.addFixedResponse('Default404', {
      statusCode: '404',
    })

    // Adding an output of the dns name for convenience when looking at this
    // in the console/cli.
    new cdk.CfnOutput(scope, 'PublicLoadBalancerDNSName', {
      description: 'The DNS name of the load balancer',
      value: this.loadBalancerDnsName,
    })
  }

  private addHttpRedirect() {
    // Add a listener to redirect http to https
    const httpListener = this.addListener('HttpListener', {
      open: true,
      port: 80,
      protocol: elbv2.ApplicationProtocol.HTTP,
    })
    // Ideally this can be removed, and the CfnListener below can be rewritten once
    // cdk adds support for adding a redirect rule as the default.
    // See https://github.com/aws/aws-cdk/issues/2563.
    httpListener.addFixedResponse('Default404', {
      statusCode: '404',
    })
    const cfnHttpListener = httpListener.node.defaultChild as elbv2.CfnListener
    cfnHttpListener.defaultActions = [
      {
        redirectConfig: {
          host: '#{host}',
          path: '/#{path}',
          port: '443',
          protocol: 'HTTPS',
          query: '#{query}',
          statusCode: 'HTTP_301', // Should probably use 308 here at this point? ALB doesn't support this.
        },
        type: 'redirect',
      },
    ]
  }
}
