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

## Commits

Create a commit with the proposed changes:

- Commit title and message (and PR title and description) must adhere to [conventionalcommits](https://www.conventionalcommits.org).

  - The title must begin with:
    - `feat(scope): title`
    - `fix(scope): title`
    - `refactor(scope): title`
    - `chore(scope): title`
    - `build(scope): title`
    - `ci(scope): title`
    - `docs(scope): title`
    - `perf(scope): title`
    - `test(scope): title`
  - Title should be lowercase.
  - No period at the end of the title.

- Commit message should describe _motivation_. Think about your code reviewers and what information they need in
  order to understand what you did.

- The scope should indicate which module the proposed change impacts.

  - Current scopes as of 2021-02-24 are:
    - `slo` for code related to SLOs
    - `archive-bucket` for code related to the S3 Archival Bucket construct
    - `artifact-bucket` for code related to the S3 Bucket for CodePipeline Artifacts construct
    - `https-alb` for code related to the Application Load Balancer module
    - `pipeline-notifications` for code related to the notification conmstruct for CodePipeline state changes
    - `slack-approval` for code related to the CodePipeline Slack approval construct
    - `stack-tags` for code related to the creation of required tags on CDK-created resources

- Commit message should indicate which issues are fixed (if any): `fixes #<issue>` or `closes #<issue>`.

- If not obvious (i.e. from unit tests), describe how you verified that your change works.

- If this commit addresses a JIRA ticket, indicate which JIRA ticket is addressed by including the number in the commit body.

- If this commit includes breaking changes, they must be listed at the end in the following format (notice how multiple breaking changes should be formatted):

```console
BREAKING CHANGE: Description of what broke and how to achieve this behavior now
* **module-name:** Another breaking change
* **module-name:** Yet another breaking change
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
   npm version [major | minor | patch]
   ```

   This will update the CHANGELOG, create a tag for the new version, and create/push a branch named 'bump-\<new-version\>'.

1. Create a PR for this change.
1. Once merged, publish the version to npm:

   ```shell
   git checkout <new-version>
   npm publish --access public
   ```
