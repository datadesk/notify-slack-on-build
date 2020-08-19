// packages
import { error, getInput, setFailed, setOutput } from '@actions/core';
import { context } from '@actions/github';
import {
  WebClient,
  ChatUpdateArguments,
  ChatPostMessageArguments,
} from '@slack/web-api';

// local
import { findChannelId } from './find-channel-id';
import { prepareBlocks } from './prepare-blocks';

// types
export type BuildStatus = 'in_progress' | 'error' | 'success';

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

    // Inputs
    const token = getInput('slack-token', { required: true });
    const channelName = getInput('channel-name', { required: true });
    const channelId = getInput('channel-id', { required: true });
    const status = getInput('status', { required: true }) as BuildStatus;
    const previewUrl = getInput('url', { required: true });
    const messageId = getInput('message-id', { required: false });

    // the authenticated Slack client
    const slack = new WebClient(token);

    const channel = Boolean(channelId)
      ? channelId
      : await findChannelId({ channelName, slack });

    // whether this is an update run or not
    const isUpdate = Boolean(messageId);

    const blocks = prepareBlocks({
      actor,
      branch,
      checkUrl,
      owner,
      previewUrl,
      repo,
      repoUrl,
      sha,
      shaUrl,
      status,
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
      payload.ts = messageId;
      payload.as_user = true;
      response = await slack.chat.update(payload as ChatUpdateArguments);
    } else {
      response = await slack.chat.postMessage(
        payload as ChatPostMessageArguments
      );
    }

    setOutput('message-id', response.ts as string);
    setOutput('channel-id', channel as string);
  } catch (e) {
    error(e);
    setFailed(e.message);
  }
}

run();
