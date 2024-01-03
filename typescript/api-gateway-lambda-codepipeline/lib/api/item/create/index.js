var AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

const createItem = async(event) =>{
    const date = new Date();
    const createdAt = Math.round((date.getTime() / 1000))
    const params = {
        TableName: process.env["DYNAMODB_TABLE_NAME"],
        Item: {
            'id': createdAt.toString(),
            'name': event['name'],
            'language': event['language'],
            'created_at': createdAt.toString()
        }
    }
    await docClient.put(params).promise()
    return true
}
exports.handler = async (event, context) => {
    try {
        await createItem(event)
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json'
            },
            'body': 'Record created successfully'
        } 
    } catch (err) {
        return { error: err["error"] }
    }
};