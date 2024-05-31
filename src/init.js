/* eslint-disable no-param-reassign */
import * as yup from 'yup';
import i18n from 'i18next';
import watch from './watchers.js';
import resources from '../locale/index.js';
import locale from '../locale/yupLocale.js';
import getRss, { parseRss } from './rss.js';

export default () => {
  const state = {
    form: {
      value: '',
      error: '',
      status: 'filling',
    },
    urls: new Set(),
    feeds: [],
    posts: [],
    language: 'ru',
  };

  const i18nextInstance = i18n.createInstance();
  i18nextInstance.init({
    lng: state.language,
    resources,
  });

  yup.setLocale(locale);

  const schema = yup.string().url().required();

  const elements = {
    modal: document.querySelector('.modal'),
    modalTitle: document.querySelector('.modal-title'),
    modalBody: document.querySelector('.modal-body'),
    modalBtnClose: document.querySelector('button[class="btn btn-secondary"]'),
    modalBtnCloseCross: document.querySelector('button[class="btn-close close"]'),
    modalBtnReadMore: document.querySelector('.full-article'),
    form: document.querySelector('form'),
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
    posts: document.querySelector('.posts'),
    feeds: document.querySelector('.feeds'),
    readAllHref: document.querySelector('a[class="btn btn-primary full-article"]'),
    textNodes: {
      modalBtnClose: document.querySelector('button[class="btn btn-secondary"]'),
      heading: document.querySelector('h1[class="display-3 mb-0"]'),
      subheading: document.querySelector('p[class="lead"]'),
      RSSLink: document.querySelector('label[for="url-input"]'),
      readAllBtn: document.querySelector('a[class="btn btn-primary full-article"]'),
      closeModalBtn: document.querySelector('button[class="btn btn-secondary"]'),
      addBtn: document.querySelector('button[class="h-100 btn btn-lg btn-primary px-sm-5"]'),
      example: document.querySelector('p[class="mt-2 mb-0 text-muted"]'),
      createdBy: document.querySelector('span[class="created-by"]'),
    },
  };

  const loadTranslation = () => {
    Object.keys(elements.textNodes).forEach((node) => {
      elements.textNodes[node].textContent = i18nextInstance.t(node);
    });
  };

  loadTranslation();

  const checkRssUpdates = (watchedState, time) => {
    if (watchedState.feeds.length > 0) {
      Array.from(watchedState.urls)
        .map((url) => fetch(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
          .then((response) => response.json())
          .then((data) => {
            const { posts } = parseRss(data);
            const postTitles = watchedState.posts.map((post) => post.title);
            const uniquePosts = posts.filter((newPost) => !postTitles.includes(newPost.title));
            const updatedPosts = watchedState.posts.concat(uniquePosts);
            watchedState.posts = updatedPosts;
          })
          .catch((e) => console.log(e)));
    }
    setTimeout(() => checkRssUpdates(watchedState, time), time);
  };

  const watchedState = watch(elements, state, i18nextInstance);

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.form.value = elements.input.value.trim();
    schema.notOneOf(state.urls)
      .validate(watchedState.form.value)
      .then((value) => {
        watchedState.form.error = '';
        watchedState.urls.add(value);
        elements.form.reset();
        elements.input.focus();
        getRss(watchedState.form.value, i18nextInstance, watchedState);
      })
      .catch((err) => {
        const messages = err.errors.map((error) => i18nextInstance.t(`errors.${error.key}`));
        [watchedState.form.error] = messages;
      });
  });

  elements.input.focus();

  elements.input.addEventListener('invalid', (e) => {
    if (e.target.value.length === 0) {
      e.target.setCustomValidity(i18nextInstance.t('errors.required'));
    }
  });

  elements.input.addEventListener('input', (e) => {
    e.target.setCustomValidity('');
  });

  checkRssUpdates(watchedState, 5000);
};
