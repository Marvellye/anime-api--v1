import axios from 'axios';
import cheerio from 'cheerio';

import {
  generateEncryptAjaxParameters,
  decryptEncryptAjaxResponse,
} from './helpers/extractors/goload.js';
import { extractStreamSB } from './helpers/extractors/streamsb.js';
import { extractFembed } from './helpers/extractors/fembed.js';
import { USER_AGENT, renameKey } from './utils.js';

/*const BASE_URL = 'https://www7.gogoanime.me/';
const BASE_URL2 = 'https://www7.gogoanime.me/';*/
const BASE_URL = 'https://anitaku.to/';
const BASE_URL2 = 'https://anitaku.to/';
const ajax_url = 'https://ajax.gogo-load.com/';
const anime_info_url = 'https://anitaku.to/category/';
const anime_movies_path = '/anime-movies.html';
const popular_path = '/popular.html';
const new_season_path = '/new-season.html';
const search_path = '/search.html';
const popular_ongoing_url = `${ajax_url}ajax/page-recent-release-ongoing.html`;
const recent_release_url = `${ajax_url}ajax/page-recent-release.html`;
const list_episodes_url = `${ajax_url}ajax/load-list-episode`;
const seasons_url = 'https://anitaku.to/sub-category/';

const Referer = 'https://gogoplay.io/';
const goload_stream_url = 'https://goload.pro/streaming.php';
export const DownloadReferer = 'https://goload.pro/';

const disqus_iframe = (episodeId) =>
  `https://disqus.com/embed/comments/?base=default&f=gogoanimetv&t_u=https%3A%2F%2Fgogoanime.vc%2F${episodeId}&s_o=default#version=cfefa856cbcd7efb87102e7242c9a829`;
const disqus_api = (threadId, page) =>
  `https://disqus.com/api/3.0/threads/listPostsThreaded?limit=100&thread=${threadId}&forum=gogoanimetv&order=popular&cursor=${page}:0:0&api_key=E8Uh5l5fHZ6gD8U3KycjAIAk46f68Zw7C6eW8WSjZvCLXebZ7p0r1yrYDrLilk2F`;

const Genres = [
  'action',
  'adventure',
  'cars',
  'comedy',
  'crime',
  'dementia',
  'demons',
  'drama',
  'dub',
  'ecchi',
  'family',
  'fantasy',
  'game',
  'gourmet',
  'harem',
  'hentai',
  'historical',
  'horror',
  'josei',
  'kids',
  'magic',
  'martial-arts',
  'mecha',
  'military',
  'Mmusic',
  'mystery',
  'parody',
  'police',
  'psychological',
  'romance',
  'samurai',
  'school',
  'sci-fi',
  'seinen',
  'shoujo',
  'shoujo-ai',
  'shounen',
  'shounen-ai',
  'slice-of-life',
  'space',
  'sports',
  'super-power',
  'supernatural',
  'suspense',
  'thriller',
  'vampire',
  'yaoi',
  'yuri',
  'isekai',
];


export const scrapeSearch = async ({ list = [], keyw, page = 1 }) => {
  try {
    const searchPage = await axios.get(
      `${BASE_URL + search_path}?keyword=${keyw}&page=${page}`
    );
    const $ = cheerio.load(searchPage.data);

    $('div.last_episodes > ul > li').each((i, el) => {
      list.push({
        anime_id: $(el).find('p.name > a').attr('href').split('/')[2],
        name: $(el).find('p.name > a').attr('title'),
        img_url: $(el).find('div > a > img').attr('src'),
        status: $(el).find('p.released').text().trim(),
      });
    });

    return list;
  } catch (err) {
    console.log(err);
    return { error: err };
  }
};

export const scrapeRecentRelease = async ({ list = [], page = 1, type = 1 }) => {
  try {
    const mainPage = await axios.get(`
        ${recent_release_url}?page=${page}&type=${type}
        `);
    const $ = cheerio.load(mainPage.data);

    $('div.last_episodes.loaddub > ul > li').each((i, el) => {
      list.push({
        animeId: $(el).find('p.name > a').attr('href').split('/')[1].split('-episode-')[0],
        episodeId: $(el).find('p.name > a').attr('href').split('/')[1],
        name: $(el).find('p.name > a').attr('title'),
        episodeNum: $(el).find('p.episode').text().replace('Episode ', '').trim(),
        subOrDub: $(el).find('div > a > div').attr('class').replace('type ic-', ''),
        imgUrl: $(el).find('div > a > img').attr('src')
      });
    });
    return list;
  } catch (err) {
    console.log(err);
    return { error: err };
  }
};



export const scrapeAnimeList = async ({ list = [], page = 1 }) => {
  try {
    const AnimeList = await axios.get(`${BASE_URL}/anime-list.html?page=${page}`);
    const $ = cheerio.load(AnimeList.data);

    $('div.anime_list_body > ul.listing > li').each((i, el) => {
      list.push({
        animeTitle: $(el).find('a').html().replace(/"/g, ""),
        animeId: $(el).find('a').attr('href').replace("/category/", ""),
        liTitle: $(el).attr('title')
      });
    });
    return list;
  } catch (err) {
    console.log(err);
    return { error: err };
  }
};

export const scrapeAnimeAZ = async ({ list = [], aph, page = 1 }) => {
  try {
    const AnimeAZ = await axios.get(`${BASE_URL}/anime-list-${aph}?page=${page}`);
    const $ = cheerio.load(AnimeAZ.data);

    $('div.anime_list_body > ul.listing > li').each((i, el) => {
      list.push({
        animeTitle: $(el).find('a').html().replace(/"/g, ""),
        animeId: $(el).find('a').attr('href').replace("/category/", ""),
        liTitle: $(el).attr('title')
      });
    });
    return list;
  } catch (err) {
    console.log(err);
    return { error: err };
  }
};

export const scrapeRecentlyAdded = async ({ list = [], page = 1 }) => {
  try {
    const RecentlyAdded = await axios.get(`${BASE_URL}/?page=${page}`);
    const $ = cheerio.load(RecentlyAdded.data);

    $('div.added_series_body.final ul.listing li').each((i, el) => {
      list.push({
        animeId: $(el).find('a').attr('href'),
        animeName: $(el).find('a').text()
      });
    });
    return list;
  } catch (err) {
    console.log(err);
    return { error: err };
  }
};

export const scrapeOngoingSeries = async ({ list = [], page = 1 }) => {
  try {
    const OngoingSeries = await axios.get(`${BASE_URL}/?page=${page}`);
    const $ = cheerio.load(OngoingSeries.data);

    $('nav.menu_series.cron ul li').each((i, el) => {
      list.push({
        animeId: $(el).find('a').attr('href'),
        animeName: $(el).find('a').text()
      });
    });
    return list;
  } catch (err) {
    console.log(err);
    return { error: err };
  }
};

export const scrapeNewSeason = async ({ list = [], page = 1 }) => {
  try {
    const popularPage = await axios.get(`
        ${BASE_URL + new_season_path}?page=${page}
        `);
    const $ = cheerio.load(popularPage.data);

    $('div.last_episodes > ul > li').each((i, el) => {
      list.push({
        animeId: $(el).find('p.name > a').attr('href').split('/')[2],
        animeTitle: $(el).find('p.name > a').attr('title'),
        imgUrl: $(el).find('div > a > img').attr('src'),
        status: $(el).find('p.released').text().trim()
      });
    });
    return list;
  } catch (err) {
    console.log(err);
    return { error: err };
  }
};

export const scrapeOngoingAnime = async ({ list = [], page = 1 }) => {
  try {
    const OngoingAnime = await axios.get(`${BASE_URL}/ongoing-anime.html?page=${page}`);
    const $ = cheerio.load(OngoingAnime.data);

    $('div.main_body div.last_episodes ul.items li').each((i, el) => {
      list.push({
        animeId: $(el).find('p.name > a').attr('href').split('/')[2],
        animeTitle: $(el).find('p.name > a').attr('title'),
        imgUrl: $(el).find('div > a > img').attr('src'),
        status: $(el).find('p.released').text().trim()
      });
    });
    return list;
  } catch (err) {
    console.log(err);
    return { error: err };
  }
};

export const scrapeCompletedAnime = async ({ list = [], page = 1 }) => {
  try {
    const CompletedAnime = await axios.get(`${BASE_URL}/completed-anime.html?page=${page}`);
    const $ = cheerio.load(CompletedAnime.data);

    $('div.main_body div.last_episodes ul.items li').each((i, el) => {
      list.push({
        animeId: $(el).find('p.name > a').attr('href').split('/')[2],
        animeTitle: $(el).find('p.name > a').attr('title'),
        imgUrl: $(el).find('div > a > img').attr('src'),
        status: $(el).find('p.released').text().trim()
      });
    });
    return list;
  } catch (err) {
    console.log(err);
    return { error: err };
  }
};

export const scrapePopularAnime = async ({ list = [], page = 1 }) => {
  try {
    const popularPage = await axios.get(`
        ${BASE_URL + popular_path}?page=${page}
       `);
    const $ = cheerio.load(popularPage.data);

    $('div.last_episodes > ul > li').each((i, el) => {
      list.push({
        animeId: $(el).find('p.name > a').attr('href').split('/')[2],
        animeTitle: $(el).find('p.name > a').attr('title'),
        imgUrl: $(el).find('div > a > img').attr('src'),
        status: $(el).find('p.released').text().trim()
      });
    });
    return list;
  } catch (err) {
    console.log(err);
    return { error: err };
  }
};

export const scrapeAnimeMovies = async ({ list = [], aph = '', page = 1 }) => {
  try {
    const popularPage = await axios.get(`
        ${BASE_URL + anime_movies_path}?aph=${aph.trim().toUpperCase()}&page=${page}
        `);
    const $ = cheerio.load(popularPage.data);

    $('div.last_episodes > ul > li').each((i, el) => {
      list.push({
        animeId: $(el).find('p.name > a').attr('href').split('/')[2],
        animeTitle: $(el).find('p.name > a').attr('title'),
        imgUrl: $(el).find('div > a > img').attr('src'),
        status: $(el).find('p.released').text().trim(),
      });
    });
    return list;
  } catch (err) {
    console.log(err);
    return { error: err };
  }
};

export const scrapeTopAiringAnime = async ({ list = [], page = 1 }) => {
  try {
    if (page == -1) {
      let pageNum = 1;
      let hasMore = true;
      while (hasMore) {
        const popular_page = await axios.get(`
                ${popular_ongoing_url}?page=${pageNum}
                `);
        const $ = cheerio.load(popular_page.data);

        if ($('div.added_series_body.popular > ul > li').length == 0) {
          hasMore = false;
          continue;
        }
        $('div.added_series_body.popular > ul > li').each((i, el) => {
          let genres = [];
          $(el)
            .find('p.genres > a')
            .each((i, el) => {
              genres.push($(el).attr('title'));
            });
          list.push({
            animeId: $(el).find('a:nth-child(1)').attr('href').split('/')[2],
            animeTitle: $(el).find('a:nth-child(1)').attr('title'),
            animeImg: $(el)
              .find('a:nth-child(1) > div')
              .attr('style')
              .match('(https?://.*.(?:png|jpg))')[0],
            latestEp: $(el).find('p:nth-child(4) > a').text().trim(),
            animeUrl: BASE_URL + '/' + $(el).find('a:nth-child(1)').attr('href'),
            genres: genres,
          });
        });
        pageNum++;
      }
      return list;
    }

    const popular_page = await axios.get(`
        ${popular_ongoing_url}?page=${page}
        `);
    const $ = cheerio.load(popular_page.data);

    $('div.added_series_body.popular > ul > li').each((i, el) => {
      let genres = [];
      $(el)
        .find('p.genres > a')
        .each((i, el) => {
          genres.push($(el).attr('title'));
        });
      list.push({
        animeId: $(el).find('a:nth-child(1)').attr('href').split('/')[2],
        animeTitle: $(el).find('a:nth-child(1)').attr('title'),
        animeImg: $(el)
          .find('a:nth-child(1) > div')
          .attr('style')
          .match('(https?://.*.(?:png|jpg))')[0],
        latestEp: $(el).find('p:nth-child(4) > a').text().trim(),
        animeUrl: BASE_URL + '/' + $(el).find('a:nth-child(1)').attr('href'),
        genres: genres,
      });
    });

    return list;
  } catch (err) {
    console.log(err);
    return { error: err };
  }
};

export const scrapeGenre = async ({ list = [], genre, page = 1 }) => {
  try {
    genre = genre.trim().replace(/ /g, '-').toLowerCase();

    if (Genres.indexOf(genre) > -1) {
      const genrePage = await axios.get(`${BASE_URL}genre/${genre}?page=${page}`);
      const $ = cheerio.load(genrePage.data);

      $('div.last_episodes > ul > li').each((i, elem) => {
        list.push({
          animeId: $(elem).find('p.name > a').attr('href').split('/')[2],
          animeTitle: $(elem).find('p.name > a').attr('title'),
          animeImg: $(elem).find('div > a > img').attr('src'),
          releasedDate: $(elem).find('p.released').text().trim(),
          animeUrl: BASE_URL + '/' + $(elem).find('p.name > a').attr('href'),
        });
      });
      return list;
    }
    return { error: 'Genre Not Found' };
  } catch (err) {
    console.log(err);
    return { error: err };
  }
};

// scrapeGenre({ genre: "cars", page: 1 }).then((res) => console.log(res))

/**
 * @param {string} id anime id.
 * @returns Resolves when the scraping is complete.
 * @example
 * scrapeGoGoAnimeInfo({id: "naruto"})
 * .then((res) => console.log(res)) // => The anime information is returned in an Object.
 * .catch((err) => console.log(err))
 *
 */
export const scrapeAnimeDetails = async ({ id }) => {
  try {
    let genres = [];
    let epList = [];

    const animePageTest = await axios.get(`${BASE_URL}/category/${id}`);

    const $ = cheerio.load(animePageTest.data);

    const animeTitle = $('div.anime_info_body_bg > h1').text();
    const animeImage = $('div.anime_info_body_bg > img').attr('src');
    const type = $('div.anime_info_body_bg > p:nth-child(4) > a').text();
    const desc = $('div.anime_info_body_bg > div.description')
      .text()
      .replace('Plot Summary: ', '');
    const releasedDate = $('div.anime_info_body_bg > p:nth-child(8)')
      .text()
      .replace('Released: ', '');
    const status = $('div.anime_info_body_bg > p:nth-child(9) > a').text();
    const otherName = $('div.anime_info_body_bg > p:nth-child(10)')
      .text()
      .replace('Other name: ', '')
      .replace(/;/g, ',');

    $('div.anime_info_body_bg > p:nth-child(7) > a').each((i, elem) => {
      genres.push($(elem).attr('title').trim());
    });

    const ep_start = $('#episode_page > li').first().find('a').attr('ep_start');
    const ep_end = $('#episode_page > li').last().find('a').attr('ep_end');
    const movie_id = $('#movie_id').attr('value');
    const alias = $('#alias_anime').attr('value');
    const episode_info_html = $('div.anime_info_episodes_next').html();
