import { test, expect } from '@playwright/test';
import { fetchCampaignAd } from '../../utils/networking.js';
const DEFAULT_BANNER = 'https://zesty-storage-09e38383232656-staging.s3.amazonaws.com/images/zesty/zesty-banner-tall.png'

test.describe('fetchCampaignAd', () => {
  test('fetchCampaignAd should return a default banner if no URI is given', () => {
    return expect(fetchCampaignAd()).resolves.toMatchObject(
      [{ asset_url: DEFAULT_BANNER, cta_url: 'https://www.zesty.market' }]
    )
  });
});