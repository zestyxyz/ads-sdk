/**
 * Parses ipfs:// links and IPFS hashes to URLs.
 * @param {String} uri The ipfs:// link or IPFS hash.
 * @returns A formatted URL to the IPFS resource.
 */
const parseIPFS = uri => {
    return uri.substring(0,4) === "ipfs" ? 
    `https://ipfs.zesty.market/ipfs/${uri.substring(7)}` :
    `https://ipfs.zesty.market/ipfs/${uri}`;
}

export { parseIPFS }