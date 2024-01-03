import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import {Item} from "./item"
import {Authorizer} from "./authorization"
import {Layer} from "../_shared/layers/infrastructure"

export class Api extends Construct  {
    constructor(scope: Construct, name: string, itemTable:any ,props?: StackProps) {
      super(scope, name);

    const websiteUrl = ssm.StringParameter.valueFromLookup(this, '/dpn/config/web/url')
    let layer = new Layer(this, "Layer")
    let authorizer = new Authorizer(this,'Authorizer')
    let item = new Item(this,'Item',itemTable,authorizer.authFun, layer)
  }
}
