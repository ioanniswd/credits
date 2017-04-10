// Expected input: store_id, product_id, price, credits_to_add
// credits_to_subtract, product_name (Required)
// only_credits (Optional)

var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB();

exports.handler = function(event, context, callback) {

  var params;

  // just checking
  if(!event.store_id) {
    callback("No store id given");
  }
  if(!event.product_id) {
    callback("No product id given");
  }
  if(!event.price) {
    callback("No price given");
  }
  if(!event.credits_to_add) {
    callback("No credits_to_add given");
  }
  if(!event.credits_to_subtract) {
    callback("No credits_to_subtract given");
  }
  if(!event.product_name) {
    callback("No name given");
  }

  params = {
    ExpressionAttributeNames: {
      "#product_id": "product_id",
    },
    Item: {
      "store_id": {
        "N": event.store_id.toString()
      },
      "product_id": {
        "N": event.product_id.toString()
      },
      "price": {
        "N": event.price.toString()
      },
      "credits_to_add": {
        "N": event.credits_to_add.toString()
      },
      "credits_to_subtract": {
        "N": event.credits_to_subtract.toString()
      },
      "name": {
        "S": event.product_name
      }
    },
    ConditionExpression: "attribute_not_exists(#product_id)",
    TableName: "products"
  };

  if(event.only_credits) {
    params.Item.only_credits = {
      "BOOL": event.only_credits.toString()
    };
  }

  dynamodb.putItem(params, function(err, data) {
    if(err) {
        callback("Product already exists");
    } else {
      callback(null, "Product added");
    }
  });

};
