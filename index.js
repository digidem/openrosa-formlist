var expat = require('node-expat');
var crypto = require('crypto');
var request = require('request');
var builder = require('xmlbuilder');
var async = require('async');
var validator = require('validator');
var resumer = require('resumer');
var concat = require('concat-stream');
var extend = require('xtend');
var Stream = require('stream');

/**
 * Default options
 * @type {Object}
 * @param {RegExp} mediaRe RegExp to match any external media referenced in the xForm
 * @param {String} namePath xPath style path to the XML tag that contains the xForm name
 * @param {String} instancePath xPath style path to XML tag that contains the instance
 * (which has the form `id` and `version` as attributes)
 */
var defaults = {
  mediaRe: /jr\:\/\/(images|audio|video)/i,
  namePath: '/h:html/h:head/h:title',
  instancePath: '/h:html/h:head/model/instance',
  headers: {
    'User-Agent': 'xform-formlist'
  }
};

// RegExp used to replace formId in options.manifestUrl and options.downloadUrl
var URL_RE = /\$\{\s*formId\s*\}/;

/**
 * Creates a valid FormList XML document according to
 * https://bitbucket.org/javarosa/javarosa/wiki/FormListAPI
 * @param  {Array}   forms    An array of Urls for each form, streams (could
 * be a file read stream or a response stream), or full XML text of the form
 * @param  {Object}   [options]  `options.downloadUrl` is a template for the
 * url where the form is located, in the format `http://example.com/forms/${formId}.xml`. `${formId}` will be replaced by the actual form Id of each form. `options.manifestUrl` is the url template for the location of the manifest xml document (only included if external media is referenced in the xForm)
 * @param  {Function} callback Called with `(err, data)` where `data` is a
 * valid formListAPI Xml document
 * @example
 * var createFormList = require('openrosa-formlist');
 *
 * var forms = [
 *   'https://opendatakit.appspot.com/formXml?formId=widgets',
 *   'https://opendatakit.appspot.com/formXml?formId=Birds'
 * ];
 *
 * createFormList(forms, function(err, data) {
 *   console.log(data) // outputs formList Xml
 * })
 */
function createFormList(forms, options, callback) {
  if (arguments.length === 2) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    } else {
      throw 'Must provide a callback function';
    }
  }

  options = extend(defaults, options);

  var streams = forms.map(function createStream(v) {
    if (v instanceof Stream) return v;
    if (validator.isURL(v)) {
      if (/^https\:\/\/api.github.com/.test(v)) {
        options.headers.Accept = 'application/vnd.github.v3.raw';
      }
      return request(v, options);
    }
    return resumer().queue(v);
  });

  async.map(streams, parse, function buildXml(err, results) {
    if (err) return callback(err);

    var xml = builder.create({
      xforms: {
        '@xmlns': 'http://openrosa.org/xforms/xformsList',
        '#list': results
      }
    }, {
      encoding: 'UTF-8'
    }).end({
      pretty: true
    });

    callback(null, xml);
  });

  function parse(xformStream, callback) {
    var parser = new expat.Parser('UTF-8'),
      md5 = crypto.createHash('md5'),
      path = '',
      meta = {},
      hasAttachments = false;

    parser.on('startElement', function(tagname, attrs) {
      if (path === options.instancePath && !meta.formId) {
        meta.formId = attrs.id || tagname;
        if (attrs.version) meta.version = attrs.version;
      }
      path += '/' + tagname;
    });

    parser.on('endElement', function(tagname) {
      var re = new RegExp('\/' + tagname + '$', 'i');
      path = path.replace(re, '');
    });

    parser.on('text', function(text) {
      if (path === options.namePath && !meta.name) {
        meta.name = text || 'Unnamed Form';
      }
      if (options.mediaRe.test(text)) {
        hasAttachments = true;
      }
    });

    parser.on('error', callback);

    xformStream.on('data', function(d) {
      md5.update(d);
    });

    xformStream.on('error', callback);

    parser.on('end', function() {
      meta.hash = 'md5:' + md5.digest('hex');
      if (options.downloadUrl) {
        meta.downloadUrl = options.downloadUrl.replace(URL_RE, meta.formId);
      } else if (xformStream.uri && xformStream.uri.href) {
        meta.downloadUrl = xformStream.uri.href;
      }
      if (hasAttachments && options.manifestUrl) {
        meta.manifestUrl = options.manifestUrl.replace(URL_RE, meta.formId);
      }
      callback(null, { xform: meta });
    });

    if (xformStream instanceof request.Request) {
      xformStream.on('response', function(res) {
        if (res.statusCode === 200) return res.pipe(parser);
        res.pipe(concat({ encoding: 'string' }, callback));
      });
    } else {
      xformStream.pipe(parser);
    }
  }
}

module.exports = createFormList;
