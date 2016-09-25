var request = require('request'),
	rp = require('request-promise'),
	crypto = require('crypto'),
	merge = require('lodash.merge');
var LastFM = function(opts) {
	opts = opts || {};
	var apiKey,
		apiSecret,
		userName,
		password,
		sessionKey,
		self = this,
		isMethodCaller = false;
	this.debug = opts.debug || false;
	if (opts.apiSecret !== undefined && opts.apiSecret !== '')
		this.apiSecret = opts.apiSecret;
	if (opts.apiKey !== undefined && opts.apiKey !== '')
		this.apiKey = opts.apiKey;
	if (opts.username !== undefined && opts.username !== '')
		this.username = opts.username;
	if (opts.password !== undefined && opts.password !== '')
		this.password = opts.password;
	if (opts.sessionKey !== undefined && opts.sessionKey !== '')
		this.sessionKey = opts.sessionKey;
	//only allow access to method from inside itself
	self._getInfo = function(opt) {
		if (!self.isMethodCaller) throw new Error('Security exception.');
		try {
			if (opt.artist === undefined || opt.artist == '' && typeof opt.callback === 'function') {
				opt.callback({
					'@': {
						status: 'error'
					},
					error: {
						'#': 'Artist not specified.'
					}
				});
			} else {
				var options = {
					method: 'GET',
					uri: 'http://ws.audioscrobbler.com/2.0/',
					qs: {
						method: (opt.track !== undefined && opt.track !== '' ? 'track' : 'artist') + '.getInfo',
						artist: opt.artist,
						api_key: opt.api_key,
						format: 'json',
						autocorrect: 1
					},
					json: true
				};
				if (!(opt.track === undefined || opt.track === '')) {
					options.qs.track = opt.track;
				}
				if (!(opt.username === undefined || opt.track === '')) {
					options.qs.username = opt.username;
				}
				rp(options).then(function(repos) {
					opt.callback(repos);
				}).catch(function(err) {
					if (this.debug) console.log(err);
				});
			}
		} catch (e) {
			if (this.debug) console.log("Exception getting track info: ", e);
		}
	};
	self._getData = function(qs, callback) {
		var opt = {
			method: 'GET',
			uri: 'http://ws.audioscrobbler.com/2.0/',
			json: true,
			qs: qs
		};
		rp(opt).then(
			function(res) {
				callback(res);
			}).catch(
			function(err) {
				if (this.debug)
					console.log("Exception: ", err);
			}
		);
	};
	self._postData = function(qs, callback) {
		var opt = {
			uri: 'https://ws.audioscrobbler.com/2.0/',
			qs: qs,
			json: true
		};
		rp.post(opt)
			.then(
				function(res) {
					callback(res);
				}).catch(
				function(err) {
					if (this.debug)
						console.log("Exception: ", err);
				}
			);
	};
};
//for backwards compat
LastFM.prototype.init = function(options) {
	this.apiKey = opts.apiKey;
	if (opts.apiSecret !== undefined && opts.apiSecret !== '')
		this.apiSecret = opts.apiSecret;
	if (opts.username !== undefined && opts.username !== '')
		this.username = opts.username;
	if (opts.password !== undefined && opts.password !== '')
		this.password = opts.password;
	if (opts.sessionKey !== undefined && opts.sessionKey !== '')
		this.sessionKey = opts.sessionKey;
};
LastFM.prototype.getSessionKey = function(callback) {
	var authToken = md5(this.username + md5(this.password));
	var authSig = 'api_key' + this.apiKey + 'authToken' + authToken + 'methodauth.getMobileSessionusername' + this.username + this.apiSecret;
	var apiSig = md5(authSig);
	var qs = {
		method: 'auth.getMobileSession',
		username: this.username,
		authToken: authToken,
		api_key: this.apiKey,
		api_sig: apiSig,
		format: 'json'
	};
	this._postData(qs,
		function(res) {
			callback(res.session.key);
		});
};
//album methods
LastFM.prototype.addAlbumTags = function(opt) {
	// opt = {
	// 	artist: artist, //req
	// 	album: album, //req
	// 	tags: tags, //req, max: 10, comma separated list
	// 	sk: sessionKey //req
	// }
	qs = opt || {};
	if (qs.artist === '' || qs.artist === undefined ||
		qs.album === '' || qs.album === undefined ||
		qs.tags === '' || qs.tags === undefined ||
		qs.sk === '' || qs.sk === undefined) {
		var errMsg = {
			'@': {
				status: 'error'
			},
			error: {
				'#': 'Required options not included.'
			}
		};
		opt.callback(errMsg);
		return;
	}
	var authSig = 'album' + qs.album + 'api_key' + qs.api_key + 'artist' + qs.artist + 'formatjson' + 'sk' + qs.sessionKey + 'tags' + qs.tags + this.apiSecret;
	merge(qs, {
		method: 'album.addTags',
		api_key: this.apiKey,
		api_sig: this.apiSig,
		format: 'json'
	});
	this._postData(qs, opt.callback);
};
LastFM.prototype.getAlbumInfo = function(opt) {
	// opt = {
	// 	artist: artist, //req unless mbid
	// 	album: album, //req unless mbid
	// 	mbid: mbid, //opt
	// 	lang: lang, //opt
	// 	username: username //opt
	// }
	qs = opt || {};
	if ((qs.artist == '' || qs.artist === undefined ||
			qs.album == '' || qs.album === undefined) &&
		(qs.mbid == '' || qs.mbid === undefined)) {
		var errMsg = {
			'@': {
				status: 'error'
			},
			error: {
				'#': 'Required options not included.'
			}
		};
		opt.callback(errMsg);
		return;
	}
	merge(qs, {
		method: 'album.getInfo',
		api_key: this.apiKey,
		autocorrect: 1,
		format: 'json'
	});
	this._getData(qs, opt.callback);
};


function md5(string) {
	return crypto.createHash('md5').update(string, 'utf8').digest("hex");
}
module.exports = LastFM;