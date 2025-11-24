/**
 * データソース設定
 */

export interface NewsSource {
  name: string;
  url: string;
  selector: string;
  enabled: boolean;
}

export const NEWS_SOURCES: NewsSource[] = [
  {
    name: 'Yahoo News',
    url: 'https://news.yahoo.co.jp/',
    selector: '.newsFeed_item',
    enabled: true,
  },
  {
    name: 'Hatena Bookmark',
    url: 'https://b.hatena.ne.jp/hotentry',
    selector: '.entrylist-contents',
    enabled: true,
  },
];

export const TWITTER_API_ENDPOINT = 'https://api.twitter.com/2';
