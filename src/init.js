import * as yup from 'yup';
import i18n from 'i18next';
import watch from './watchers.js';
import resources from '../locale/index.js';
import locale from '../locale/yupLocale.js';

export default () => {
  const state = {
    form: {
      value: '',
      errors: [],
      status: 'filling',
    },
    feed: {
      urls: new Set(),
    },
    language: 'en',
  };

  const i18nextInstance = i18n.createInstance();
  i18nextInstance.init({
    lng: state.language,
    resources,
  });

  yup.setLocale(locale);

  const schema = yup.string().url().required();

  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
    textNodes: {
      heading: document.querySelector('h1[class="display-3 mb-0"]'),
      subheading: document.querySelector('p[class="lead"]'),
      RSSLink: document.querySelector('label[for="url-input"]'),
      readAllBtn: document.querySelector('a[class="btn btn-primary full-article"]'),
      closeModalBtn: document.querySelector('button[class="btn btn-secondary"]'),
      addBtn: document.querySelector('button[class="h-100 btn btn-lg btn-primary px-sm-5"]'),
      example: document.querySelector('p[class="mt-2 mb-0 text-muted"]'),
    },
  };

  const loadTranslation = () => {
    Object.keys(elements.textNodes).forEach((node) => {
      elements.textNodes[node].textContent = i18nextInstance.t(node);
    });
  };

  loadTranslation();

  const watchedState = watch(elements, state);

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.form.value = elements.input.value;
    schema.notOneOf(state.feed.urls)
      .validate(watchedState.form.value)
      .then((value) => {
        watchedState.form.errors = [];
        watchedState.feed.urls.add(value);
        elements.form.reset();
        elements.input.focus();
      })
      .catch((err) => {
        const messages = err.errors.map((error) => i18nextInstance.t(`errors.${error.key}`));
        watchedState.form.errors = messages;
      });
  });

  elements.input.focus();
};