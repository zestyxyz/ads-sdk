# zesty-sdk

The Zesty SDK allows developers to integrate their app into the Zesty Network. More docs: https://docs.zesty.market

Currently, we support the following platforms:

- [aframe](https://github.com/zestymarket/zesty-sdk/tree/main/aframe)
- [babylon.js](https://github.com/zestymarket/zesty-sdk/tree/main/babylonjs)
- [react-three-fiber](https://github.com/zestymarket/zesty-sdk/tree/main/r3f)
- [three.js](https://github.com/zestymarket/zesty-sdk/tree/main/threejs)
- [web](https://github.com/zestymarket/zesty-sdk/tree/main/web)
- [wonderland](https://github.com/zestymarket/zesty-sdk/tree/main/wonderland)

## What's Zesty?

Zesty is an open and permissionless monetization protocol for creators of content. It is open in the sense that anyone can integrate our SDK to monetize their apps, without the permission of a centralized authority.

## Publishing to NPM

If you've developed a new framework SDK and want to publish it to NPM, the steps are as follows:

- Ensure you are a member of the zestymarket org on NPM.
- Ensure that the name in the package.json for the SDK follows the `@zestymarket/<framework>-sdk` format.
- In the directory for that SDK, run `npm publish --access public` and the SDK will be published to the zestymarket NPM org.
