#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { ApiGatewaySSMStack } from './stacks/api-gateway-ssm';

const app = new cdk.App();
new ApiGatewaySSMStack(app, 'ApiGatewaySSMStack');
