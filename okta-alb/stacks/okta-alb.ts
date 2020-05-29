import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as elb from '@aws-cdk/aws-elasticloadbalancingv2';
import * as targets from '@aws-cdk/aws-elasticloadbalancingv2-targets';
import * as lambda from '@aws-cdk/aws-lambda';
import * as acm from '@aws-cdk/aws-certificatemanager';

export class OktaAlbStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'Vpc');

    const alb = new elb.ApplicationLoadBalancer(this, 'LoadBalancer', {
      internetFacing: true,
      vpc
    });

    // Redirect HTTP to HTTPS
    alb.addListener('HttpListener', {
      port: 80,
      protocol: elb.ApplicationProtocol.HTTP,
      defaultAction: elb.ListenerAction.redirect({ port: '443' })
    });

    const certificate = new acm.Certificate(this, 'Certificate', {
      domainName: '*.mkpkg.com'
    });

    const listener = alb.addListener('HttpsListener', {
      port: 443,
      protocol: elb.ApplicationProtocol.HTTPS,
      certificates: [
        elb.ListenerCertificate.fromCertificateManager(certificate)
      ]
    });

    // Lambda Handler
    const handler = new lambda.Function(this, 'Handler', {
      code: lambda.Code.fromAsset('./function'),
      handler: 'index.handler',
      runtime: lambda.Runtime.NODEJS_12_X
    });

    // Attach Handlers to Listener
    const targetGroup = listener.addTargets('Targets', {
      targets: [new targets.LambdaTarget(handler)]
    });

    // Add OIDC Configuration
    // listener.addAction('Authentication', {
    //   pathPatterns: ['/protected/*', '/oauth*'],
    //   priority: 1,
    //   action: elb.ListenerAction.authenticateOidc({
    //     authorizationEndpoint: cdk.SecretValue.secretsManager('okta/protected-app/secrets', {
    //       jsonField: 'authorizationEndpoint'
    //     }).toString(),
    //     clientId: cdk.SecretValue.secretsManager('okta/protected-app/secrets', {
    //       jsonField: 'clientId'
    //     }).toString(),
    //     clientSecret: cdk.SecretValue.secretsManager('okta/protected-app/secrets', {
    //       jsonField: 'clientSecret'
    //     }),
    //     issuer: cdk.SecretValue.secretsManager('okta/protected-app/secrets', {
    //       jsonField: 'issuer'
    //     }).toString(),
    //     tokenEndpoint: cdk.SecretValue.secretsManager('okta/protected-app/secrets', {
    //       jsonField: 'tokenEndpoint'
    //     }).toString(),
    //     userInfoEndpoint: cdk.SecretValue.secretsManager('okta/protected-app/secrets', {
    //       jsonField: 'userInfoEndpoint'
    //     }).toString(),
    //     onUnauthenticatedRequest: elb.UnauthenticatedAction.AUTHENTICATE,
    //     scope: 'openid',
    //     sessionTimeout: cdk.Duration.seconds(43200),
    //     next: elb.ListenerAction.forward([targetGroup])
    //   })
    // });
  }
}
