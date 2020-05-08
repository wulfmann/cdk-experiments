import * as cdk from '@aws-cdk/core'
import * as iam from '@aws-cdk/aws-iam'
import * as secrets from '@aws-cdk/aws-secretsmanager'

export enum Statuses {
    ACTIVE='Active',
    INACTIVE='Inactive'
}

export interface ManagedUserProps {
    readonly username: string;
    readonly status?: Statuses;
}

export interface IManagedUser extends cdk.IConstruct {
    readonly user: iam.User;
}

export abstract class ManagedUserBase extends cdk.Construct implements IManagedUser {
    public abstract readonly user: iam.User;
}

export class ManagedUser extends ManagedUserBase {
    public readonly user: iam.User;

    constructor(scope: cdk.Construct, id: string, props: ManagedUserProps) {
        super(scope, id);

        this.user = new iam.User(this, 'User', {
            userName: props.username
        });

        const serial = parseInt(this.node.tryGetContext('serial'));

        const userName = this.user.userName;

        const key = new iam.CfnAccessKey(this, 'AccessKey', {
            serial: serial || 1,
            userName,
            status: props.status || Statuses.ACTIVE
        });
          
        new secrets.CfnSecret(this, 'Secret', {
            secretString: JSON.stringify({
                AWS_ACCESS_KEY_ID: key.ref,
                AWS_SECRET_ACCESS_KEY: key.attrSecretAccessKey
            }),
            name: `users/${userName}`
        });
    }
}
