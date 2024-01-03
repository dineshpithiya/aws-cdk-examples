# Welcome to your CDK TypeScript project

You should explore the contents of this project. It demonstrates a CDK app with an instance of a stack (`CodebuildStack`)
which contains an Amazon SQS queue that is subscribed to an Amazon SNS topic.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

Disable ssl verification in windows if return error like
-   Need to perform AWS calls for account xxx, but no credentials have been configured
```
$   SET NODE_TLS_REJECT_UNAUTHORIZED=0
```

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current states
* `cdk synth`       emits the synthesized CloudFormation template
