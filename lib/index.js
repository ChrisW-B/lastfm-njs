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
			if (opt.artist === undefined || opt.artist === '' && typeof opt.callback === 'function') {
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
		merge(qs, {
			api_key: this.apiKey,
			format: 'json'
		});
		var opt = {
			method: 'GET',
			uri: 'http://ws.audioscrobbler.com/2.0/',
			json: true,
			qs: qs
		};
		rp(opt).then(
			function(res) {
				if (res.error === undefined) {
					merge(res, {
						success: true
					});
					callback(res);
				} else {
					merge(res, {
						success: false
					});
					callback(res)
				}
			}).catch(
			function(err) {
				callback({
					success: false
				});
				if (this.debug)
					console.log("Exception: ", err);
			}
		);
	};
	self._postData = function(qs, callback) {
		merge(qs, {
			api_key: this.apiKey,
			format: 'json'
		});
		var opt = {
			uri: 'https://ws.audioscrobbler.com/2.0/',
			qs: qs,
			json: true
		};
		rp.post(opt).then(
			function(res) {
				merge(res, {
					success: true
				});
				callback(res);
			}).catch(
			function(err) {
				if (this.debug)
					console.log("Exception: ", err);
				callback({
					success: false,
					err: err
				});
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
LastFM.prototype.Auth_getMobileSession = function(callback) {
	var authToken = md5(this.username + md5(this.password));
	var authSig = 'api_key' + this.apiKey + 'authToken' + authToken + 'methodauth.getMobileSessionusername' + this.username + this.apiSecret;
	var apiSig = md5(authSig);
	var self = this;
	var qs = {
		method: 'auth.getMobileSession',
		username: this.username,
		authToken: authToken,
		api_sig: apiSig,
	};
	this._postData(qs,
		function(res) {
			if (res.success) {
				self.sessionKey = res.session.key;
				callback({
					success: res.success,
					key: res.session.key
				});
			} else {
				callback(res);
			}
		});
};
//album methods
LastFM.prototype.album_addTags = function(opt) {
	// opt = {
	// 	artist: artist, //req
	// 	album: album, //req
	// 	tags: tags, //req, max: 10, comma separated list
	// 	sk: sessionKey //opt, if getSessionKey already called
	// 	callback: callback
	// }
	var qs = opt || {};
	qs.sk = qs.sk || this.sessionKey;
	if (qs.artist === '' || qs.artist === undefined ||
		qs.album === '' || qs.album === undefined ||
		qs.tags === '' || qs.tags === undefined) {
		opt.callback({
			'@': {
				status: 'error'
			},
			error: {
				'#': 'Missing required params'
			}
		});
		return;
	}
	if (qs.sk === '' || qs.sk === undefined) {
		opt.callback({
			'@': {
				status: 'error'
			},
			error: {
				'#': 'Missing session key, make sure you run getSessionKey'
			}
		});
	}
	var authSig = 'album' + qs.album + 'api_key' + qs.api_key + 'artist' + qs.artist + 'formatjson' + 'sk' + qs.sk + 'tags' + qs.tags + this.apiSecret;
	merge(qs, {
		method: 'album.addTags',
		api_sig: this.apiSig,
	});
	this._postData(qs, opt.callback);
};
LastFM.prototype.album_getInfo = function(opt) {
	// opt = {
	// 	artist: artist, //req unless mbid
	// 	album: album, //req unless mbid
	// 	mbid: mbid, //opt
	// 	lang: lang, //opt
	// 	username: username //opt
	// }
	var qs = opt || {};
	if (qs.username === '' || qs.username === undefined ||
		((qs.artist === '' || qs.artist === undefined ||
				qs.album === '' || qs.album === undefined) &&
			(qs.mbid === '' || qs.mbid === undefined))) {
		opt.callback({
			'@': {
				status: 'error'
			},
			error: {
				'#': 'Missing required params'
			}
		});
		return;
	}
	merge(qs, {
		method: 'album.getInfo',
		autocorrect: 1,
	});
	this._getData(qs, function(res) {
		if (res.success) {
			opt.callback(res.album);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.album_getTags = function(opt) {
	// opt = {
	// 	artist: artist, //req unless mbid
	// 	album: album, //req unless mbid
	// 	username: username, //req
	// 	mbid: mbid //opt
	// 	callback: callback
	// }
	var qs = opt || {};
	if ((qs.artist === '' || qs.artist === undefined ||
			qs.album === '' || qs.album === undefined) &&
		(qs.mbid === '' || qs.mbid === undefined)) {
		opt.callback({
			'@': {
				status: 'error'
			},
			error: {
				'#': 'Missing required params'
			}
		});
		return;
	}
	merge(qs, {
		method: 'album.getTags',
		autocorrect: 1,
	});
	this._getData(qs, function(res) {
		if (res.success) {
			opt.callback(res.tags);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.album_getTopTags = function(opt) {
	// opt = {
	// 	artist: artist, //req unless mbid
	// 	album: album, //req unless mbid
	// 	mbid: mbid //opt
	// 	callback: callback
	// }
	var qs = opt || {};
	if ((qs.artist === '' || qs.artist === undefined ||
			qs.album === '' || qs.album === undefined) &&
		(qs.mbid === '' || qs.mbid === undefined)) {
		opt.callback({
			'@': {
				status: 'error'
			},
			error: {
				'#': 'Missing required params'
			}
		});
		return;
	}
	merge(qs, {
		method: 'album.getTopTags',
		autocorrect: 1
	});
	this._getData(qs, function(res) {
		if (res.success) {
			opt.callback(res.toptags);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.album_removeTag = function(opt) {
	// opt = {
	// 	artist: artist, //req
	// 	album: album, //req
	// 	tag: tag, //req, single tag to remove
	// 	sk: sessionKey //opt, if getSessionKey already called
	// 	callback: callback
	// }
	var qs = opt || {};
	qs.sk = qs.sk || this.sessionKey;
	if (qs.artist === '' || qs.artist === undefined ||
		qs.album === '' || qs.album === undefined ||
		qs.tag === '' || qs.tag === undefined) {
		opt.callback({
			'@': {
				status: 'error'
			},
			error: {
				'#': 'Missing required params'
			}
		});
		return;
	}
	if (qs.sk === '' || qs.sk === undefined) {
		opt.callback({
			'@': {
				status: 'error'
			},
			error: {
				'#': 'Missing session key, make sure you run getSessionKey'
			}
		});
	}
	var authSig = 'album' + qs.album + 'api_key' + qs.api_key + 'artist' + qs.artist + 'formatjson' + 'sk' + qs.sk + 'tag' + qs.tag + this.apiSecret;
	merge(qs, {
		method: 'album.removeTag',
		api_sig: this.apiSig,
	});
	this._postData(qs, opt.callback);
};

LastFM.prototype.album_search = function(opt) {
	// opt = {
	// 	album: album, //req
	// 	limit: limit, //opt, defaults to 30
	// 	page: page //opt, defaults to 1
	// 	callback: callback
	// }
	var qs = opt || {};
	if (qs.album === '' || qs.album === undefined) {
		opt.callback({
			'@': {
				status: 'error'
			},
			error: {
				'#': 'Missing required params'
			}
		});
		return;
	}

	merge(qs, {
		method: 'album.search',
		autocorrect: 1,
	});
	this._getData(qs, function(res) {
		if (res.success) {
			opt.callback(res.results);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.artist_addTags = function(opt) {
	// opt = {
	// 	artist: artist //req
	// 	tags: tags, //req, max 10, comma separated
	// 	sk: sessionKey //opt
	// 	callback: callback
	// }
	var qs = opt || {};
	qs.sk = qs.sk || this.sessionKey;
	if (qs.artist === '' || qs.artist === undefined || qs.tags === '' || qs.tags === undefined) {
		opt.callback({
			'@': {
				status: 'error'
			},
			error: {
				'#': 'Missing required params'
			}
		});
		return;
	}
	if (qs.sk === '' || qs.sk === undefined) {
		opt.callback({
			'@': {
				status: 'error'
			},
			error: {
				'#': 'Missing session key, make sure you run getSessionKey'
			}
		});
	}
	var authSig = 'api_key' + qs.api_key + 'artist' + qs.artist + 'formatjson' + 'sk' + qs.sk + 'tags' + qs.tags + this.apiSecret;
	merge(qs, {
		method: 'artist.addTags',
		api_sig: this.apiSig
	});
	this._postData(qs, opt.callback);
};

LastFM.prototype.artist_getCorrection = function(opt) {
	// opt = {
	// 	artist: artist, //req
	// 	callback: callback
	// }
	var qs = opt || {};
	if (qs.artist === '' || qs.artist === undefined) {
		opt.callback({
			'@': {
				status: 'error'
			},
			error: {
				'#': 'Missing artist'
			}
		});
		return;
	}
	merge(qs, {
		method: 'artist.getCorrection',
	});
	this._getData(qs, function(res) {
		if (res.success) {
			opt.callback(res.corrections);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.artist_getInfo = function(opt) {
	// opt = {
	// 	artist: artist, //req unless mbid
	// 	mbid: mbid, //opt
	// 	username: username, //opt
	// 	callback: callback
	// }
	var qs = opt || {};
	if ((qs.artist === '' || qs.artist === undefined) && (qs.mbid === '' || qs.mbid === undefined)) {
		opt.callback({
			'@': {
				status: 'error'
			},
			error: {
				'#': 'Missing artist and mbid'
			}
		});
		return;
	}
	merge(qs, {
		method: 'artist.getInfo',
		autocorrect: 1
	});
	this._getData(qs, function(res) {
		if (res.success) {
			opt.callback(res.artist);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.artist_getSimilar = function(opt) {
	// opt = {
	// 	artist: artist, //req unless mbid
	// 	mbid: mbid, //opt
	// 	limit: limit, //opt
	// 	callback: callback
	// }
	var qs = opt || {};
	if ((qs.artist === '' || qs.artist === undefined) && (qs.mbid === '' || qs.mbid === undefined)) {
		opt.callback({
			'@': {
				status: 'error'
			},
			error: {
				'#': 'Missing artist and mbid'
			}
		});
		return;
	}
	merge(qs, {
		method: 'artist.getSimilar',
		autocorrect: 1
	});
	this._getData(qs, function(res) {
		if (res.success) {
			opt.callback(res.similarartists);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.artist_getTags = function(opt) {
	// opt = {
	// 	artist: artist, //req unless mbid
	// 	user: username, //req
	// 	mbid: mbid, //opt
	// 	callback: callback
	// }
	var qs = opt || {};
	if (((qs.artist === '' || qs.artist === undefined) && (qs.mbid === '' || qs.mbid === undefined)) ||
		(qs.user === '' || qs.user === undefined)) {
		opt.callback({
			'@': {
				status: 'error'
			},
			error: {
				'#': 'Missing required parameters'
			}
		});
		return;
	}
	merge(qs, {
		method: 'artist.getTags',
		autocorrect: 1
	});
	this._getData(qs, function(res) {
		if (res.success) {
			opt.callback(res.tags);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.artist_getTopAlbums = function(opt) {
	// opt = {
	// 	artist: artist, //req unless mbid
	// 	mbid: mbid, //opt
	// 	page: page, //opt, default is 50
	// 	limit: limit, //opt, default is 1
	// 	callback: callback
	// }
	var qs = opt || {};
	if ((qs.artist === '' || qs.artist === undefined) && (qs.mbid === '' || qs.mbid === undefined)) {
		opt.callback({
			'@': {
				status: 'error'
			},
			error: {
				'#': 'Missing required parameters'
			}
		});
		return;
	}
	merge(qs, {
		method: 'artist.getTopAlbums',
		autocorrect: 1
	});
	this._getData(qs, function(res) {
		if (res.success) {
			opt.callback(res.topalbums);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.artist_getTopTags = function(opt) {
	// opt = {
	// 	artist: artist, //req unless mbid
	// 	mbid: mbid, //opt
	// 	callback: callback
	// }
	var qs = opt || {};
	if ((qs.artist === '' || qs.artist === undefined) && (qs.mbid === '' || qs.mbid === undefined)) {
		opt.callback({
			'@': {
				status: 'error'
			},
			error: {
				'#': 'Missing required parameters'
			}
		});
		return;
	}
	merge(qs, {
		method: 'artist.getTopTags',
		autocorrect: 1
	});
	this._getData(qs, function(res) {
		if (res.success) {
			opt.callback(res.toptags);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.artist_getTopTracks = function(opt) {
	// opt = {
	// 	artist: artist, //req unless mbid
	// 	mbid: mbid, //opt
	// 	page: page //opt, default is 1
	// 	limit: limit //opt, default is 50
	// 	callback: callback
	// }
	var qs = opt || {};
	if ((qs.artist === '' || qs.artist === undefined) && (qs.mbid === '' || qs.mbid === undefined)) {
		opt.callback({
			'@': {
				status: 'error'
			},
			error: {
				'#': 'Missing required parameters'
			}
		});
		return;
	}
	merge(qs, {
		method: 'artist.getTopTracks',
		autocorrect: 1
	});
	this._getData(qs, function(res) {
		if (res.success) {
			opt.callback(res.toptracks);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.artist_removeTag = function(opt) {
	// opt = {
	// 	artist: artist //req
	// 	tag: tag, //req, 1 tag to be removed
	// 	sk: sessionKey //opt
	// 	callback: callback
	// }
	var qs = opt || {};
	qs.sk = qs.sk || this.sessionKey;
	if (qs.artist === '' || qs.artist === undefined || qs.tag === '' || qs.tag === undefined) {
		opt.callback({
			'@': {
				status: 'error'
			},
			error: {
				'#': 'Missing required params'
			}
		});
		return;
	}
	if (qs.sk === '' || qs.sk === undefined) {
		opt.callback({
			'@': {
				status: 'error'
			},
			error: {
				'#': 'Missing session key, make sure you run getSessionKey'
			}
		});
	}
	var authSig = 'api_key' + qs.api_key + 'artist' + qs.artist + 'formatjson' + 'sk' + qs.sk + 'tag' + qs.tag + this.apiSecret;
	merge(qs, {
		method: 'artist.removeTag',
		api_sig: this.apiSig
	});
	this._postData(qs, opt.callback);
};

LastFM.prototype.artist_search = function(opt) {
	// opt = {
	// 	artist: artist, //req unless mbid
	// 	page: page //opt, default is 1
	// 	limit: limit //opt, default is 50
	// 	callback: callback
	// }
	var qs = opt || {};
	if (qs.artist === '' || qs.artist === undefined) {
		opt.callback({
			'@': {
				status: 'error'
			},
			error: {
				'#': 'Missing artist'
			}
		});
		return;
	}
	merge(qs, {
		method: 'artist.search',
		autocorrect: 1
	});
	this._getData(qs, function(res) {
		if (res.success) {
			opt.callback(res.results);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.chart_getTopArtists = function(opt) {
	// opt = {
	// 	page: page //opt, default is 1
	// 	limit: limit //opt, default is 50
	// 	callback: callback
	// }
	var qs = opt || {};
	merge(qs, {
		method: 'chart.getTopArtists',
		autocorrect: 1
	});
	this._getData(qs, function(res) {
		if (res.success) {
			opt.callback(res.artists);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.chart_getTopTags = function(opt) {
	// opt = {
	// 	page: page //opt, default is 1
	// 	limit: limit //opt, default is 50
	// 	callback: callback
	// }
	var qs = opt || {};
	merge(qs, {
		method: 'chart.getTopTags',
		autocorrect: 1
	});
	this._getData(qs, function(res) {
		if (res.success) {
			opt.callback(res.tags);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.chart_getTopTracks = function(opt) {
	// opt = {
	// 	page: page //opt, default is 1
	// 	limit: limit //opt, default is 50
	// 	callback: callback
	// }
	var qs = opt || {};
	merge(qs, {
		method: 'chart.getTopTracks',
		autocorrect: 1
	});
	this._getData(qs, function(res) {
		if (res.success) {
			opt.callback(res.tracks);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.geo_getTopArtists = function(opt) {
	// opt = {
	// 	country: country //req
	// 	page: page //opt, default is 1
	// 	limit: limit //opt, default is 50
	// 	callback: callback
	// }
	var qs = opt || {};
	if (qs.country === '' || qs.country === undefined) {
		opt.callback({
			'@': {
				status: 'error'
			},
			error: {
				'#': 'Missing country'
			}
		});
		return;
	}
	merge(qs, {
		method: 'geo.getTopArtists',
		autocorrect: 1
	});
	this._getData(qs, function(res) {
		if (res.success) {
			opt.callback(res.topartists);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.geo_getTopTracks = function(opt) {
	// opt = {
	// 	country: country //req, ISO 3166-1 format
	// 	page: page //opt, default is 1
	// 	limit: limit //opt, default is 50
	// 	callback: callback
	// }
	var qs = opt || {};
	if (qs.country === '' || qs.country === undefined) {
		opt.callback({
			'@': {
				status: 'error'
			},
			error: {
				'#': 'Missing country'
			}
		});
		return;
	}
	merge(qs, {
		method: 'geo.getTopTracks',
		autocorrect: 1
	});
	this._getData(qs, function(res) {
		if (res.success) {
			opt.callback(res.tracks);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.library_getArtists = function(opt) {
	// opt = {
	// 	user: username //req, ISO 3166-1 format
	// 	page: page //opt, default is 1
	// 	limit: limit //opt, default is 50
	// 	callback: callback
	// }
	var qs = opt || {};
	if (qs.user === '' || qs.user === undefined) {
		opt.callback({
			'@': {
				status: 'error'
			},
			error: {
				'#': 'Missing user'
			}
		});
		return;
	}
	merge(qs, {
		method: 'library.getArtists',
		autocorrect: 1
	});
	this._getData(qs, function(res) {
		if (res.success) {
			opt.callback(res.artists);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.tag_getInfo = function(opt) {
	// opt = {
	// 	tag: tag //req
	// 	lang: lang //opt
	// 	callback: callback
	// }
	var qs = opt || {};
	if (qs.tag === '' || qs.tag === undefined) {
		opt.callback({
			'@': {
				status: 'error'
			},
			error: {
				'#': 'Missing tag'
			}
		});
		return;
	}
	merge(qs, {
		method: 'tag.getInfo',
	});
	this._getData(qs, function(res) {
		if (res.success) {
			opt.callback(res.tag);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.tag_getSimilar = function(opt) {
	// opt = {
	// 	tag: tag //req
	// 	callback: callback
	// }
	var qs = opt || {};
	if (qs.tag === '' || qs.tag === undefined) {
		opt.callback({
			'@': {
				status: 'error'
			},
			error: {
				'#': 'Missing tag'
			}
		});
		return;
	}
	merge(qs, {
		method: 'tag.getSimilar',
	});
	this._getData(qs, function(res) {
		if (res.success) {
			opt.callback(res.similartags);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.tag_getTopAlbums = function(opt) {
	// opt = {
	// 	tag: tag //req
	// 	limit: limit //opt, default is 50
	// 	page: page //opt, default is 1
	// 	callback: callback
	// }
	var qs = opt || {};
	if (qs.tag === '' || qs.tag === undefined) {
		opt.callback({
			'@': {
				status: 'error'
			},
			error: {
				'#': 'Missing tag'
			}
		});
		return;
	}
	merge(qs, {
		method: 'tag.getTopAlbums',
	});
	this._getData(qs, function(res) {
		if (res.success) {
			opt.callback(res.albums);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.tag_getTopArtists = function(opt) {
	// opt = {
	// 	tag: tag //req
	// 	limit: limit //opt, default is 50
	// 	page: page //opt, default is 1
	// 	callback: callback
	// }
	var qs = opt || {};
	if (qs.tag === '' || qs.tag === undefined) {
		opt.callback({
			'@': {
				status: 'error'
			},
			error: {
				'#': 'Missing tag'
			}
		});
		return;
	}
	merge(qs, {
		method: 'tag.getTopArtists',
	});
	this._getData(qs, function(res) {
		if (res.success) {
			opt.callback(res.topartists);
		} else {
			opt.callback(res);
		}
	});
};


LastFM.prototype.tag_getTopTags = function(opt) {
	// opt = {
	// 	callback: callback
	// }
	var qs = opt || {};
	merge(qs, {
		method: 'tag.getTopTags',
	});
	this._getData(qs, function(res) {
		if (res.success) {
			opt.callback(res.toptags);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.tag_getTopTracks = function(opt) {
	// opt = {
	// 	tag: tag //req
	// 	limit: limit //opt, defaults to 50
	// 	page: page //opt, defaults to 1
	// 	callback: callback
	// }
	var qs = opt || {};
	if (qs.tag === '' || qs.tag === undefined) {
		opt.callback({
			'@': {
				status: 'error'
			},
			error: {
				'#': 'Missing tag'
			}
		});
		return;
	}
	merge(qs, {
		method: 'tag.getTopTracks',
	});
	this._getData(qs, function(res) {
		if (res.success) {
			opt.callback(res.tracks);
		} else {
			opt.callback(res);
		}
	});
};

LastFM.prototype.tag_getWeeklyChartList = function(opt) {
	// opt = {
	// 	tag: tag //req
	// 	callback: callback
	// }
	var qs = opt || {};
	if (qs.tag === '' || qs.tag === undefined) {
		opt.callback({
			'@': {
				status: 'error'
			},
			error: {
				'#': 'Missing tag'
			}
		});
		return;
	}
	merge(qs, {
		method: 'tag.getWeeklyChartList',
	});
	this._getData(qs, function(res) {
		if (res.success) {
			opt.callback(res.weeklychartlist);
		} else {
			opt.callback(res);
		}
	});
};

function md5(string) {
	return crypto.createHash('md5').update(string, 'utf8').digest("hex");
}
module.exports = LastFM;