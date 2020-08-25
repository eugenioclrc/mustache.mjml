import mustacheMjml from '../';
//
const mjml = `<mjml></mjml>`;


test('basic render', () => {
  const tpl = mustacheMjml(mjml);
  tpl.minifiedHtml = 'Hello {{name}}, {{sum}}';

  const data = {
    name: 'World',
    sum() {
      return 2 + 2;
    }
  };

  expect(tpl.template(data)).toBe('Hello World, 4');
});

describe("i18n", () => {
  test('if throws error on missing translations', () => {
    const tpl = mustacheMjml(mjml);
    tpl.minifiedHtml = '{{#i18n}}Hello{{/i18n}}';
    tpl.translations = { 'es-cl': {} };


    tpl.errorOnMissingTranslation = true;
    expect(() => { tpl.template({}, 'es-cl'); }).toThrow(/No translation for Hello in es-cl/);
    expect(() => { tpl.template({}, 'es-mx'); }).toThrow(/No translation for dictionary es-mx/);

    tpl.errorOnMissingTranslation = false;
    tpl.missingTranslations = {};
    expect(() => { tpl.template({}, 'es-cl'); }).not.toThrow(/No translation for Hello in es-cl/);
    expect(() => { tpl.template({}, 'es-mx'); }).not.toThrow(/No translation for dictionary es-mx/);

    const expectedMissingTranslations = { 'es-cl': { Hello: '' }, 'es-mx': { Hello: '' } };
    expect(tpl.missingTranslations).toEqual(expect.objectContaining(expectedMissingTranslations));

  })

  test('basic i18n render', () => {
    const tpl = mustacheMjml(mjml);
    tpl.minifiedHtml = '{{#i18n}}Hello{{/i18n}}';
    tpl.translations = {
      'es-cl': {
        'Hello': 'Alo'
      }
    }

    expect(tpl.template({}, 'es-cl')).toBe('Alo');

    tpl.minifiedHtml = '{{#i18n}}Hello{{/i18n}} {{name}}';
    tpl.translations = {
      'es-cl': {
        'Hello': 'Alo'
      }
    }

    expect(tpl.template({name: 'World'}, 'es-cl')).toBe('Alo World');

    tpl.minifiedHtml = '{{#i18n}}Hello {{name}}{{/i18n}}';
    tpl.translations = {
      es: {
        'Hello {{name}}': 'Hola {{name}}'
      }
    }

    expect(tpl.template({name: 'World'}, 'es')).toBe('Hola World');
    tpl.errorOnMissingTranslation = false;
    expect(tpl.template({name: 'World'}, 'en')).toBe('Hello World');
  })

  test('custom i18n render function', () => {
    const tpl = mustacheMjml(mjml);
    tpl.minifiedHtml = '{{#i18n}}Hello {{name}}{{/i18n}}';

    const originalTranslate = tpl.translate;

    tpl.translate = (word, lang) => {
      if (!lang) {
        return word;
      }
      try {
        return originalTranslate(word, lang);
      } catch (err) { /* empty */ }
      return originalTranslate(word, lang.split('-')[0]);
    };

    const data = {name: 'World'};

    expect(tpl.template(data)).toBe('Hello World');

    tpl.translations.es = {'Hello {{name}}': 'Hola {{name}}'};
    expect(tpl.template(data, 'es-cl')).toBe('Hola World');

    tpl.translations['es-cl'] = {'Hello {{name}}': 'Alo {{name}}'};
    expect(tpl.template(data, 'es-cl')).toBe('Alo World');
    expect(tpl.template(data, 'es-mx')).toBe('Hola World');
    expect(() => { tpl.template(data, 'pt-br'); }).toThrow(/No translation for dictionary/);
  });
});
