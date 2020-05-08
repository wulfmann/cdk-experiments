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

## Usage

You can easily fetch the secure value and use the keys to expose in the environment or create a new session with.

An example can be found [Here](/managed-user/examples/example_deploy_script.py).
