import './styles';
import { createShortUrl } from './scripts/api';
import { getUrlInputData, showShortUrl, submitUrlElement } from './scripts/dom';
submitUrlElement.addEventListener('click', async (): Promise<void> => {
    showShortUrl((await createShortUrl(getUrlInputData().data)).shortUrl);
});
