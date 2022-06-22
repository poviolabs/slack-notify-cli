# Slack Notify Cli

CLI tool to post slack messages

# Setup

```bash
yarn add slack-notify-cli@poviolabs/slack-notify-cli#v1

# update
yarn up slack-notify-cli@poviolabs/slack-notify-cli#v1
```

## Example

```yaml
stages:
  myapp-prd:
    ecs_deploy:
      slackChannel: C03AXDS9F2B
      slackAutolinkPrefix: SP-
      slackAutolinkTarget: https://github.com/poviolabs/slack-notify-cli/issues/
      slackCommitPrefix: https://github.com/poviolabs/slack-notify-cli/commit/
      slackProjectName: ECS-Deploy
```


```bash
yarn slack-notify-cli --messageType success
yarn slack-notify-cli --messageType failure
yarn slack-notify-cli --messageType info --message A custom message!
```

## Options

#### --pwd

Root from where to fetch `config.yaml` and the base for all relative paths.

#### --stage

The slug of the deployment (ie. prd/stg/dev). Used in config.yaml.

#### --message

Any text appended to the Slack message

#### --messageType \[success|failure|info\]

#### --release

Release of the build (ie the git sha) and is unique per code.

#### --appVersion

Version of the deploy. Tied to a specific Release and Stage.
If supplied with a semver format, the version will be prefixed with `${STAGE}`

#### --releaseStrategy

- gitsha - make the same build for all stages
- gitsha-stage - make a build based on the stage and git sha in cases where the build is different per stage


## Development

### Test locally

```bash
# test with ts-node
yarn test:ts-node:cli --help

# build new version
yarn build

# test build
yarn test:cli --help
```
