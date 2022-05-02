import 'materialize-css/dist/js/materialize.min';
import './styles';
import { createShortUrl } from './scripts/api';
import { hideUrlError, showShortUrl, showUrlError, submitUrlElement } from './scripts/dom';
import { urlInputChanges, urlInputValidationChanges } from './scripts/state';
import { UrlInputData } from './scripts/models';

let urlInputData: UrlInputData;
subscribeToUrlInputDataChanges();
subscribeToUrlInputValidationChanges();
submitUrlElement.addEventListener(
    'click',
    async (): Promise<void> => {
        if (urlInputData.isValidUrl) {
            showShortUrl((await createShortUrl(urlInputData.data)).shortUrl);
        }
    },
);

function subscribeToUrlInputDataChanges(): void {
    urlInputChanges.subscribe((e: UrlInputData): void => {
        urlInputData = e;
    });
}

function subscribeToUrlInputValidationChanges(): void {
    urlInputValidationChanges.subscribe((isValid: boolean): void => {
        if (!isValid) {
            showUrlError();
        } else {
            hideUrlError();
        }
    });
}
