import { Stack, aws_wafv2 } from 'aws-cdk-lib';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

const rules: Array<aws_wafv2.CfnWebACL.RuleProperty> = [
    {
      name: 'AWSManagedRulesCommonRuleSet',
      priority: 1,
      overrideAction: { none: {} },
      statement: {
        managedRuleGroupStatement: {
          name: 'AWSManagedRulesCommonRuleSet',
          vendorName: 'AWS'
        }
      },
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: 'AWSManagedRulesCommonRuleSet',
        sampledRequestsEnabled: true
      }
    },
    {
      name: 'awsAnonymousIP',
      priority: 2,
      overrideAction: {none: {}},
      statement: {
        managedRuleGroupStatement: {
          name: 'AWSManagedRulesAnonymousIpList',
          vendorName: 'AWS',
          excludedRules: []
        }
      },
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: 'awsAnonymous',
        sampledRequestsEnabled: true
      }
    },
    {
      name: 'awsIPReputation',
      priority: 3,
      overrideAction: {none: {}},
      statement: {
        managedRuleGroupStatement: {
          name: 'AWSManagedRulesAmazonIpReputationList',
          vendorName: 'AWS',
          excludedRules: []
        }
      },
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: 'awsReputation',
        sampledRequestsEnabled: true
      }
    },
    {
      name: 'IPRateLimit',
      priority: 4,
      action: {
        block: {}
      },
      statement: {
        rateBasedStatement: {
          aggregateKeyType: 'IP',
          limit: 1_000
        }
      },
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: 'IPRateLimit',
        sampledRequestsEnabled: true
      }
    }
];
  
export class Waf extends aws_wafv2.CfnWebACL {
    constructor(scope: Construct, id: string) {
        super(scope, id, {
            defaultAction: {
                allow: {}
            },
            scope: 'REGIONAL',
            visibilityConfig: {
                cloudWatchMetricsEnabled: true,
                metricName: 'WebACL',
                sampledRequestsEnabled: true
            },
            rules
        });
    }

    associateRestApi = (restApi: apigw.RestApi) => {
        const restApiArn = [
            `arn:aws:apigateway:${Stack.of(this).region}::`,
            'restapis',
            restApi.restApiId,
            'stages',
            restApi.deploymentStage.stageName
        ].join('/');

        new aws_wafv2.CfnWebACLAssociation(this, 'RestApiWebAclAssociation', {
            webAclArn: this.attrArn,
            resourceArn: restApiArn
        });
    };
}