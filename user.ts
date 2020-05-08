import * as cdk from '@aws-cdk/core'
import * as iam from '@aws-cdk/aws-iam'
import * as secrets from '@aws-cdk/aws-secretsmanager'

// CDK Configuration
const app = new cdk.App();
const stack = new cdk.Stack(app, 'Stack');

const username = 'test-user';

const serial = parseInt(stack.node.tryGetContext('serial'));

// Resources
const user = new iam.User(stack, 'User', {
  userName: username
});

const key = new iam.CfnAccessKey(stack, 'AccessKey', {
  serial,
  userName: user.userName,
  status: 'Active'
});

const userSecret = JSON.stringify({
  accessKey: key.ref,
  secretKey: key.attrSecretAccessKey
});

new secrets.CfnSecret(stack, 'Secret', {
  secretString: userSecret
});

