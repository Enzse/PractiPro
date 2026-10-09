import { SafeUrl } from '@angular/platform-browser';

/**
 * An API object with a profile picture or logo the page loaded for it.
 * Not part of the API data: components fill it in after fetching the image.
 */
export type WithAvatar<T> = T & { avatar?: SafeUrl | string };
