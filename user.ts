import * as cdk from '@aws-cdk/core'
import * as iam from '@aws-cdk/aws-iam'
import * as secrets from '@aws-cdk/aws-secretsmanager'

// CDK Configuration
const app = new cdk.App();
const stack = new cdk.Stack(app, 'Stack');

// Resources
const user = new iam.User(stack, 'User', {
  userName: 'test-user'
});

const key = new iam.CfnAccessKey(stack, 'AccessKey', {
  serial: 1,
  userName: user.userName,
  status: 'Active'
});

const userSecret = JSON.stringify({
  accessKey: key.ref,
  secretKey: cdk.Fn.getAtt('AccessKey', 'SecretAccessKey')
});

new secrets.CfnSecret(stack, 'Secret', {
  secretString: userSecret
});
