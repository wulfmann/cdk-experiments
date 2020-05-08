# managed-user

This example creates an IAM User and then creates a new access key associated with the user. It then stores both the access and secret keys in a secretsmanager secret.

You can cause the secret to rotate by incrementing the serial context variable.

## Run Locally

```bash
yarn
yarn cdk synth
```

To rotate key

```bash
yarn cdk synth -c serial=2
```