import {StackProps, Stack} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import {  RestApi } from 'aws-cdk-lib/aws-apigateway';
import * as cdk from 'aws-cdk-lib';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as path from 'path';
import {Waf} from "../../_shared/waf"
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';

export class Authorizer extends Construct  {
  authFun: any;
  constructor(scope: Construct, name: string, props?: StackProps) {
    super(scope, name);
    
    this.authFun = new lambda.Function(this, 'jwtAuthorizer', {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset(path.join(__dirname, 'jwt')),
      handler: 'index.handler'
    });
    let resource_arn = `arn:aws:ssm:${Stack.of(this).region}:${Stack.of(this).account}:parameter/dpn/config/rest-api/jwt-secret`
    this.authFun.addToRolePolicy(new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['ssm:GetParameter'],
        resources: [resource_arn],
      }))
  }
}