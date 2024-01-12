export function fetchCampaignAd(adUnitId: any, format?: string, style?: string): Promise<any>;
/**
 * Increment the on-load event count for the space
 * @param {string} spaceId The space ID
 * @returns A Promise representing the POST request
 */
export function sendOnLoadMetric(spaceId: string, campaignId?: any): Promise<void>;
export function sendOnClickMetric(spaceId: any, campaignId?: any): Promise<void>;
export function analyticsSession(spaceId: any, campaignId: any): Promise<void>;
