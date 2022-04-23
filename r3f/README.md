# Zesty React-three-fiber Integration

This is the react-three-fiber SDK for Zesty Banner integration.

## Usage

Import the ZestyBanner component and add it to the scene like so:

```js
<ZestyBanner
   space={'YOUR_SPACE_ID'}
   creator={'YOUR_CREATOR_ID'}
   format={'YOUR_SPACE_FORMAT'}
   style={'YOUR_DESIRED_BANNER_STYLE'}
   position={[X, Y, Z]} />
```

## Building

If you've run `yarn` at the top level, you don't need to run it here again.

`yarn test` to build a development version.
`yarn build` to build a production version.
