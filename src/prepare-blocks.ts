// types
import type { SectionBlock } from '@slack/web-api';
import type { BuildStatus } from './index';

export function prepareBlocks({
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
}: {
  actor: string;
  branch: string;
  checkUrl: string;
  owner: string;
  previewUrl: string;
  repo: string;
  repoUrl: string;
  sha: string;
  shaUrl: string;
  status: BuildStatus;
}): [SectionBlock] {
  let text: string;
  let url: string;
  let buttonText: string;
  let style: string | undefined;

  switch (status) {
    case 'in_progress':
      text = ':construction: This commit is now building and deploying.';
      url = checkUrl;
      buttonText = 'View build progress';
      break;
    case 'error':
      text = ":no_entry: Something went wrong and this commit's build failed.";
      url = checkUrl;
      buttonText = 'View build logs';
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
        { type: 'mrkdwn', text: `*Repo*\n<${repoUrl}|${owner}/${repo}>` },
        {
          type: 'mrkdwn',
          text: `*Branch*\n${branch}`,
        },
        {
          type: 'mrkdwn',
          text: `*Commit*\n<${shaUrl}|\`${sha.slice(0, 8)}\`>`,
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
