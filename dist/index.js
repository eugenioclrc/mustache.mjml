"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createTemplateFunction;

var _mjml = _interopRequireDefault(require("mjml"));

var _mustache = _interopRequireDefault(require("mustache"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * createTemplate recibe un string con codiggo MJML, y un diccionario de traducciones
 * las traducciones se usan con el formato tomado de:
 * https://stackoverflow.com/questions/5389727/how-to-make-client-side-i18n-with-mustache-js
 *
 * Ejemplo;
 *   createTemplateFunction(`<h1>{{#i18n}}hola {{ name }}{{/i18n}}`, {
   en: { 'hola {{ name }}': 'hello {{ name }}' }
 })
 */
function createTemplateFunction(mjmlTpl) {
  var translations = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var _mjml2html = (0, _mjml.default)(mjmlTpl, {
    beautify: true
  }),
      html = _mjml2html.html,
      errors = _mjml2html.errors; // console.log('template errors', errors);
  // const minifiedHtml = html.replace(/>\s+|\s+</g, (m) => ' ' + m.trim());


  var ret = {
    htmlMoustache: html,
    minifiedHtml: html.replace(/\s+/g, ' '),
    errors: errors,
    translations: translations,
    errorOnMissingTranslation: true,
    missingTranslations: {}
  };

  ret.translate = function (word, lang) {
    var translations = ret.translations[lang]; // solo el portugues y el ingles es obligatorio, de lo contrario usa la
    // traduccion original

    if (!translations) {
      // console.error('No hay traducciones para ', lang);
      ret.missingTranslations[lang] = ret.missingTranslations[lang] || {};
      translations = ret.translations[lang] || {};

      if (ret.errorOnMissingTranslation) {
        throw new Error("No translation for dictionary ".concat(lang));
      } // return word;

    }

    if (!translations[word]) {
      ret.missingTranslations[lang] = ret.missingTranslations[lang] || {};
      ret.missingTranslations[lang][word] = '';

      if (ret.errorOnMissingTranslation) {
        throw new Error("No translation for ".concat(word, " in ").concat(lang));
      }

      return word;
    }

    return !translations || !translations[word] ? word : translations[word];
  };

  ret.template = function (data, lang) {
    var d = Object.assign({}, {
      i18n: function i18n() {
        return function (t, r) {
          return r(ret.translate(t, lang));
        };
      }
    }, data);
    return _mustache.default.render(ret.minifiedHtml, d);
  };

  return ret;
}