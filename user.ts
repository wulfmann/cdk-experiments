import * as cdk from '@aws-cdk/core'
import * as iam from '@aws-cdk/aws-iam'

// CDK Configuration
const app = new cdk.App();
const stack = new cdk.Stack(app, 'Stack');

// Resources
const user = new iam.User(stack, 'User');
