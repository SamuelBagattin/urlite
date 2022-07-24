import { UrlInputData } from './models';

export const submitUrlElement: HTMLLinkElement = getATag('a.create-short-url');
export const inputUrlElement: HTMLInputElement = getInput('input#longurl');
const urlErrorDiv: HTMLDivElement = getDiv('div#url-error');
export function showShortUrl(shortUrl: string): void {
    getDiv('div.longurl').innerText = shortUrl;
}
export function getUrlInputData(): UrlInputData {
    return { data: inputUrlElement.value };
}
function getButton(query: string): HTMLButtonElement {
    return document.querySelector(query) as HTMLButtonElement;
}

function getATag(query: string): HTMLLinkElement {
    return document.querySelector(query) as HTMLLinkElement;
}

function getDiv(query: string): HTMLDivElement {
    return document.querySelector(query) as HTMLDivElement;
}

function getInput(query: string): HTMLInputElement {
    return document.querySelector(query) as HTMLInputElement;
}
