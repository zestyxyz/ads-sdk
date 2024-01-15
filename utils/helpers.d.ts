/**
 * Parses ipfs:// and ar:// links and IPFS hashes to URLs.
 * @param {String} uri The ipfs:// link or IPFS hash.
 * @returns A formatted URL to the IPFS resource.
 */
export function parseProtocol(uri: string): string;
/**
 * Retrieves an IPFS gateway to alleviate rate-throttling from using only a single gateway.
 * Selection is weighted random based on average latency.
 * @returns A weighted random public IPFS gateway
 */
export function getIPFSGateway(): string;
/**
 * For each of the following browser checking functions, we have a match with a
 * confidence of "Full" if both the feature detection check and user agent check
 * come back true. If only one of them comes back true, we have a match with a confidence
 * of "Partial". If neither are true, match is false and our confidence is "None".
 */
/**
 * Performs feature detection and a UA check to determine if user is using Oculus Browser.
 * @returns an object indicating whether there is a match and the associated confidence level.
 */
export function checkOculusBrowser(): {
    match: boolean;
    confidence: string;
};
/**
 * Performs feature detection and a UA check to determine if user is using Wolvic.
 * @returns an object indicating whether there is a match and the associated confidence level.
 */
export function checkWolvicBrowser(): {
    match: boolean;
    confidence: string;
};
/**
 * Performs feature detection and a UA check to determine if user is using Pico's browser.
 * @returns an object indicating whether there is a match and the associated confidence level.
 */
export function checkPicoBrowser(): Promise<{
    match: boolean;
    confidence: string;
}>;
/**
 * Performs feature detection and a UA check to determine if user is using a browser on their desktop.
 * @returns an object indicating whether there is a match and the associated confidence level.
 */
export function checkDesktopBrowser(): {
    match: boolean;
    confidence: string;
};
export function checkUserPlatform(): Promise<{
    platform: string;
    confidence: string;
}>;
export function openURL(url: any): void;
export function urlContainsUTMParams(url: any): boolean;
export function appendUTMParams(url: any, spaceId: any): string;
