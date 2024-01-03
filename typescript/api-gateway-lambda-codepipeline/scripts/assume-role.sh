#!/bin/bash

# Updates the default profile with STS credentials for given role
# CodeBuild executing cdk will use these credentails by default when no env is specificed for cdk

ROLE_ARN=$1
PROFILE=default

TARGET_ACCOUNTID=`echo $ROLE_ARN | awk '{split($0,a,":"); print a[5]}'`
STS=`aws sts assume-role --role-arn $ROLE_ARN --role-session-name codebuild`

# Confirm role assumption was successful
if [ $? != 0 ]; then
  echo "Failed to assume role ${ROLE_ARN}."
  exit 1
fi

AWS_ACCESS_KEY_ID=$(echo "${STS}" | jq -r '.Credentials.AccessKeyId')
AWS_SECRET_ACCESS_KEY=$(echo "${STS}" | jq -r '.Credentials.SecretAccessKey')
AWS_SESSION_TOKEN=$(echo "${STS}" | jq -r '.Credentials.SessionToken')

aws configure set aws_access_key_id ${AWS_ACCESS_KEY_ID} --profile $PROFILE
aws configure set aws_secret_access_key ${AWS_SECRET_ACCESS_KEY} --profile $PROFILE
aws configure set aws_session_token ${AWS_SESSION_TOKEN} --profile $PROFILE

echo "STS credentials stored in profile $PROFILE"

IDENTITY=`aws sts get-caller-identity`

USERID=$(echo "${IDENTITY}" | jq -r '.UserId')
ACCOUNTID=$(echo "${IDENTITY}" | jq -r '.Account')
ARN=$(echo "${IDENTITY}" | jq -r '.Arn')

echo "Current Account: ${ACCOUNTID}"
echo "Current User ID: ${USERID}"
echo "Current Arn: ${ARN}"

# Double check we are where we expect to be
if [ $ACCOUNTID != $TARGET_ACCOUNTID ]; then
  echo "Expected target account id is ${TARGET_ACCOUNTID}, role assumption was not successful. Failing build."
  exit 1
fi

exit 0