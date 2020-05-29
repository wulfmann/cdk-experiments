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

    // Lambda Handlers
    const publicHandler = new lambda.Function(this, 'PublicHandler', {
      code: lambda.Code.fromAsset('./functions/public'),
      handler: 'index.handler',
      runtime: lambda.Runtime.NODEJS_12_X
    });

    const privateHandler = new lambda.Function(this, 'PrivateHandler', {
      code: lambda.Code.fromAsset('./functions/private'),
      handler: 'index.handler',
      runtime: lambda.Runtime.NODEJS_12_X
    });

    const defaultTargetGroup = new elb.ApplicationTargetGroup(this, 'DefaultTargetGroup', {
      targets: [
        new targets.LambdaTarget(publicHandler)
      ]
    });

    const privateTargetGroup = new elb.ApplicationTargetGroup(this, 'PrivateTargetGroup', {
      targets: [
        new targets.LambdaTarget(privateHandler)
      ]
    });

    // Redirect HTTP to HTTPS
    alb.addListener('HttpListener', {
      port: 80,
      protocol: elb.ApplicationProtocol.HTTP,
      defaultAction: elb.ListenerAction.redirect({
        protocol: elb.ApplicationProtocol.HTTPS,
        port: '443'
      })
    });

    // Create new certificate for https listener
    const certificate = new acm.Certificate(this, 'Certificate', {
      domainName: '*.mkpkg.com'
    });

    const listener = alb.addListener('HttpsListener', {
      port: 443,
      defaultTargetGroups: [defaultTargetGroup],
      protocol: elb.ApplicationProtocol.HTTPS,
      certificates: [
        elb.ListenerCertificate.fromCertificateManager(certificate)
      ]
    });

    listener.addTargetGroups('TargetGroups', {
      targetGroups: [
        privateTargetGroup
      ],
      pathPattern: '/protected/*',
      priority: 2
    });

    listener.addAction('Authentication', {
      pathPatterns: ['/protected/*', '/oauth*'],
      priority: 1,
      action: elb.ListenerAction.authenticateOidc({
        authorizationEndpoint: cdk.SecretValue.secretsManager('okta/protected-app/secrets', {
          jsonField: 'authorizationEndpoint'
        }).toString(),
        clientId: cdk.SecretValue.secretsManager('okta/protected-app/secrets', {
          jsonField: 'clientId'
        }).toString(),
        clientSecret: cdk.SecretValue.secretsManager('okta/protected-app/secrets', {
          jsonField: 'clientSecret'
        }),
        issuer: cdk.SecretValue.secretsManager('okta/protected-app/secrets', {
          jsonField: 'issuer'
        }).toString(),
        tokenEndpoint: cdk.SecretValue.secretsManager('okta/protected-app/secrets', {
          jsonField: 'tokenEndpoint'
        }).toString(),
        userInfoEndpoint: cdk.SecretValue.secretsManager('okta/protected-app/secrets', {
          jsonField: 'userInfoEndpoint'
        }).toString(),
        onUnauthenticatedRequest: elb.UnauthenticatedAction.AUTHENTICATE,
        scope: 'openid',
        sessionTimeout: cdk.Duration.seconds(43200),
        next: elb.ListenerAction.forward([privateTargetGroup])
      })
    });
  }
}
