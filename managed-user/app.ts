import * as cdk from '@aws-cdk/core'
import * as iam from '@aws-cdk/aws-iam'
import { ManagedUser } from './constructs/managed-user';

// CDK Configuration
const app = new cdk.App();
const stack = new cdk.Stack(app, 'test-managed-user-stack');

const { user } = new ManagedUser(stack, 'ManagedUser', {
  username: 'test-user'
});

user.addToPolicy(
  new iam.PolicyStatement({
    actions: ['*'],
    resources: ['*']
  })
)
