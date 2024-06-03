import axios from 'axios';


const baseURL = 'https://pixabay.com/api/';

export async function fetchImages(searchQuery, page) {
  const response = await axios(baseURL, {
    params: {
      key: '43244566-bb96021fc186f0172f7edc4d3',
      q: searchQuery,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      page,
      per_page: 15,
    },
  });
  return response.data;
}