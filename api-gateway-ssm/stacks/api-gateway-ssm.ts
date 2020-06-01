import * as cdk from '@aws-cdk/core';
import * as ag from '@aws-cdk/aws-apigateway';
import * as ssm from '@aws-cdk/aws-ssm';
import { SSMIntegration } from '../constructs/ssm-integration';
import * as iam from '@aws-cdk/aws-iam';

export class ApiGatewaySSMStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const parameterName = 'key-parameter';

        const parameter = new ssm.StringParameter(this, 'Parameter', {
            stringValue: 'my-key',
            parameterName,
            type: ssm.ParameterType.STRING
        });

        const role = new iam.Role(this, 'Role', {
            assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com')
        });

        parameter.grantRead(role);

        const api = new ag.RestApi(this, 'Api');
        const keyResource = api.root.addResource('key');
        keyResource.addCorsPreflight({ allowOrigins: ['*'] }); // Enable CORS

        const integration = SSMIntegration.getParameter({ parameterName, role }, {
            integrationResponses: [
                {
                    statusCode: '200',
                    responseTemplates: {
                        'application/json': JSON.stringify({
                            value: "$input.path('$.GetParameterResponse.GetParameterResult.Parameter.Value')"
                        })
                    }
                }
            ]
        });

        keyResource.addMethod('GET', integration, {
            methodResponses: [{ statusCode: '200' }]
        });
    }
}
