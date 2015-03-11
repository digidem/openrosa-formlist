# openrosa-formlist

[![build status](https://secure.travis-ci.org/digidem/openrosa-formlist.png)](http://travis-ci.org/digidem/openrosa-formlist)

Create a valid JavaRosa FormList of xforms see https://bitbucket.org/javarosa/javarosa/wiki/FormListAPI


### `defaults(mediaRe, namePath, instancePath)`

Default options

### Parameters

| parameter      | type   | description                                                                                                  |
| -------------- | ------ | ------------------------------------------------------------------------------------------------------------ |
| `mediaRe`      | RegExp | RegExp to match any external media referenced in the xForm                                                   |
| `namePath`     | String | xPath style path to the XML tag that contains the xForm name                                                 |
| `instancePath` | String | xPath style path to XML tag that contains the instance (which has the form `id` and `version` as attributes) |



### `createFormList(forms, [options], callback)`

Creates a valid FormList XML document according to
https://bitbucket.org/javarosa/javarosa/wiki/FormListAPI

### Parameters

| parameter   | type     | description                                                                                                                                                                                                                                                                                                                                                          |
| ----------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `forms`     | Array    | An array of Urls for each form, streams (could be a file read stream or a response stream), or full XML text of the form                                                                                                                                                                                                                                             |
| `[options]` | Object   | _optional:_ `options.downloadUrl` is a template for the url where the form is located, in the format `http://example.com/forms/${formId}.xml`. `${formId}` will be replaced by the actual form Id of each form. `options.manifestUrl` is the url template for the location of the manifest xml document (only included if external media is referenced in the xForm) |
| `callback`  | Function | Called with `(err, data)` where `data` is a valid formListAPI Xml document                                                                                                                                                                                                                                                                                           |


### Example

```js
var createFormList = require('openrosa-formlist');

var forms = [
  'https://opendatakit.appspot.com/formXml?formId=widgets',
  'https://opendatakit.appspot.com/formXml?formId=Birds'
];

createFormList(forms, function(err, data) {
  console.log(data) // outputs formList Xml
})
```

## Installation

Requires [nodejs](http://nodejs.org/).

```sh
$ npm install openrosa-formlist
```

## Tests

```sh
$ npm test
```


