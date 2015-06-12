var test = require('tape')
var fs = require('fs')
var resumer = require('resumer')
var request = require('request')
var expat = require('node-expat')
var createFormList = require('../')

var forms = [
  'https://raw.githubusercontent.com/digidem-test/xform-test/master/forms/CascadingSelect/form.xml',
  'https://raw.githubusercontent.com/digidem-test/xform-test/master/forms/birds/form.xml',
  'https://raw.githubusercontent.com/digidem-test/xform-test/master/forms/geo_tagger_v2/form.xml',
  'https://raw.githubusercontent.com/digidem-test/xform-test/master/forms/widgets/form.xml'
]

test('Produces correct formList API', function (t) {
  var expectedXml = fs.readFileSync(__dirname + '/fixtures/formlist.xml').toString().trim()

  createFormList(forms, function (err, result) {
    t.error(err, 'Does not produce error')
    t.equal(result, expectedXml, 'Matches expected xml FormList')
    t.end()
  })
})

test('Can pass custom downloadUrl template', function (t) {
  var expectedXml = fs.readFileSync(__dirname + '/fixtures/formlist-download-url.xml').toString().trim()

  var options = {
    downloadUrl: 'https://example.com/formXml?formId=${formId}'
  }

  createFormList(forms, options, function (err, result) {
    t.error(err, 'Does not produce error')
    t.equal(result, expectedXml, 'Matches expected xml FormList')
    t.end()
  })
})

test('Adds a manifestUrl tag when xForm references external media and option is set', function (t) {
  var expectedXml = fs.readFileSync(__dirname + '/fixtures/formlist-manifest-url.xml').toString().trim()

  var options = {
    manifestUrl: 'https://example.com/xformsManifest?formId=${formId}'
  }

  createFormList(forms, options, function (err, result) {
    t.error(err, 'Does not produce error')
    t.equal(result, expectedXml, 'Matches expected xml FormList')
    t.end()
  })
})

test('Accepts an array of request streams', function (t) {
  var formStreams = forms.map(function (url) {
    return request(url)
  })
  var expectedXml = fs.readFileSync(__dirname + '/fixtures/formlist.xml').toString().trim()

  createFormList(formStreams, function (err, result) {
    t.error(err, 'Does not produce error')
    t.equal(result, expectedXml, 'Matches expected xml FormList')
    t.end()
  })
})

test('Accepts an array of streams from strings', function (t) {
  var formString = fs.readFileSync(__dirname + '/fixtures/birds.xml').toString()
  var formStream = resumer().queue(formString).end()
  formStream.uri = {
    href: 'https://raw.githubusercontent.com/digidem-test/xform-test/master/forms/birds/form.xml'
  }
  var formStreams = [
    formStream
  ]

  var expectedXml = fs.readFileSync(__dirname + '/fixtures/formlist-birds.xml').toString().trim()

  createFormList(formStreams, function (err, result) {
    t.error(err, 'Does not produce error')
    t.equal(result, expectedXml, 'Matches expected xml FormList')
    t.end()
  })
})

test('Empty forms parameter returns parseable XML', function(t) {
  createFormList([], function (err, result) {
    var parser = new expat.Parser('UTF-8')
    t.error(err, 'Does not produce error')
    t.doesNotThrow(function() {
      parser.write(result)
    });
    t.end()
  })
})
