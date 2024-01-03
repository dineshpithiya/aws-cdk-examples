#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { Backend } from '../lib/component';
import {APP_NAME,PIPELINE_APP_NAME} from "../constants"
//import {CodepipelineSample} from "../codepipeline/infrastructure"

const app = new cdk.App();
new Backend(app, 
    'Backend',{
    stackName:APP_NAME,
    env: {
        region: process.env.CDK_DEFAULT_REGION,
        account: process.env.CDK_DEFAULT_ACCOUNT
    }
});
/*
new CodepipelineSample(app, 
    'Pipeline',{
    stackName:PIPELINE_APP_NAME,
    env: {
        region: process.env.CDK_DEFAULT_REGION,
        account: process.env.CDK_DEFAULT_ACCOUNT
    }
});*/