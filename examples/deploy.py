import os, json, sys
import boto3

def main():
    username = os.environ['USERNAME']
    client = boto3.client('secretsmanager')

    keys = client.get_secret_value(
        SecretId='users/{username}'.format(username=username)
    )['SecretString']

    os.environ.update(json.loads(keys))

    if sys.argv[1] == '--':
        command = sys.argv[2:]
    else:
        command = sys.argv[1:]

    os.system(' '.join(command))

if __name__ == "__main__":
    os.environ['USERNAME'] = 'test-user'
    main()
