
var bind = require('bind');
var callback = require('callback');
var each = require('each');
var integration = require('integration');
var push = require('global-queue')('optimizely');
var tick = require('next-tick');


/**
 * Analytics reference.
 */

var analytics;


/**
 * Expose plugin.
 */

module.exports = exports = function (ajs) {
  ajs.addIntegration(Optimizely);
  analytics = ajs; // store for later
};


/**
 * Expose `Optimizely` integration.
 */

var Optimizely = exports.Integration = integration('Optimizely')
  .readyOnInitialize()
  .option('variations', true)
  .option('trackNamedPages', true)
  .option('trackCategorizedPages', true);


/**
 * Initialize.
 *
 * https://www.optimizely.com/docs/api#function-calls
 */

Optimizely.prototype.initialize = function () {
  if (this.options.variations) tick(this.replay);
};


/**
 * Track.
 *
 * https://www.optimizely.com/docs/api#track-event
 *
 * @param {String} event
 * @param {Object} properties (optional)
 * @param {Object} options (optional)
 */

Optimizely.prototype.track = function (event, properties, options) {
  properties || (properties = {});
  if (properties.revenue) properties.revenue = properties.revenue * 100;
  push('trackEvent', event, properties);
};


/**
 * Page.
 *
 * https://www.optimizely.com/docs/api#track-event
 *
 * @param {String} category (optional)
 * @param {String} name (optional)
 * @param {Object} properties (optional)
 * @param {Object} options (optional)
 */

Optimizely.prototype.page = function (category, name, properties, options) {
  var opts = this.options;

  // categorized pages
  if (category && opts.trackCategorizedPages) {
    this.track('Viewed ' + category + ' Page', properties);
  }

  // named pages
  if (name && opts.trackNamedPages) {
    if (name && category) name = category + ' ' + name;
    this.track('Viewed ' + name + ' Page', properties);
  }
};


/**
 * Replay experiment data as traits to other enabled providers.
 *
 * https://www.optimizely.com/docs/api#data-object
 */

Optimizely.prototype.replay = function () {
  if (!window.optimizely) return; // in case the snippet isnt on the page

  var data = window.optimizely.data;
  if (!data) return;

  var experiments = data.experiments;
  var map = data.state.variationNamesMap;
  var traits = {};

  each(map, function (experimentId, variation) {
    var experiment = experiments[experimentId].name;
    traits['Experiment: ' + experiment] = variation;
  });

  analytics.identify(traits);
};