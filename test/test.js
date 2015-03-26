var test = require('tape')
var fs = require('fs')
var createFormList = require('../')

var forms = [
  'https://raw.githubusercontent.com/digidem-test/xform-test/master/forms/CascadingSelect/form.xml',
  'https://raw.githubusercontent.com/digidem-test/xform-test/master/forms/birds/form.xml',
  'https://raw.githubusercontent.com/digidem-test/xform-test/master/forms/geo_tagger_v2/form.xml',
  'https://raw.githubusercontent.com/digidem-test/xform-test/master/forms/widgets/form.xml'
]

test('Produces correct formList API', function (t) {
  var expectedXml = fs.readFileSync(__dirname + '/fixtures/formlist.xml').toString().replace(/\n$/, '')

  createFormList(forms, function (err, result) {
    t.error(err, 'Does not produce error')
    t.equal(result, expectedXml, 'Matches expected xml FormList')
    t.end()
  })
})

test('Can pass custom downloadUrl template', function (t) {
  var expectedXml = fs.readFileSync(__dirname + '/fixtures/formlist-download-url.xml').toString().replace(/\n$/, '')

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
  var expectedXml = fs.readFileSync(__dirname + '/fixtures/formlist-manifest-url.xml').toString().replace(/\n$/, '')

  var options = {
    manifestUrl: 'https://example.com/xformsManifest?formId=${formId}'
  }

  createFormList(forms, options, function (err, result) {
    t.error(err, 'Does not produce error')
    t.equal(result, expectedXml, 'Matches expected xml FormList')
    t.end()
  })
})
