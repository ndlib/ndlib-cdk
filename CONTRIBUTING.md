# Contributing

## Getting Started

Requires Node.js >= 10.3.0

```shell
git clone https://github.com/ndlib/ndlib-cdk.git
cd ndlib-cdk
npm install
```

## Building and Testing

```shell
npm run build
npm test
```

Can also watch for changes and do both build and tests with the watch script (_Note: currently only works for changes to src_)

```shell
npm run watch
```

## Pull Requests

Before submitting a PR, make sure to run all of the following:

```shell
npm run build
npm run coverage && open coverage/lcov-report/index.html
npm run lint
npm run format
```

## Publishing

1. Bump the version, ex:

```shell
npm version patch
```

This will create a tag for the new version and create/push a branch named 'bump-\<new-version\>'.

1. Update the CHANGELOG.md with changes since last version and push
1. Create a PR for this change.
1. Once merged, publish the version to npm:

```shell
git checkout v1.0.1
npm publish --access public
```
