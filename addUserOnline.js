// Expected input:
// group_id, customer_id, customer_email, customer_username, customer_password (Required)
//
// Creates an online account for an existing user.
// Adds attributes email, username and password to the user item in db.
// A user must have already been added in the customers table in db, by the
// store.

var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB();
var request = require('request');
var async = require('async');
var _ = require('underscore');

exports.handler = function(event, context, callback) {

  var params;
  var check_if_email_exists_url = "https://skkoq4x5vl.execute-api.us-west-2.amazonaws.com/dev/check-if-email-exists";
  var check_if_username_exists_url = "https://skkoq4x5vl.execute-api.us-west-2.amazonaws.com/dev/check-if-username-exists";

  // just checking
  if(!event.group_id) {
    callback("No group_id given");
  }
  if(!event.customer_id) {
    callback("No customer id given");
  }
  if(!event.customer_email) {
    callback("No e-mail given");
  }
  if(!event.customer_username) {
    callback("No username given");
  }
  if(!event.customer_password) {
    callback("No password given");
  }

  async.parallel([
    function(parallel_callback) {
      request({
        url: check_if_email_exists_url,
        method: 'POST',
        data: {
          email: event.customer_email,
          group_id: event.group_id
        }
      }, function(err, response, body) {
        if(err) {
          parallel_callback(err);
        } else {
          // if response?
          parallel_callback(null, body);
        }
      });
    },
    function(parallel_callback) {
      request({
        url: check_if_username_exists_url,
        method: 'POST',
        data: {
          username: event.customer_username,
          group_id: event.group_id
        }
      }, function(err, response, body) {
        if(err) {
          parallel_callback(err);
        } else {
          // if response?
          parallel_callback(null, body);
        }
      });
    }
  ], function(err, results) {
    if(err) {
      callback(err);
    } else {
      if(results[0].exists || results[1].exists) {
        callback(null, {
          "email_exists": results[0].exists,
          "username_exists": results[1].exists,
          "comments": "User already exists"
        });
      } else {
        params = {
          ExpressionAttributeNames: {
            "#e": "email",
            "#u": "username",
            "#p": "password"
          },
          ExpressionAttributeValues: {
            ":given_email": {
              "S": event.customer_email
            },
            ":given_username": {
              "S": event.customer_username
            },
            ":given_password": {
              "S": event.customer_password.toString()
            }
          },
          Key: {
            "group_id": {
              "N": event.group_id.toString()
            },
            "customer_id": {
              "N": event.customer_id.toString()
            }
          },
          TableName: "customers",
          ConditionExpression: "attribute_not_exists(#e) AND attribute_not_exists(#u)",
          UpdateExpression: "SET #e = :given_email, #u = :given_username, #p = :given_password"
        };

        dynamodb.updateItem(params, function(err, data) {
          if(err) {
            callback("User already has an account");
          } else {
            callback(null, {
              "comments": "User added"
            });
          }
        });
      }
    }
  });



};
