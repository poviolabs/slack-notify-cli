# Slack Notify Cli

CLI tool to post slack messages. Uses the [node-stage](https://github.com/poviolabs/node-stage) tool for configuration.

# Setup

```bash
yarn add slack-notify-cli@poviolabs/slack-notify-cli#v1

# update
yarn up slack-notify-cli@poviolabs/slack-notify-cli#v1
```

## Example

```yaml
slackNotify: &slackNotify
    slackChannel: C03AXDS9F2B
    autolinkPrefix: NS-
    autolinkTarget: https://github.com/poviolabs/node-stage/issues/
    commitPrefix: https://github.com/poviolabs/node-stage/commit/
    projectName: NodeStage

stages:
    myapp-prd:
      slackNotify:
        <<: *slackNotify

```


```bash
yarn slack-notify-cli --messageType success
yarn slack-notify-cli --messageType failure
yarn slack-notify-cli --messageType info --message A custom message!
```

## Options

#### --message

Any text appended to the Slack message

#### --channel

The Slack channel to send the message to. Right-click copy url on the channel to find it. Example: `C03AXDS9F2B`

#### --messageType \[ success | failure | info \]

#### --appVersion

Version of the deploy. Tied to a specific Release and Stage combination.
If supplied with a semver format, the version will be prefixed with `${STAGE}`

#### --autolinkPrefix

Prefix to detect the ticket id.

#### --autolinkTarget

The url prefix that is generated for the ticket id.

#### --commitPrefix

The url that is generated for the commit sha.

#### --projectName

Name of the project as presented in Slack.

#### --branchName

Name of the branch deployed. Auto-detected from most CI/CD services.

#### --dryRun --verbose

Run and output the Slack template without actually sending the message.

> More options can be found [here](https://github.com/poviolabs/node-stage#options).

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
