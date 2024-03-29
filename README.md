# notify-slack-on-build

A GitHub Action that posts a message to Slack with the latest status of a [`baker`](https://github.com/datadesk/baker) page deployment

## Configuration

Before you can use this action, you need to create and install a Slack bot application with "OAuth scope" permissions that allow it to write messages and list channels. Slack's documentation includes [a guide you can follow](https://slack.com/help/articles/115005265703-Create-a-bot-for-your-workspace). As of this writing, the bot requires `channels:join`, `channels:read`, `chat:write` and `groups:read` scopes. 

Once you have a bot token with the proper permissions, you should make a channel for it to post into and ensure that it is invited to join. Then you need to edit your repository's settings and add two encrypted secrets that the action will use to post as the bot. GitHub has [a guide on how to do that](https://docs.github.com/en/actions/security-guides/encrypted-secrets). They are:

secret|description
:-----|:----------
`BAKER_BOT_SLACK_TOKEN`|Your bot's secret API key, found in the OAuth section of its configuration panel
`BAKER_BOT_SLACK_CHANNEL_NAME`|The name of the Slack channel where your bot is authorized to post

## Basic usage

See [action.yml](https://github.com/datadesk/notify-slack-on-build/blob/main/action.yml):

```yaml
steps:
# Install the dependencies
- uses: actions/checkout@v3
- uses: actions/setup-node@v3
  with:
    node-version: 16

# Send first Slack notification
- id: slack
  name: Create Slack notification
  uses: datadesk/notify-slack-on-build@v3
  with:
    slack-token: ${{ secrets.BAKER_BOT_SLACK_TOKEN }}
    channel-name: ${{ secrets.BAKER_BOT_SLACK_CHANNEL_NAME }}
    status: in_progress
    url: https://yourdomain.com/your-slug/

# Build your `baker` page and whatever else you'd like to do, like linting and deployment
- run: npm run build

# Send final Slack notification
- name: Update Slack notification (success)
  if: success()
  uses: datadesk/notify-slack-on-build@v3
  with:
    slack-token: ${{ secrets.BAKER_BOT_SLACK_TOKEN }}
    channel-id: ${{ steps.slack.outputs.channel-id }}
    status: success
    url: https://yourdomain.com/your-slug/
    message-id: ${{ steps.slack.outputs.message-id }}

- name: Update Slack notification (failure)
  if: failure()
  uses: datadesk/notify-slack-on-build@v3
  with:
   slack-token: ${{ secrets.BAKER_BOT_SLACK_TOKEN }}
   channel-id: ${{ steps.slack.outputs.channel-id }}
   status: failure
   url: https://yourdomain.com/your-slug/
   message-id: ${{ steps.slack.outputs.message-id }}
```

## Releasing

Releasing a new version requires three steps. After you finish making your edits to the `src` directory, you should compile the final distribution in `dist/`.

```bash
npm run package
```

Then update the examples in the README to point to the version number you plan to release. Finally, issue a [new GitHub release](https://github.com/datadesk/notify-slack-on-build/releases) with that same version name.

