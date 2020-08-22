import mustacheMjml from '../index';
//
const mjml = `<mjml></mjml>`;


test('if throws error on missing translations', () => {
  const tpl = mustacheMjml(mjml);
  tpl.minifiedHtml = '{{#i18n}}Hola{{/i18n}}';
  tpl.translations = { 'es-cl': {} };

  tpl.errorOnMissingTranslation = true;
  expect(() => { tpl.template({}, 'es-cl'); }).toThrow(/No translation for Hola in es-cl/);
  expect(() => { tpl.template({}, 'es-mx'); }).toThrow(/No translation for dictionary es-mx/);

  tpl.errorOnMissingTranslation = false;
  expect(() => { tpl.template({}, 'es-cl'); }).not.toThrow(/No translation for Hola in es-cl/);
  expect(() => { tpl.template({}, 'es-mx'); }).not.toThrow(/No translation for dictionary es-mx/);
})


test('if throws error on missing translations', () => {
  const tpl = mustacheMjml(mjml);
  tpl.minifiedHtml = '{{#i18n}}Hola{{/i18n}}';
  tpl.translations = {
    'es-cl': {
      'Hola': 'Alo'
    }
  }

  expect(tpl.template({}, 'es-cl')).toBe('Alo');
})
