import {StackProps, Stack} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import {  RestApi } from 'aws-cdk-lib/aws-apigateway';
import * as cdk from 'aws-cdk-lib';
import * as path from 'path';
import {Waf} from "../../_shared/waf"

export class Item extends Construct  {
  constructor(scope: Construct, name: string,itemTable:any,authFun:any,layer:any,props?: StackProps) {
    super(scope, name);
    
    const createItem = new lambda.Function(this, 'create', {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset(path.join(__dirname, 'create')),
      handler: 'index.handler',
      layers:[layer.axiosLayer],
      environment:{
        "DYNAMODB_TABLE_NAME":itemTable.tableName
      }
    });
    itemTable.grantReadWriteData(createItem)
    const createApi  = new RestApi(this, "create-item",{
      defaultCorsPreflightOptions:{
        allowOrigins:["*"]
      }
    })
    new Waf(this, 'create-item-waf').associateRestApi(createApi);
    const createModel = new apigw.Model(this, "create-item-model-validator", {
      restApi: createApi,
      contentType: "application/json",
      description: "To validate the request body",
      schema: {
        type: apigw.JsonSchemaType.OBJECT,
        required: ["name","language"],
        properties: {
          "name": { 
            type: apigw.JsonSchemaType.STRING
          },
          "language": { 
            type: apigw.JsonSchemaType.STRING,
            enum: ["en","es"]
          }
        },
      },
    });
    let createApiResource="create-item"
    createApi.root.addResource(createApiResource).addMethod("POST", proxyIntegration(createItem),{
      authorizer:new apigw.TokenAuthorizer(this,'CreateItemAuthorizer',{
        handler:authFun
      }),
      authorizationType: apigw.AuthorizationType.CUSTOM,
      requestValidator: new apigw.RequestValidator(
          this,
          "create-item-body-validator",
          {
            restApi: createApi,
            requestValidatorName: "body-validator",
            validateRequestBody: true,
          }
        ),
        requestModels: {
          "application/json": createModel,
        },
        methodResponses:methodResponses()
    });
    new cdk.CfnOutput(this, 'cdfCreateItem', {
      value: `${createApi.url}${createApiResource}`,
      description: 'Create item rest url',
      exportName: 'CREATE-ITEM-URL',
    });

    const getItem = new lambda.Function(this, 'get', {
      handler: 'index.handler',
      runtime: lambda.Runtime.NODEJS_16_X,
      environment:{DYNAMODB_TABLE_NAME: itemTable.tableName},
      memorySize: 256,
      code: lambda.Code.fromAsset(path.join(__dirname, 'get')),
      layers:[layer.axiosLayer]
    });
    itemTable.grantReadWriteData(getItem);
    const getItemApi  = new RestApi(this, "get-item",{
      defaultCorsPreflightOptions:{
        allowOrigins:["*"]
      }
    })
    let getItemApiResource="get-item"
    getItemApi.root.addResource(getItemApiResource).addMethod("GET", proxyIntegration(getItem),{
      authorizer:new apigw.TokenAuthorizer(this,'GetItemAuthorizer',{
        handler:authFun
      }),
      authorizationType: apigw.AuthorizationType.CUSTOM,
      methodResponses:methodResponses()
    });
    new Waf(this, 'get-item-waf').associateRestApi(getItemApi);
    new cdk.CfnOutput(this, 'cfnGetItemRestApi', {
      value: `${getItemApi.url}${getItemApiResource}`,
      description: 'Get item rest url',
      exportName: 'GET-ITEM-URL',
    });
  }
}

export function proxyIntegration(lambdaFn: any) {
  //https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-override-request-response-parameters.html#apigateway-override-request-response-parameters-override-response
  let proxyIntegration = new apigw.LambdaIntegration(lambdaFn,{
    proxy: false,
    passthroughBehavior: apigw.PassthroughBehavior.WHEN_NO_MATCH,
    integrationResponses: [
      {
        statusCode: "200",
        responseParameters: {
          'method.response.header.Access-Control-Allow-Origin': "'*'",
        },
        responseTemplates:{
          "application/json":`
            #set($inputRoot = $input.path('$'))
            $input.json("$")
            #if($inputRoot.toString().contains("errorMessage"))
                #set($context.responseOverride.status = 500)
            #else
                #if($inputRoot.toString().contains("error"))
                    #set($context.responseOverride.status = 500)
                    #set($context.requestOverride.body = "something wrong")
                #end
            #end`
        }
      }
    ],
  });
  return proxyIntegration
}
export function methodResponses(){
  let methodResponses = [
    {
      statusCode: '200',
      responseModels: {
        'application/json': apigw.Model.EMPTY_MODEL,
      },
      responseParameters: {
        'method.response.header.Access-Control-Allow-Headers': true,
        'method.response.header.Access-Control-Allow-Methods': true,
        'method.response.header.Access-Control-Allow-Credentials': true,
        'method.response.header.Access-Control-Allow-Origin': true
      }
    }
  ]
  return methodResponses
}