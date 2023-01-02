import axios from 'axios';
import querystring from 'querystring'
/// <reference types="spotify-api" />

export interface PromptifySong {
  name: string,
  album_name: string,
  album_external_url: string,
  image: SpotifyApi.ImageObject,
  artists: SpotifyApi.ArtistObjectSimplified[],
  external_url: string,
  duration_ms: number,
  id: string;
  uri: string;
}

interface SpotifyKeys {
	accessToken: string,
  refreshToken: string,
  expireTime: string,
  timestamp: string,
}

interface SpotifyValues {
	accessToken: string | null,
  refreshToken: string | null,
  expireTime: string | null,
  timestamp: string | null,
}

// Map for localStorage keys
const LOCALSTORAGE_KEYS: SpotifyKeys = {
  accessToken: 'spotify_access_token',
  refreshToken: 'spotify_refresh_token',
  expireTime: 'spotify_token_expire_time',
  timestamp: 'spotify_token_timestamp',
}

// Map to retrieve localStorage values
const LOCALSTORAGE_VALUES: SpotifyValues = {
  accessToken: window.localStorage.getItem(LOCALSTORAGE_KEYS.accessToken),
  refreshToken: window.localStorage.getItem(LOCALSTORAGE_KEYS.refreshToken),
  expireTime: window.localStorage.getItem(LOCALSTORAGE_KEYS.expireTime),
  timestamp: window.localStorage.getItem(LOCALSTORAGE_KEYS.timestamp),
};

/**
 * Checks if the amount of time that has elapsed between the timestamp in localStorage
 * and now is greater than the expiration time of 3600 seconds (1 hour).
 * @returns {boolean} Whether or not the access token in localStorage has expired
 */
const hasTokenExpired = () => {
  const { accessToken, timestamp, expireTime } = LOCALSTORAGE_VALUES;
  if (!accessToken || !timestamp) {
    return false;
  }
  const millisecondsElapsed = Date.now() - Number(timestamp);
  return (millisecondsElapsed / 1000) > Number(expireTime);
};

/**
 * Clear out all localStorage items we've set and reload the page
 * @returns {void}
 */
export const logout = () => {
  // Clear all localStorage items
  for (const property in LOCALSTORAGE_KEYS) {
    window.localStorage.removeItem(LOCALSTORAGE_KEYS[property as keyof SpotifyKeys]);
  }
  // Navigate to homepage
  (window as Window).location = window.location.origin;
};

/**
 * Use the refresh token in localStorage to hit the /refresh_token endpoint
 * in our Node app, then update values in localStorage with data from response.
 * @returns {void}
 */
const refreshToken = async () => {
  try {
    // Logout if there's no refresh token stored or we've managed to get into a reload infinite loop
    if (!LOCALSTORAGE_VALUES.refreshToken ||
      LOCALSTORAGE_VALUES.refreshToken === 'undefined' ||
      (Date.now() - Number(LOCALSTORAGE_VALUES.timestamp) / 1000) < 1000
    ) {
      console.error('No refresh token available');
      logout();
    }

    // Use `/refresh_token` endpoint from our Node app
    const { data } = await axios.get(`api/refresh_token?refresh_token=${LOCALSTORAGE_VALUES.refreshToken}`);

    // Update localStorage values
    window.localStorage.setItem(LOCALSTORAGE_KEYS.accessToken, data.access_token);
    window.localStorage.setItem(LOCALSTORAGE_KEYS.timestamp, Date.now().toString());

    // Reload the page for localStorage updates to be reflected
    window.location.reload();

  } catch (e) {
    console.error(e);
  }
};

/**
 * Handles logic for retrieving the Spotify access token from localStorage
 * or URL query params
 * @returns {string} A Spotify access token
 */
const getAccessToken = () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const queryParams = {
    [LOCALSTORAGE_KEYS.accessToken]: urlParams.get('access_token'),
    [LOCALSTORAGE_KEYS.refreshToken]: urlParams.get('refresh_token'),
    [LOCALSTORAGE_KEYS.expireTime]: urlParams.get('expires_in'),
  };
  const hasError = urlParams.get('error');

  // If there's an error OR the token in localStorage has expired, refresh the token
  if (hasError || hasTokenExpired() || LOCALSTORAGE_VALUES.accessToken === 'undefined') {
    refreshToken();
  }

  // If there is a valid access token in localStorage, use that
  if (LOCALSTORAGE_VALUES.accessToken && LOCALSTORAGE_VALUES.accessToken !== 'undefined') {
    return LOCALSTORAGE_VALUES.accessToken;
  }

  // If there is a token in the URL query params, user is logging in for the first time
  if (queryParams[LOCALSTORAGE_KEYS.accessToken]) {
    // Store the query params in localStorage
    for (const property in queryParams) {
			const param = queryParams[property]
			if (param !== null) {
				window.localStorage.setItem(property, param);
			}
    }
    // Set timestamp
    window.localStorage.setItem(LOCALSTORAGE_KEYS.timestamp, Date.now().toString());
    // Return access token from query params
    return queryParams[LOCALSTORAGE_KEYS.accessToken];
  }

  // We should never get here!
  return null;
};

export const accessToken: string | null = getAccessToken();

/**
 * Axios global request headers
 * https://github.com/axios/axios#global-axios-defaults
 */
const baseURL = 'https://api.spotify.com/v1';
const headers = { 
		Authorization: `Bearer ${accessToken}`, 
		'content-type': 'application/json'
};

/**
 * Search for Item
 * https://developer.spotify.com/documentation/web-api/reference/#/operations/search
 * @returns {Promise}
 */
export const search = async (query: string, type: string) => {
	const queryParams = querystring.stringify({
		q: query,
		type,
		limit: 2
  });
	return await axios.get(`${baseURL}/search/?${queryParams}`, { headers: headers })
};

export const formatSpotifySongToPromptifySong = (spotifySong: SpotifyApi.TrackObjectFull) : PromptifySong => {
  return {
    name: spotifySong.name,
    album_name: spotifySong.album.name,
    album_external_url: spotifySong.album.external_urls.spotify,
    image: spotifySong.album.images[0],
    artists: spotifySong.artists,
    external_url: spotifySong.external_urls.spotify,
    duration_ms: spotifySong.duration_ms,
    id: spotifySong.id,
    uri: spotifySong.uri
  }
}