
var each = require('each');


/**
 * A list all of our integration slugs.
 */

var integrations = [
  'customerio',
  'get-satisfaction',
  'google-analytics',
  'keen-io',
  'mixpanel',
  'optimizely'
];


/**
 * Expose the integrations, using their own `name` from their `prototype`.
 */

each(integrations, function (slug) {
  var plugin = require('./lib/' + slug);
  var name = plugin.Integration.prototype.name;
  exports[name] = plugin;
});
