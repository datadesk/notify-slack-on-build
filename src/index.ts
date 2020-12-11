// packages
import { error, getInput, setFailed, setOutput } from '@actions/core';
import { context } from '@actions/github';
import {
  WebClient,
  ChatUpdateArguments,
  ChatPostMessageArguments,
} from '@slack/web-api';

// local
import { findChannelIds } from './find-channel-id';
import { prepareBlocks } from './prepare-blocks';

// types
import type { InputOptions } from '@actions/core';
export type BuildStatus = 'in_progress' | 'failure' | 'success';

function getInputAsArray(name: string, options?: InputOptions): string[] {
  return getInput(name, options)
    .split('\n')
    .map((s) => s.trim())
    .filter((x) => x !== '');
}

function setOutputAsNewlineDelimited(name: string, values: string[]) {
  setOutput(name, values.join('\n'));
}

async function run() {
  try {
    // The commit SHA that triggered this run
    const { actor, ref, sha } = context;

    // The owner and repo names of this repository
    const { owner, repo } = context.repo;

    // the URL of the repo
    const repoUrl = `https://github.com/${owner}/${repo}`;

    // the URL to the commit
    const shaUrl = `${repoUrl}/commit/${sha}`;

    // The prepared URL to the workflow's check page
    const checkUrl = `${shaUrl}/checks`;

    // pull branch name off the ref
    const parts = ref.split('/');
    const branch = parts[parts.length - 1];

    // build the URL directly to the branch
    const branchUrl = `${repoUrl}/tree/${branch}`;

    // Inputs
    const token = getInput('slack-token', { required: true });
    const channelName = getInputAsArray('channel-name', { required: false });
    const channelId = getInputAsArray('channel-id', { required: false });
    const status = getInput('status', { required: true }) as BuildStatus;
    const statusText = getInput('status-text', { required: false });
    const previewUrl = getInput('url', { required: true });
    const messageId = getInputAsArray('message-id', { required: false });

    // the authenticated Slack client
    const slack = new WebClient(token);

    // determine whether we're using channel-id
    const channels =
      channelId.length > 0
        ? channelId
        : await findChannelIds({ channelName, slack });

    // whether this is an update run or not
    const isUpdate = messageId.length > 0;

    if (isUpdate && channels.length !== messageId.length) {
      throw new Error(
        'There must be the same number of channel IDs and message IDs during an update run.'
      );
    }

    // track generated messageIds
    const messageIds: string[] = [];

    for (let idx = 0; idx < channels.length; idx++) {
      const channel = channels[idx];

      const blocks = prepareBlocks({
        actor,
        branch,
        branchUrl,
        checkUrl,
        owner,
        previewUrl,
        repo,
        repoUrl,
        sha,
        shaUrl,
        status,
        statusText,
      });

      // the notification/fallback text
      const text = `Project build${
        isUpdate ? ' update ' : ' '
      }for ${owner}/${repo}`;

      const payload: ChatUpdateArguments | ChatPostMessageArguments = {
        blocks,
        channel,
        text,
      };

      let response;

      if (isUpdate) {
        payload.ts = messageId[idx];
        payload.as_user = true;
        response = await slack.chat.update(payload as ChatUpdateArguments);
      } else {
        response = await slack.chat.postMessage(
          payload as ChatPostMessageArguments
        );
      }

      messageIds[idx] = response.ts;
    }

    setOutputAsNewlineDelimited('message-id', messageIds);
    setOutputAsNewlineDelimited('channel-id', channels);
  } catch (e) {
    error(e);
    setFailed(e.message);
  }
}

run();
