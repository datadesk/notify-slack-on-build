// types
import type { SectionBlock } from '@slack/web-api';
import type { BuildStatus } from './index';

export function prepareBlocks({
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
}: {
  actor: string;
  branch: string;
  branchUrl: string;
  checkUrl: string;
  owner: string;
  previewUrl: string;
  repo: string;
  repoUrl: string;
  sha: string;
  shaUrl: string;
  status: BuildStatus;
  statusText: string;
}): [SectionBlock] {
  let text: string;
  let url: string;
  let buttonText: string;
  let style: string | undefined;

  switch (status) {
    case 'in_progress':
      text = ':construction: This commit is now building and deploying.';
      url = checkUrl;
      buttonText = 'View progress';
      break;
    case 'failure':
      text =
        ":no_entry: Something went wrong and this commit's build or deploy failed.";
      url = checkUrl;
      buttonText = 'View log';
      style = 'danger';
      break;
    case 'success':
      text =
        ":white_check_mark: This commit's build and deploy was successful!";
      url = previewUrl;
      buttonText = 'Open preview';
      style = 'primary';
      break;
  }

  // if a custom "status-text" was provided, override what was selected above
  if (statusText) {
    text = statusText;
  }

  const accessory = {
    type: 'button',
    url,
    text: {
      type: 'plain_text',
      text: buttonText,
    },
  };

  if (style) {
    accessory['style'] = style;
  }

  return [
    {
      type: 'section',
      text: { type: 'plain_text', text },
      fields: [
        { type: 'mrkdwn', text: `*Repo*\n<${repoUrl}|${owner}/${repo}>`, unfurl_links: false, },
        {
          type: 'mrkdwn',
          text: `*Branch*\n<${branchUrl}|\`${branch}\`>`,
          unfurl_links: false,
        },
        {
          type: 'mrkdwn',
          text: `*Commit*\n<${shaUrl}|\`${sha.slice(0, 8)}\`>`,
          unfurl_links: false,
        },
        {
          type: 'mrkdwn',
          text: `*User*\n${actor}`,
        },
      ],
      accessory,
    },
  ];
}
