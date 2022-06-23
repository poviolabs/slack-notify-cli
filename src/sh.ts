#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { command as slackCommand } from "./commands/slack.command";
import { getVersion, logError, logInfo } from "node-stage";

yargs(hideBin(process.argv))
  .version(getVersion() || "unknown")
  .scriptName("node-stage")
  .command(slackCommand)
  .help()
  .demandCommand(1)
  .strictCommands(true)
  .showHelpOnFail(true)
  .fail((msg, err, yargs) => {
    if (msg) logError(msg);
    if (err) {
      if (!!process.env.VERBOSE) {
        console.error(err);
      } else {
        logError(err.message);
      }
    }
    logInfo("Use '--help' for more info");
    process.exit(1);
  })
  .parse();
