import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import {Api} from "./api/infrastructure"
import {Database} from "./database/infrastructure"

export class Backend extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const websiteUrl = ssm.StringParameter.valueFromLookup(this, '/dpn/config/web/url')

    let db = new Database(this, 'Database')
    let item = new Api(this,'Api',db.itemTable)
  }
}