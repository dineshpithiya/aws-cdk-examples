import { Duration, 
    Stack, 
    StackProps, 
    CfnOutput } from 'aws-cdk-lib';
  import { Construct } from 'constructs';
  import * as lambda from 'aws-cdk-lib/aws-lambda';
  import * as cdk from 'aws-cdk-lib';
  import * as path from 'path';

  export class Layer extends Construct {
    boto3Layer: any;
    axiosLayer:any;
    constructor(scope: Construct, name: string, props?: StackProps) {
        super(scope, name);

        //Create boto3 layer for python
        this.boto3Layer = new lambda.LayerVersion(this, 'python boto3', {
            code: lambda.Code.fromAsset(path.join(__dirname, 'python_layers/boto3')),
            description: 'boto3 library',
            compatibleRuntimes: [lambda.Runtime.PYTHON_3_10],
            removalPolicy: cdk.RemovalPolicy.DESTROY
        })

        //Create axios layer for node js
        this.axiosLayer = new lambda.LayerVersion(this, 'nodeJs axios', {
            code: lambda.Code.fromAsset(path.join(__dirname,'nodejs_layers/axios')),
            description: 'axios package',
            compatibleRuntimes: [lambda.Runtime.NODEJS_16_X],
            removalPolicy: cdk.RemovalPolicy.DESTROY
        })
    }
} 