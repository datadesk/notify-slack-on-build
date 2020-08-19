// types
import type { WebClient } from '@slack/web-api';

interface Channel {
  id: string;
  name: string;
}

export async function findChannelIds({
  channelName,
  slack,
}: {
  channelName: string[];
  slack: WebClient;
}) {
  // peel off any identifiers
  const names = channelName.map((name) =>
    name.replace('#', '').replace('@', '')
  );

  // how many to search for
  const numberToFind = names.length;

  // how many we have found so far, to short circuit
  let numberFound = 0;

  // track the IDs we've found
  const channelIds: string[] = [];

  // Async iteration is similar to a simple for loop.
  // Use only the first two parameters to get an async iterator.
  for await (const page of slack.paginate('conversations.list', {
    exclude_archived: true,
    limit: 200,
    types: 'public_channel,private_channel',
  })) {
    // inspect each channel and see if the name has a match
    for (const channel of page.channels as Channel[]) {
      const index = names.indexOf(channel.name);

      // we found one
      if (index > -1) {
        channelIds[index] = channel.id;
        numberFound++;

        // we found them all! stop here.
        if (numberToFind === numberFound) {
          return channelIds;
        }
      }
    }
  }

  throw new Error(
    "Unable to find all input channels to notify. Make sure each channel's name is correct and that the Slack bot has been invited to each channel."
  );
}
