import Notiflix from 'notiflix';

import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import { fetchImg, PER_PAGE } from './js/fetch';
import { formRef, galleryRef, btnLoadMore } from './js/refs';
import { markupCard } from './js/markup';

formRef.addEventListener('submit', onSearchForm);
btnLoadMore.addEventListener('click', onLoadMoreImg);

let numOfPage = 1;
let searchValue = '';

let lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

async function onSearchForm(e) {
  e.preventDefault();
  resetPages();
  resetRender();

  searchValue = e.target.elements.searchQuery.value.trim();

  if (!searchValue) {
    onHideBtn();
    formRef.reset();
    return;
  }
  // fetchImg(searchValue, numOfPage).then(({ data }) => {

  try {
    const newImg = await fetchImg(searchValue, numOfPage);
    const { data } = newImg;

    const markup = markupCard(data.hits);

    if (markup.length === 0) {
      onHideBtn();
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.',
      );
      return;
    }

    Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images. `);
    onShowBtn();

    renderMarkup(markup);

    lightbox.refresh();

    if (numOfPage * PER_PAGE >= data.totalHits) {
      onHideBtn();
      return;
    }
  } catch (error) {
    console.log(error);
  }
  // });

  formRef.reset();
}

function renderMarkup(str = '') {
  galleryRef.insertAdjacentHTML('beforeend', str);
}

async function onLoadMoreImg(e) {
  try {
    numOfPage += 1;
    const newImg = await fetchImg(searchValue, numOfPage);
    const { data } = newImg;
    if (numOfPage * PER_PAGE >= data.totalHits) {
      onHideBtn();
      Notiflix.Notify.warning(`We're sorry, but you've reached the end of search results.`);
    }
    const markup = markupCard(data.hits);

    renderMarkup(markup);

    lightbox.refresh();
    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
  } catch (error) {
    console.log(error);
  }
}

function resetPages() {
  numOfPage = 1;
}

function resetRender() {
  galleryRef.innerHTML = '';
}

function onShowBtn() {
  btnLoadMore.classList.remove('visually-hidden');
}

function onHideBtn() {
  btnLoadMore.classList.add('visually-hidden');
}
