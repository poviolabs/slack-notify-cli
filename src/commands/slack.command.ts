/*
 Notify a Slack channel
 */

import yargs from "yargs";
import { WebClient } from "@slack/web-api";

import {
  Config,
  getVersion,
  getToolEnvironment,
  logBanner,
  logVariable,
  getCommitMessage,
  getSha,
  getShortSha,
  ReleaseStrategy,
  getYargsOptions,
  Option,
  YargsOptions,
  loadYargsConfig,
  getYargsOption,
} from "@povio/node-stage";

class SlackOptions implements YargsOptions {
  @Option({ envAlias: "PWD", demandOption: true })
  pwd!: string;

  @Option({ envAlias: "STAGE", demandOption: true })
  stage!: string;

  @Option({ envAlias: "SERVICE" })
  service?: string;

  @Option({
    envAlias: "SLACK_ACCESS_TOKEN",
    demandOption: true,
  })
  accessToken!: string;

  @Option({
    envAlias: "SLACK_CHANNEL",
    configAlias: (c) => c.slackNotify?.channel,
    demandOption: true,
  })
  channel!: string;

  @Option({
    envAlias: "RELEASE",
    envAliases: ["CIRCLE_SHA1", "BITBUCKET_COMMIT", "GITHUB_SHA"],
    demandOption: true,
  })
  release!: string;

  @Option({
    envAlias: "RELEASE_STRATEGY",
    default: "gitsha",
    choices: ["gitsha", "gitsha-stage"],
    type: "string",
  })
  releaseStrategy!: ReleaseStrategy;

  @Option({
    envAlias: "APP_VERSION",
    envAliases: ["CIRCLE_TAG", "BITBUCKET_TAG"],
    type: "string",
  })
  appVersion!: string;

  @Option({
    demandOption: true,
    choices: ["success", "failure", "info"],
    default: "info",
  })
  messageType!: "success" | "failure" | "info";

  @Option({ demandOption: false })
  message!: string;

  @Option({ demandOption: false, describe: "Prefix of the Pull Requests" })
  autolinkPrefix!: string;

  @Option({ demandOption: false, describe: "Prefix of the Ticket url" })
  autolinkTarget!: string;

  @Option({ demandOption: false, describe: "Prefix of the Commit Url" })
  commitPrefix!: string;

  @Option({ demandOption: false, describe: "Name of the project" })
  projectName!: string;

  @Option({
    envAlias: "BRANCH_NAME",
    envAliases: ["CIRCLE_BRANCH", "BITBUCKET_BRANCH", "GITHUB_REF_NAME"],
    demandOption: false,
  })
  branchName!: string;

  @Option({
    envAlias: "BUILD_URL",
    envAliases: ["CIRCLE_BUILD_URL"],
    demandOption: false,
  })
  buildUrl!: string;

  @Option({
    demandOption: false,
  })
  verbose!: boolean;

  @Option({
    demandOption: false,
  })
  dryRun!: boolean;

  @Option({
    envAlias: "REPO_NAME",
    envAliases: [
      "CIRCLE_PROJECT_REPONAME",
      "BITBUCKET_REPO_SLUG",
      "GITHUB_REPOSITORY",
    ],
    demandOption: false,
  })
  repoName!: string;

  config!: Config;
}

export const command: yargs.CommandModule = {
  command: "$0",
  describe: "Send Status to Slack",
  builder: async (y) => {
    return y
      .options(getYargsOptions(SlackOptions))
      .middleware(async (_argv) => {
        return (await loadYargsConfig(
          SlackOptions,
          _argv as any,
          "slackNotify"
        )) as any;
      }, true);
  },
  handler: async (_argv) => {
    const argv = (await _argv) as unknown as SlackOptions;

    const { pwd, accessToken, channel } = argv;

    const { message, text } = slackTemplate({
      ...argv,
      gitSha: await getSha(pwd),
      gitShortSha: await getShortSha(pwd),
      commitMessage: await getCommitMessage(pwd),
    });

    if (argv.verbose) {
      logBanner(`NodeStage ${getVersion()}`);
      for (const [k, v] of Object.entries(await getToolEnvironment(argv))) {
        logVariable(k, v);
      }
      logBanner("Variables");
      for (const [k] of Object.entries(getYargsOption(SlackOptions)).filter(
        ([k]) => k !== "accessToken"
      )) {
        logVariable(k, argv[k as keyof SlackOptions]);
      }
      logBanner("Slack Message");
      console.log(message);
    }

    if (argv.dryRun) {
      return;
    }

    const web = new WebClient(accessToken);
    await web.chat.postMessage({
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: message,
          },
        },
      ],
      text,
      channel: channel,
      unfurl_links: false,
      unfurl_media: false,
    });
  },
};

function slackTemplate(o: {
  appVersion?: string;
  branchName?: string;
  repoName?: string;
  buildUrl?: string;
  autolinkPrefix?: string;
  autolinkTarget?: string;
  commitPrefix?: string;
  projectName?: string;
  commitMessage: string;
  message?: string;
  messageType: "success" | "info" | "failure";
  gitSha: string;
  gitShortSha: string;
  service?: string;
}) {
  const templates = {
    success: {
      icon: ":large_green_circle:",
    },
    info: {
      icon: ":information_source:",
    },
    failure: {
      icon: ":red_circle:",
    },
  };

  let out = `${templates[o.messageType].icon} `;

  if (o.projectName) {
    out += `*${o.projectName}* `;
  }

  const deployName = `${o.repoName ? `${o.repoName}:` : ""}${
    o.appVersion || o.branchName || ""
  }`;

  let text = `[${templates[o.messageType].icon}] ${deployName}`;

  if (o.message) {
    text += ` ${o.message}`;
  }

  if (o.buildUrl) {
    out += `<${o.buildUrl}|${deployName}>`;
  } else {
    out += deployName;
  }

  if (o.service) {
    out += ` Service: ${o.service}`;
  }

  if (o.commitPrefix) {
    out += `\n\t\t :memo: <${o.commitPrefix}${o.gitSha}|${o.gitShortSha}>\t`;
  } else {
    out += `\n\t\t :memo: ${o.gitShortSha}\t`;
  }

  if (o.autolinkTarget && o.autolinkPrefix) {
    out += `_${o.commitMessage.replace(
      new RegExp(`\\b${o.autolinkPrefix}[a-zA-Z0-9]+\\b`, "gm"),
      (a: string) => {
        return `<${o.autolinkTarget}|${a}>`;
      }
    )}_`;
  } else {
    out += `_${o.commitMessage}_`;
  }

  if (o.message) {
    out += `\n${o.message}`;
  }

  return { text, message: out };
}
