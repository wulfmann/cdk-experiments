import * as ag from '@aws-cdk/aws-apigateway';
import * as iam from '@aws-cdk/aws-iam';

export interface GetParameterProps {
    parameterName: string;
    role: iam.Role | iam.IRole;
}

export class SSMIntegration {
    public static getParameter(props: GetParameterProps, options?: ag.IntegrationOptions) {
        return new ag.AwsIntegration({
            service: 'ssm',
            action: 'GetParameter',
            actionParameters: {
                Name: props.parameterName
            },
            integrationHttpMethod: 'GET',
            options: {
                credentialsRole: props.role,
                ...options
            }
        })
    }
}