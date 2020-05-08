import * as cdk from '@aws-cdk/core'
import * as iam from '@aws-cdk/aws-iam'
import * as secrets from '@aws-cdk/aws-secretsmanager'

// CDK Configuration
const app = new cdk.App();
const stack = new cdk.Stack(app, 'Stack');

// Resources
const user = new iam.User(stack, 'User');


const userSecret = JSON.Stringify({
  accessKey: user.ref,
  secretKey: cdk.Fn.getAtt(user, 'SecretKey')
});

new secrets.CfnSecret(stack, 'Secret', {
  SecretString: userSecret
});
