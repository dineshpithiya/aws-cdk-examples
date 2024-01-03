import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as codebuild from "aws-cdk-lib/aws-codebuild";
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';

export class CodepipelineSample extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // codebuild role
    const codebuildRole = new iam.Role(this, "CodeBuildRole", {
      roleName: id + "-codebuild-role",
      assumedBy: new iam.CompositePrincipal(
        new iam.ServicePrincipal('codebuild.amazonaws.com'),
        new iam.ServicePrincipal('codepipeline.amazonaws.com'),
        new iam.ServicePrincipal('codecommit.amazonaws.com')
      )
    });
    codebuildRole.addToPolicy(
      new iam.PolicyStatement({ effect: iam.Effect.ALLOW,resources: ["*"], actions: ["*"] })
    );
    const sourceOutput = new codepipeline.Artifact();
    const repository_by_name = codecommit.Repository.fromRepositoryName(this,"CDK-DEMO-Backend","CDK-DEMO-Backend")
    new codepipeline.Pipeline(this, 'MyPipeline', {
      pipelineName:"myDemoPipeline",
      stages: [
        {
          stageName: 'Source',
          actions: [new codepipeline_actions.CodeCommitSourceAction({
            actionName: 'CodeCommit', 
            branch:"main",
            repository:repository_by_name,
            output: sourceOutput,
          })],
        },
        {
          stageName: 'UnitTesting',
          actions: [new codepipeline_actions.CodeBuildAction({
            actionName: 'CodeBuild',
            project: new codebuild.PipelineProject(this, 'UnitTesting',{
              projectName: 'UnitTesting',
              description: 'Unit testing script',
              role:codebuildRole,
              buildSpec: codebuild.BuildSpec.fromSourceFilename("./scripts/unittest-buildspec.yml"),
              environment: {
                buildImage: codebuild.LinuxBuildImage.STANDARD_7_0
              }
            }),
            input: sourceOutput
          })],
        },
        {
          stageName: "DeployToProduction",
          actions: [new codepipeline_actions.ManualApprovalAction({
            actionName: "Approval",
          })]
        },
        {
          stageName: 'Deploy',
          actions: [new codepipeline_actions.CodeBuildAction({
            actionName: 'CodeBuild',
            project:new codebuild.PipelineProject(this, 'Deploy',{
              projectName: 'Deploy',
              description: 'Deploy code using codebuild',
              role:codebuildRole,
              buildSpec: codebuild.BuildSpec.fromSourceFilename("./scripts/buildspec.yml"),
              environment: {
                buildImage: codebuild.LinuxBuildImage.STANDARD_7_0
              }
            }),
            input: sourceOutput
          })],
        }
      ],
    });
  }
}
