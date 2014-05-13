'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
    
/**
 * Hubot Plugin Schema
 */
var HubotPluginSchema = new Schema({
  name: String,
  avatarUrl: String,
  githubUrl: String,
  npmjsUrl: String,
  npmjsDescription: String,
  homepage: String,
  keywords: [String],
  created: Date,
  updated: Date,
  closed: Date
});

/**
 * Validations
 */
HubotPluginSchema.path('name').validate(function (name) {
  return name;
}, 'A Hubot Plugin must have a name');

mongoose.model('HubotPlugin', HubotPluginSchema);
