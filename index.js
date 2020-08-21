import mjml2html from 'mjml';
import Mustache from 'mustache';

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
export default function createTemplateFunction(mjmlTpl, translations = {}) {
  const { html, errors } = mjml2html(mjmlTpl, { beautify: true });
  console.log('template errors', errors);

  // const minifiedHtml = html.replace(/>\s+|\s+</g, (m) => ' ' + m.trim());
  const ret = {
    htmlMoustache: html,
    minifiedHtml: html.replace(/\s+/g, ' '),
    errors,
    translations,
  };

  ret.translate = (word, lang) => {
    const translations = ret.translations[lang];
    // solo el portugues y el ingles es obligatorio, de lo contrario usa la
    // traduccion original
    if (lang === 'pt' || lang === 'en') {
      if (!translations) {
        // console.error('No hay traducciones para ', lang);
        throw new Error(`No hay traducciones para ${lang}`);
        // return word;
      }
      if (!translations[word]) {
        throw new Error(`No hay traducciones para ${word} en ${lang}`);
        // console.error('No existe la tradiccion para ', word);
        // return word;
      }
    }

    return (!translations || !translations[word]) ? word : translations[word];
  };

  ret.template = (data, lang) => {
    const d = Object.assign({}, {
      i18n() {
        return (t, r) => r(translate(t, lang));
      }
    }, data);
    return Mustache.render(ret.minifiedHtml, d);
  };

  return ret;
}
