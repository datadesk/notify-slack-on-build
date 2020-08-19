// types
import type { WebClient, ConversationsListArguments } from '@slack/web-api';

interface Channel {
  id: string;
  name: string;
}

export async function findChannelId({
  channelName,
  slack,
}: {
  channelName: string;
  slack: WebClient;
}) {
  // peel off any identifiers
  const name = channelName.replace('#', '').replace('@', '');

  // Async iteration is similar to a simple for loop.
  // Use only the first two parameters to get an async iterator.
  for await (const page of slack.paginate('conversations.list', {
    exclude_archived: true,
    limit: 200,
    types: 'public_channel,private_channel',
  })) {
    // inspect each channel and see if the name matches
    for (const channel of page.channels as Channel[]) {
      if (channel.name === name) {
        return channel.id;
      }
    }
  }
}
