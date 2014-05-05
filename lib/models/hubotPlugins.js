'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
    
/**
 * Hubot Plugin Schema
 */
var HubotPluginSchema = new Schema({
  name: String,
  avatarUrl: String,
  npmjsUrl: String,
  npmjsDescription: String
});

/**
 * Validations
 */
HubotPluginSchema.path('name').validate(function (name) {
  return name;
}, 'A Hubot Plugin must have a name');

mongoose.model('HubotPlugin', HubotPluginSchema);