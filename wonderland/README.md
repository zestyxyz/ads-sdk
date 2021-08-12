# zesty-wonderland-sdk

[Zesty Market](https://zesty.market) Ads integration for [Wonderland Engine](https://wonderlandengine.com).

## Getting started

### Using Internal Bundler

Build the SDK with the following commands (or download a prebuilt version from
[releases](https://github.com/zestymarket/zesty-sdk/releases)).

```sh
npm ci
npm run build
```

After building the SDK, copy `dist/zesty-wonderland-sdk.min.js` into your project
and add a JavaScript path. You will find the `zesty-ad` component in
"Property View > Add Component" after selecting any object.

Make sure that you set up a cursor to enable clicking.

### Using npm

Install the SDK in your project using npm:

```sh
npm i --save @zestymarket/wonderland-sdk
```

Then import it in your main bundle file:

```js
require('@zestymarket/wonderland-sdk/zesty-wonderland-sdk');
```

If your bundle built successfully, you will find the `zesty-ad` component in
"Property View > Add Component" after selecting any object.

Make sure that you set up a cursor to enable clicking.

## Configuring

To set up the `zesty-ad` component, make sure to create an annount and ad space,
[find more info here](https://docs.zesty.market/guides/creators).

 1. Right-click "root" > Add Object > Mesh
 2. Set mesh to "PrimitivePlane"
 3. Create a material in "Views > Resources > Materials"
 4. Assign the material to your plane
 5. Add a `zesty-ad` component and copy your creator id and ad into the respective
    properties
