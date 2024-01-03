var AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB();
const converter = (row)=>{
  let data=[]
  if(row.Items && row.Items.length < 1) return data
  for(let i=0;i<row.Items.length;i++){
    let obj={}
    for (const key in row.Items[i]) {
      obj[key]=Object.values(row.Items[i][key])[0]
    }
    obj.key=i
    data.push(obj)
  }
  return data
}
const getItems = async(id) => {
  var params = {
    TableName: process.env["DYNAMODB_TABLE_NAME"]
  };
  try {
    var result = await docClient.scan(params).promise()
    return converter(result)
  } catch (err) {
    console.log(`database error`)
    console.log(err)
    return false
  }
}
const getItem1 = async(id) => {}
exports.handler = async (event) => {
  const response = await getItems(event["id"])
  return {
    statusCode:200,
    body:response
  }
};