// types
import type { SectionBlock } from '@slack/web-api';
import type { BuildStatus } from './index';

export function prepareBlocks({
  branch,
  checkUrl,
  owner,
  previewUrl,
  repo,
  repoUrl,
  status,
}: {
  branch: string;
  checkUrl: string;
  owner: string;
  previewUrl: string;
  repo: string;
  repoUrl: string;
  status: BuildStatus;
}): [SectionBlock] {
  let text: string;
  let url: string;
  let buttonText: string;
  let style: string | undefined;

  switch (status) {
    case 'in_progress':
      text = ':construction: This branch is now building and deploying.';
      url = checkUrl;
      buttonText = 'View build progress';
      break;
    case 'error':
      text = ':no_entry: Something went wrong and this build failed.';
      url = checkUrl;
      buttonText = 'View build logs';
      style = 'danger';
      break;
    case 'success':
      text = ':white_check_mark: The build and deploy was successful!';
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
      ],
      accessory,
    },
  ];
}
