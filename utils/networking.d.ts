export function fetchCampaignAd(adUnitId: any, format?: string, style?: string): Promise<any>;
/**
 * Increment the on-load event count for the ad unit
 * @param {string} adUnitId The ad unit ID
 * @returns A Promise representing the POST request
 */
export function sendOnLoadMetric(adUnitId: string, campaignId?: any): Promise<void>;
export function sendOnClickMetric(adUnitId: any, campaignId?: any): Promise<void>;
export function analyticsSession(adUnitId: any, campaignId: any): Promise<void>;
