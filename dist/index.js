'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./lastfm-njs.cjs.production.min.js');
} else {
  module.exports = require('./lastfm-njs.cjs.development.js');
}
