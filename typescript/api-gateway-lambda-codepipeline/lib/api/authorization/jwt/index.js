const AWS = require('aws-sdk')
const ssm = new AWS.SSM()
const jwt = require("jsonwebtoken");

exports.handler = async function(event){
    var token = event.authorizationToken;
    console.log(event)
    let effect = 'Deny'
    
    const {Parameter} = await ssm.getParameter({
        Name: `/dpn/config/rest-api/jwt-secret`,
        WithDecryption: true,
      }).promise()
    
    try {
        var decoded = jwt.verify(token, Parameter?.Value ?? null);
        console.log(`correct = ${decoded}`)
        effect = 'Allow'
    } catch(err) {
        effect = 'Deny'
        console.log("invalid token")
    }
    let policy = {
        "principalId": "user",
        "policyDocument": {
            "Version": "2012-10-17",
            "Statement": [{
                "Action": "execute-api:Invoke",
                "Effect": effect,
                "Resource": event.methodArn
            }]
        }
    }
    return policy 
}