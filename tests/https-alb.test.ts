import { expect, haveResource } from '@aws-cdk/assert';
import ec2 = require('@aws-cdk/aws-ec2');
import { Stack } from '@aws-cdk/core';
import { HttpsAlb } from '../src/index';

test('HttpsAlb is internet facing', () => {
  const stack = new Stack();
  const vpc = new ec2.Vpc(stack, 'Stack');
  const alb = new HttpsAlb(stack, 'PublicLoadBalancer', {
    certificateArns: [''],
    internetFacing: true,
    vpc,
  });
  expect(stack).to(
    haveResource('AWS::ElasticLoadBalancingV2::LoadBalancer', {
      Scheme: 'internet-facing',
    }),
  );
});

test('HttpsAlb creates a SecurityGroup that allows inbound from anywhere on http and https', () => {
  const stack = new Stack();
  const vpc = new ec2.Vpc(stack, 'testVpc');
  const alb = new HttpsAlb(stack, 'testPublicLoadBalancer', {
    certificateArns: ['testCertificateArn'],
    internetFacing: true,
    vpc,
  });
  expect(stack).to(
    haveResource('AWS::EC2::SecurityGroup', {
      GroupDescription: 'Automatically created Security Group for ELB testPublicLoadBalancer',
      SecurityGroupIngress: [
        {
          CidrIp: '0.0.0.0/0',
          Description: 'Allow from anyone on port 80',
          FromPort: 80,
          IpProtocol: 'tcp',
          ToPort: 80,
        },
        {
          CidrIp: '0.0.0.0/0',
          Description: 'Allow from anyone on port 443',
          FromPort: 443,
          IpProtocol: 'tcp',
          ToPort: 443,
        },
      ],
      VpcId: {
        Ref: 'testVpcCB3A84F3',
      },
    }),
  );
});

test('HttpsAlb adds a redirect from http to https that does not rewrite anything', () => {
  const stack = new Stack();
  const vpc = new ec2.Vpc(stack, 'testVpc');
  const alb = new HttpsAlb(stack, 'testPublicLoadBalancer', {
    certificateArns: ['testCertificateArn'],
    internetFacing: true,
    vpc,
  });
  expect(stack).to(
    haveResource('AWS::ElasticLoadBalancingV2::Listener', {
      DefaultActions: [
        {
          RedirectConfig: {
            Host: '#{host}',
            Path: '/#{path}',
            Port: '443',
            Protocol: 'HTTPS',
            Query: '#{query}',
            StatusCode: 'HTTP_301',
          },
          Type: 'redirect',
        },
      ],
      LoadBalancerArn: {
        Ref: 'testPublicLoadBalancer86E32544',
      },
      Port: 80,
      Protocol: 'HTTP',
    }),
  );
});

test('HttpsAlb adds a https listener with a default action to 404', () => {
  const stack = new Stack();
  const vpc = new ec2.Vpc(stack, 'testVpc');
  const alb = new HttpsAlb(stack, 'testPublicLoadBalancer', {
    certificateArns: ['testCertificateArn'],
    internetFacing: true,
    vpc,
  });
  expect(stack).to(
    haveResource('AWS::ElasticLoadBalancingV2::Listener', {
      Certificates: [
        {
          CertificateArn: 'testCertificateArn',
        },
      ],
      DefaultActions: [
        {
          FixedResponseConfig: {
            StatusCode: '404',
          },
          Type: 'fixed-response',
        },
      ],
      LoadBalancerArn: {
        Ref: 'testPublicLoadBalancer86E32544',
      },
      Port: 443,
      Protocol: 'HTTPS',
      SslPolicy: 'ELBSecurityPolicy-2016-08',
    }),
  );
});
