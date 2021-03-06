const mjml2html = require('mjml');
const Mustache = require('mustache');

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
module.exports = function createTemplateFunction(mjmlTpl, translations = {}) {
  const { html, errors } = mjml2html(mjmlTpl);
  // console.log('template errors', errors);

  // const minifiedHtml = html.replace(/>\s+|\s+</g, (m) => ' ' + m.trim());
  const ret = {
    htmlMoustache: html,
    minifiedHtml: html.replace(/\s+/g, ' '),
    errors,
    translations,
    errorOnMissingTranslation: true,
    missingTranslations: {},
  };

  ret.translate = (word, lang) => {
    let translations = ret.translations[lang];
    // solo el portugues y el ingles es obligatorio, de lo contrario usa la
    // traduccion original
    if (!translations) {
      // console.error('No hay traducciones para ', lang);
      ret.missingTranslations[lang] = ret.missingTranslations[lang] || {};
      ret.translations[lang] = ret.translations[lang] || {};
      translations = ret.translations[lang] || {};
      if (ret.errorOnMissingTranslation) {
        throw new Error(`No translation for dictionary ${lang}`);
      }
      // return word;
    }
    if (!translations[word]) {
      ret.missingTranslations[lang] = ret.missingTranslations[lang] || {};
      ret.missingTranslations[lang][word] = '';
      if (ret.errorOnMissingTranslation) {
        throw new Error(`No translation for ${word} in ${lang}`);
      }
      return word;
    }

    return (!translations || !translations[word]) ? word : translations[word];
  };

  ret.template = (data, lang) => {
    const d = Object.assign({}, {
      i18n() {
        return (t, r) => r(ret.translate(t, lang));
      }
    }, data);
    return Mustache.render(ret.minifiedHtml, d);
  };

  return ret;
}
