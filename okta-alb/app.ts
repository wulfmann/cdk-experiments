#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { OktaAlbStack } from './stacks/okta-alb';

const app = new cdk.App();
new OktaAlbStack(app, 'OktaAlbStack');
