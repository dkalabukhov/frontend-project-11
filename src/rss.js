/* eslint-disable no-param-reassign */
import _ from 'lodash';

const parseRss = (data) => {
  const parser = new DOMParser();
  const parsedData = parser.parseFromString(data.contents, 'application/xml');
  const posts = Array.from(parsedData.querySelectorAll('item')).map((post) => ({
    title: post.querySelector('title').textContent,
    description: post.querySelector('description').textContent,
    href: post.querySelector('link').textContent,
    id: _.uniqueId(),
  }));
  if (posts.length === 0) {
    throw new Error('noData');
  }
  const title = parsedData.querySelector('title').textContent;
  const description = parsedData.querySelector('description').textContent;
  return { title, description, posts };
};

const createCard = (i18nextInstance, type) => {
  const card = document.createElement('div');
  card.classList.add('card', 'border-0');
  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');
  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = i18nextInstance.t(type);
  cardBody.append(cardTitle);
  card.append(cardBody);
  return card;
};

const setModal = (elements, title, description, href) => {
  const {
    modal,
    modalTitle,
    modalBody,
    modalBtnClose,
    modalBtnCloseCross,
    readAllHref,
  } = elements;

  readAllHref.setAttribute('href', href);

  modalTitle.textContent = title;
  modalBody.textContent = description;
  modal.classList.add('show');
  modal.style = 'display: block';

  const closeModal = () => {
    modal.classList.remove('show');
    modal.style = '';
  };

  [modalBtnClose, modalBtnCloseCross].forEach((item) => {
    item.addEventListener('click', () => {
      closeModal();
    });
  });
};

const renderFeeds = (watchedState, elements, i18nextInstance) => {
  elements.posts.innerHTML = '';
  elements.feeds.innerHTML = '';
  const postsCard = createCard(i18nextInstance, 'posts');
  const feedsCard = createCard(i18nextInstance, 'feeds');
  const postsUl = document.createElement('ul');
  const feedsUl = document.createElement('ul');
  postsUl.classList.add('list-group', 'border-0', 'rounded-0');
  feedsUl.classList.add('list-group', 'border-0', 'rounded-0');
  elements.posts.append(postsCard, postsUl);
  elements.feeds.append(feedsCard, feedsUl);

  watchedState.feeds.forEach((feed) => {
    const feedsLi = document.createElement('li');
    feedsLi.classList.add('list-group-item', 'border-0', 'border-end-0');
    const feedsH3 = document.createElement('h3');
    feedsH3.classList.add('h6', 'm-0');
    feedsH3.textContent = feed.title;
    const feedsP = document.createElement('p');
    feedsP.classList.add('m-0', 'small', 'text-black-50');
    feedsP.textContent = feed.description;
    feedsLi.append(feedsH3, feedsP);
    feedsUl.append(feedsLi);
  });

  watchedState.posts.forEach((post) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    const a = document.createElement('a');
    if (post.readed) {
      a.classList.add('fw-normal', 'link-secondary');
    } else a.classList.add('fw-bold');
    a.setAttribute('data-id', post.id);
    a.textContent = post.title;
    const btn = document.createElement('button');
    btn.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    btn.setAttribute('data-id', post.id);
    btn.textContent = i18nextInstance.t('preview');
    li.append(a, btn);
    postsUl.appendChild(li);
  });

  postsUl.addEventListener('click', (e) => {
    if (e.target.nodeName === 'BUTTON') {
      const link = e.target.parentElement.querySelector('a');
      link.classList.add('fw-normal', 'link-secondary');
      link.classList.remove('fw-bold');
      const { id } = link.dataset;
      watchedState.posts.forEach((post) => {
        if (post.id === id) {
          post.readed = true;
        }
      });

      const postTitle = e.target.parentElement.querySelector('a').textContent;
      watchedState.posts.forEach((post) => {
        if (post.title === postTitle) {
          const { title, description, href } = post;
          setModal(elements, title, description, href);
        }
      });
    }
  });
};

export default (link, i18nextInstance, watchedState) => {
  fetch(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(link)}`)
    .then((response) => {
      if (response.ok) return response.json();
      throw new Error('Failed to fetch');
    })
    .then((data) => {
      // if (data.status.http_code === 404) throw new Error('noData');
      const { title, description, posts } = parseRss(data);
      watchedState.feeds.push({ title, description });
      watchedState.posts = watchedState.posts.concat(posts);
    })
    .catch((err) => {
      watchedState.form.errors = [i18nextInstance.t(`errors.${err.message}`)];
    });
};

export { parseRss, renderFeeds };
