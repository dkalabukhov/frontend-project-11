/* eslint-disable no-param-reassign */
import onChange from 'on-change';
import { renderFeeds } from './rss.js';

export default (elements, state, i18nextInstance) => {
  const watchedState = onChange(state, (path, value) => {
    console.log(111111111, path, value);
    switch (path) {
      case 'form.errors':
        if (watchedState.form.errors.length > 0) {
          elements.input.classList.add('is-invalid');
          [elements.feedback.textContent] = watchedState.form.errors;
          elements.feedback.classList.remove('text-success');
          elements.feedback.classList.add('text-danger');
        } else {
          elements.input.classList.remove('is-invalid');
          elements.feedback.textContent = i18nextInstance.t('successfullyLoaded');
          elements.feedback.classList.add('text-success');
          elements.feedback.classList.remove('text-danger');
        }
        break;
      case 'posts':
        renderFeeds(watchedState, elements, i18nextInstance);
        break;
      default:
        console.log(`Data: \n ${path} ${value}`);
    }
  });

  return watchedState;
};
