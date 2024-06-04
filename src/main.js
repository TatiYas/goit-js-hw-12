import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import { fetchImages } from './js/pixabay-api';

const galleryElement = document.querySelector('.gallery');
const searchForm = document.querySelector('.form');
const inputElement = document.querySelector('.search-input');
const loader = document.querySelector('.loader');
const loadMoreBtn = document.querySelector('.load-more-btn');

hideLoader();

let searchTerm = '';
let pageCounter = 1;
const perPage = 15;

const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

searchForm.addEventListener('submit', submitHandle);

async function submitHandle(event) {
  event.preventDefault();
  searchTerm = inputElement.value.trim();
  pageCounter = 1;
  galleryElement.innerHTML = '';

  if (!searchTerm) {
    showError('The field can not be empty!');
    return;
  }

  hideEndMessage();
  showLoader();

  try {
    const images = await fetchImages(searchTerm, pageCounter, perPage);
    const totalHits = images.totalHits;

    if (!images.hits.length) {
      showError('Sorry, there are no images matching your search query. Please try again!');
      return;
    }

    renderPic(images.hits);
    inputElement.value = '';
    showLoadMoreBtn();

    if (perPage * pageCounter >= totalHits) {
      hideLoadMoreBtn();
      showEndMessage();
    }
  } catch (error) {
    showError('Failed to fetch images. Please try again later.');
    console.error('Error:', error);
  } finally {
    hideLoader();
  }
}

loadMoreBtn.addEventListener('click', async () => {
  try {
    pageCounter += 1;
    const images = await fetchImages(searchTerm, pageCounter, perPage);
    const totalHits = images.totalHits;

    renderPic(images.hits);
    showLoader();

    if (perPage * pageCounter >= totalHits) {
      hideLoadMoreBtn();
      showEndMessage();
    }

    smoothScrollToNextGroup();
  } catch (error) {
    showError(`Error fetching more images: ${error}`);
    console.error('Error fetching more images:', error);
  } finally {
    hideLoader();
  }
});

function renderPic(data) {
  galleryElement.insertAdjacentHTML('beforeend', generateMarkup(data));
  lightbox.refresh();
}

function generateMarkup(data) {
  return data.map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) => `
    <li class="card">
      <a href="${largeImageURL}" class="link">
        <img src="${webformatURL}" alt="${tags}">
        <ul class="list-container">
          <li class="item-description"><h3>Likes</h3> <p>${likes}</p></li>
          <li class="item-description"><h3>Views</h3> <p>${views}</p></li>
          <li class="item-description"><h3>Comments</h3> <p>${comments}</p></li>
          <li class="item-description"><h3>Downloads</h3> <p>${downloads}</p></li>
        </ul>
      </a>
    </li>
  `).join('');
}

function showEndMessage() {
  const endMessage = document.createElement('p');
  endMessage.classList.add('end-message');
  endMessage.textContent = "We're sorry, but you've reached the end of search results.";
  galleryElement.insertAdjacentElement('afterend', endMessage);
}

function showLoader() {
  loader.classList.remove('hidden');
}

function hideLoader() {
  loader.classList.add('hidden');
}

function showLoadMoreBtn() {
  loadMoreBtn.style.display = 'block';
}

function hideLoadMoreBtn() {
  loadMoreBtn.style.display = 'none';
}

function hideEndMessage() {
  const endMessage = document.querySelector('.end-message');
  if (endMessage) {
    endMessage.remove();
  }
}

function showError(message) {
  iziToast.error({
    message,
    messageColor: '#fff',
    backgroundColor: '#ef4040',
    position: 'bottomRight',
    messageSize: '14px',
    messageLineHeight: '100%',
    iconColor: 'grey',
    title: 'Error',
  });
}

function smoothScrollToNextGroup() {
  const firstGalleryItem = document.querySelector('.gallery a');
  if (firstGalleryItem) {
    const galleryItemHeight = firstGalleryItem.getBoundingClientRect().height;
    window.scrollBy({
      top: galleryItemHeight * 2,
      behavior: 'smooth',
    });
  }
}
