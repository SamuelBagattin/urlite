import { UrlCreationResponse } from './models';

export async function createShortUrl(longUrl: string): Promise<UrlCreationResponse> {
    const response: Response = await fetch('/urls', {
        method: 'POST',
        body: JSON.stringify({
            url: longUrl,
        }),
    });
    return (await response.json()) as UrlCreationResponse;
}
