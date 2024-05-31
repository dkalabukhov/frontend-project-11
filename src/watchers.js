import onChange from 'on-change';
import { renderFeeds } from './rss.js';

export default (elements, state, i18nextInstance) => {
  const watchedState = onChange(state, (path, value) => {
    console.log(111111111, path, value);
    switch (path) {
      case 'form.value':
        elements.input.classList.remove('is-invalid');
        elements.feedback.textContent = i18nextInstance.t('successfullyLoaded');
        elements.feedback.classList.add('text-success');
        elements.feedback.classList.remove('text-danger');
        break;
      case 'form.error':
        elements.input.classList.add('is-invalid');
        elements.feedback.textContent = watchedState.form.error;
        elements.feedback.classList.remove('text-success');
        elements.feedback.classList.add('text-danger');
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
