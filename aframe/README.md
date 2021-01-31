# zesty-aframe-sdk 

## Getting started

```sh
yarn
```

## Local dev server

```sh
yarn run serve
```

And also start the ad server.

## Build

```sh
yarn run build
```

## Prototyping with tunneling

If you'd like to test the changes you've made on a browser on a headset, the best way to do that is through tunnelling.

We use [`localtunnel`](https://localtunnel.github.io/www/).

Run the tunnel with: 

```sh
lt --port 8080
```

## Using the aframe inspector

It's a really handy tool that allows you to drag and drop items into place and edit them without having specify everything with code.

Simply activate it with: `<ctrl> + <alt> + i`.

## Automatically saving from the inspector

You can automatically save things from the inspector to the files, just download `aframe-watcher`.

```sh
yarn global add aframe-watcher
```
