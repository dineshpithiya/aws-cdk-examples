import { Duration, 
    Stack, 
    StackProps, 
    CfnOutput } from 'aws-cdk-lib';
  import { Construct } from 'constructs';
  import * as ssm from 'aws-cdk-lib/aws-ssm';
  import * as cdk from 'aws-cdk-lib';
  import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
    
  export class Database extends Construct {
    itemTable: any;
    constructor(scope: Construct, name: string, props?: StackProps) {
        super(scope, name);

        this.itemTable = new dynamodb.Table(this, 'item', {
            tableName:cdk.PhysicalName.GENERATE_IF_NEEDED,
            partitionKey: {
            name: 'id',
            type: dynamodb.AttributeType.STRING
            },
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            timeToLiveAttribute:"ttl"
        })
    }
} 