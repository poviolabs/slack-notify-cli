"use strict";
/*
 Notify a Slack channel
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const web_api_1 = require("@slack/web-api");
const node_stage_1 = require("node-stage");
const cli_1 = require("node-stage/cli");
const yargs_1 = require("node-stage/yargs");
const git_1 = require("node-stage/git");
const chalk_1 = require("node-stage/chalk");
const version_helper_1 = require("../helpers/version.helper");
class SlackOptions {
}
__decorate([
    (0, yargs_1.Option)({ envAlias: "PWD", demandOption: true }),
    __metadata("design:type", String)
], SlackOptions.prototype, "pwd", void 0);
__decorate([
    (0, yargs_1.Option)({ envAlias: "STAGE", demandOption: true }),
    __metadata("design:type", String)
], SlackOptions.prototype, "stage", void 0);
__decorate([
    (0, yargs_1.Option)({ envAlias: "SERVICE" }),
    __metadata("design:type", String)
], SlackOptions.prototype, "service", void 0);
__decorate([
    (0, yargs_1.Option)({
        envAlias: "SLACK_ACCESS_TOKEN",
        demandOption: true,
    }),
    __metadata("design:type", String)
], SlackOptions.prototype, "accessToken", void 0);
__decorate([
    (0, yargs_1.Option)({
        envAlias: "SLACK_CHANNEL",
        configAlias: (c) => c.slackNotify?.channel,
        demandOption: true,
    }),
    __metadata("design:type", String)
], SlackOptions.prototype, "channel", void 0);
__decorate([
    (0, yargs_1.Option)({
        envAlias: "RELEASE",
        envAliases: ["CIRCLE_SHA1", "BITBUCKET_COMMIT", "GITHUB_SHA"],
        demandOption: true,
    }),
    __metadata("design:type", String)
], SlackOptions.prototype, "release", void 0);
__decorate([
    (0, yargs_1.Option)({
        envAlias: "RELEASE_STRATEGY",
        default: "gitsha",
        choices: ["gitsha", "gitsha-stage"],
        type: "string",
    }),
    __metadata("design:type", String)
], SlackOptions.prototype, "releaseStrategy", void 0);
__decorate([
    (0, yargs_1.Option)({
        envAlias: "APP_VERSION",
        envAliases: ["CIRCLE_TAG", "BITBUCKET_TAG"],
        type: "string",
    }),
    __metadata("design:type", String)
], SlackOptions.prototype, "appVersion", void 0);
__decorate([
    (0, yargs_1.Option)({
        demandOption: true,
        choices: ["success", "failure", "info"],
        default: "info",
    }),
    __metadata("design:type", String)
], SlackOptions.prototype, "messageType", void 0);
__decorate([
    (0, yargs_1.Option)({ demandOption: false }),
    __metadata("design:type", String)
], SlackOptions.prototype, "message", void 0);
__decorate([
    (0, yargs_1.Option)({ demandOption: false, describe: "Prefix of the Pull Requests" }),
    __metadata("design:type", String)
], SlackOptions.prototype, "autolinkPrefix", void 0);
__decorate([
    (0, yargs_1.Option)({ demandOption: false, describe: "Prefix of the Ticket url" }),
    __metadata("design:type", String)
], SlackOptions.prototype, "autolinkTarget", void 0);
__decorate([
    (0, yargs_1.Option)({ demandOption: false, describe: "Prefix of the Commit Url" }),
    __metadata("design:type", String)
], SlackOptions.prototype, "commitPrefix", void 0);
__decorate([
    (0, yargs_1.Option)({ demandOption: false, describe: "Name of the project" }),
    __metadata("design:type", String)
], SlackOptions.prototype, "projectName", void 0);
__decorate([
    (0, yargs_1.Option)({
        envAlias: "BRANCH_NAME",
        envAliases: ["CIRCLE_BRANCH", "BITBUCKET_BRANCH", "GITHUB_REF_NAME"],
        demandOption: false,
    }),
    __metadata("design:type", String)
], SlackOptions.prototype, "branchName", void 0);
__decorate([
    (0, yargs_1.Option)({
        envAlias: "BUILD_URL",
        envAliases: ["CIRCLE_BUILD_URL"],
        demandOption: false,
    }),
    __metadata("design:type", String)
], SlackOptions.prototype, "buildUrl", void 0);
__decorate([
    (0, yargs_1.Option)({
        demandOption: false,
    }),
    __metadata("design:type", Boolean)
], SlackOptions.prototype, "verbose", void 0);
__decorate([
    (0, yargs_1.Option)({
        demandOption: false,
    }),
    __metadata("design:type", Boolean)
], SlackOptions.prototype, "dryRun", void 0);
__decorate([
    (0, yargs_1.Option)({
        envAlias: "REPO_NAME",
        envAliases: [
            "CIRCLE_PROJECT_REPONAME",
            "BITBUCKET_REPO_SLUG",
            "GITHUB_REPOSITORY",
        ],
        demandOption: false,
    }),
    __metadata("design:type", String)
], SlackOptions.prototype, "repoName", void 0);
exports.command = {
    command: "$0",
    describe: "Send Status to Slack",
    builder: async (y) => {
        return y
            .options((0, yargs_1.getYargsOptions)(SlackOptions))
            .middleware(async (_argv) => {
            return (await (0, yargs_1.loadYargsConfig)(SlackOptions, _argv, "slackNotify"));
        }, true);
    },
    handler: async (_argv) => {
        const argv = (await _argv);
        const { pwd, accessToken, channel } = argv;
        const { message, text } = slackTemplate({
            ...argv,
            gitSha: await (0, git_1.getSha)(pwd),
            gitShortSha: await (0, git_1.getShortSha)(pwd),
            commitMessage: await (0, git_1.getCommitMessage)(pwd),
        });
        if (argv.verbose) {
            await (0, chalk_1.loadColors)();
            (0, cli_1.logBanner)(`NodeStage ${(0, version_helper_1.getVersion)()}`);
            for (const [k, v] of Object.entries(await (0, cli_1.getToolEnvironment)(argv))) {
                (0, cli_1.logVariable)(k, v);
            }
            (0, cli_1.logBanner)("Variables");
            for (const [k] of Object.entries((0, yargs_1.getYargsOption)(SlackOptions)).filter(([k]) => k !== "accessToken")) {
                (0, cli_1.logVariable)(k, argv[k]);
            }
            (0, cli_1.logBanner)("Slack Message");
            console.log(message);
        }
        if (argv.dryRun) {
            return;
        }
        const web = new web_api_1.WebClient(accessToken);
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
function slackTemplate(o) {
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
    const deployName = `${o.repoName ? `${o.repoName}:` : ""}${o.appVersion || o.branchName || ""}`;
    let text = `[${templates[o.messageType].icon}] ${deployName}`;
    if (o.message) {
        text += ` ${o.message}`;
    }
    if (o.buildUrl) {
        out += `<${o.buildUrl}|${deployName}>`;
    }
    else {
        out += deployName;
    }
    if (o.service) {
        out += ` Service: ${o.service}`;
    }
    if (o.commitPrefix) {
        out += `\n\t\t :memo: <${o.commitPrefix}${o.gitSha}|${o.gitShortSha}>\t`;
    }
    else {
        out += `\n\t\t :memo: ${o.gitShortSha}\t`;
    }
    if (o.autolinkTarget && o.autolinkPrefix) {
        out += `_${o.commitMessage.replace(new RegExp(`\\b${o.autolinkPrefix}[a-zA-Z0-9]+\\b`, "gm"), (a) => {
            return `<${o.autolinkTarget}|${a}>`;
        })}_`;
    }
    else {
        out += `_${o.commitMessage}_`;
    }
    if (o.message) {
        out += `\n${o.message}`;
    }
    return { text, message: out };
}
//# sourceMappingURL=slack.command.js.map