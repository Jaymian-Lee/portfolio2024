const { STREAM_CHANNEL, STREAM_MESSAGES_KEY, json, kvCommand, kvPipeline, parsePlatforms } = require('../_shared');

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_HANDLE = (process.env.YOUTUBE_HANDLE || '@JaymianLee').trim();
const YOUTUBE_CHANNEL_ID = (process.env.YOUTUBE_CHANNEL_ID || '').trim();

const YT_CONNECTED_KEY = 'stream:youtube:connected';
const YT_LAST_TS_KEY = 'stream:youtube:lastTs';
const YT_NEXT_POLL_KEY = 'stream:youtube:nextPollAt';

async function ytFetch(path, params) {
  const query = new URLSearchParams({ ...params, key: YOUTUBE_API_KEY }).toString();
  const response = await fetch(`https://www.googleapis.com/youtube/v3/${path}?${query}`);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error?.message || 'YouTube API error');
  }
  return data;
}

async function resolveChannelId() {
  if (YOUTUBE_CHANNEL_ID) return YOUTUBE_CHANNEL_ID;

  const q = YOUTUBE_HANDLE.replace(/^@/, '');
  const data = await ytFetch('search', {
    part: 'snippet',
    type: 'channel',
    q,
    maxResults: '5'
  });

  const items = Array.isArray(data?.items) ? data.items : [];
  if (!items.length) return null;

  const exact = items.find((item) => {
    const title = String(item?.snippet?.title || '').toLowerCase();
    return title.replace(/\s+/g, '') === q.toLowerCase().replace(/\s+/g, '');
  });

  return exact?.snippet?.channelId || items[0]?.snippet?.channelId || null;
}

async function syncYouTubeMessages() {
  if (!YOUTUBE_API_KEY) return;

  const now = Date.now();
  const nextPollAt = Number(await kvCommand(['get', YT_NEXT_POLL_KEY]).catch(() => 0));
  if (Number.isFinite(nextPollAt) && nextPollAt > now) return;

  await kvCommand(['set', YT_NEXT_POLL_KEY, String(now + 8000)]).catch(() => {});

  const channelId = await resolveChannelId();
  if (!channelId) {
    await kvCommand(['set', YT_CONNECTED_KEY, '0']).catch(() => {});
    return;
  }

  const liveSearch = await ytFetch('search', {
    part: 'snippet',
    channelId,
    eventType: 'live',
    type: 'video',
    maxResults: '1'
  });

  const liveVideoId = liveSearch?.items?.[0]?.id?.videoId;
  if (!liveVideoId) {
    await kvCommand(['set', YT_CONNECTED_KEY, '0']).catch(() => {});
    return;
  }

  const details = await ytFetch('videos', {
    part: 'liveStreamingDetails,snippet',
    id: liveVideoId,
    maxResults: '1'
  });

  const chatId = details?.items?.[0]?.liveStreamingDetails?.activeLiveChatId;
  if (!chatId) {
    await kvCommand(['set', YT_CONNECTED_KEY, '0']).catch(() => {});
    return;
  }

  const chat = await ytFetch('liveChat/messages', {
    part: 'snippet,authorDetails',
    liveChatId: chatId,
    maxResults: '50'
  });

  const lastTs = Number(await kvCommand(['get', YT_LAST_TS_KEY]).catch(() => 0)) || 0;
  let latestTs = lastTs;

  const incoming = (Array.isArray(chat?.items) ? chat.items : [])
    .map((item) => {
      const text = String(item?.snippet?.displayMessage || '').trim();
      if (!text) return null;

      const ts = new Date(item?.snippet?.publishedAt || 0).getTime();
      if (!Number.isFinite(ts) || ts <= lastTs) return null;
      latestTs = Math.max(latestTs, ts);

      return {
        id: `youtube-${item?.id || ts}`,
        platform: 'youtube',
        author: String(item?.authorDetails?.displayName || 'YouTube viewer').slice(0, 48),
        username: String(item?.authorDetails?.channelId || '').slice(0, 48) || null,
        text: text.slice(0, 500),
        timestamp: ts,
        metadata: {
          channelId: String(item?.authorDetails?.channelId || ''),
          isChatOwner: Boolean(item?.authorDetails?.isChatOwner),
          isChatModerator: Boolean(item?.authorDetails?.isChatModerator),
          isChatSponsor: Boolean(item?.authorDetails?.isChatSponsor)
        }
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.timestamp - b.timestamp);

  const commands = [];
  for (const msg of incoming) {
    commands.push(['LPUSH', STREAM_MESSAGES_KEY, JSON.stringify(msg)]);
  }
  commands.push(['LTRIM', STREAM_MESSAGES_KEY, '0', '499']);
  commands.push(['SET', YT_CONNECTED_KEY, '1']);
  if (latestTs > lastTs) commands.push(['SET', YT_LAST_TS_KEY, String(latestTs)]);

  await kvPipeline(commands).catch(() => {});
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' });

  try {
    const limit = Math.min(300, Math.max(1, Number(req.query.limit) || 120));
    const platforms = parsePlatforms(req.query.platforms);

    if (platforms.includes('youtube')) {
      await syncYouTubeMessages().catch(() => {});
    }

    const raw = await kvCommand(['lrange', STREAM_MESSAGES_KEY, '0', String(limit * 3)]).catch(() => []);
    const all = (Array.isArray(raw) ? raw : [])
      .map((row) => {
        try { return JSON.parse(row); } catch { return null; }
      })
      .filter(Boolean)
      .filter((msg) => platforms.includes(msg.platform))
      .sort((a, b) => Number(a.timestamp || 0) - Number(b.timestamp || 0))
      .slice(-limit);

    return json(res, 200, {
      channel: STREAM_CHANNEL,
      platforms,
      messages: all
    });
  } catch (error) {
    return json(res, 500, { error: 'Kon chatberichten niet ophalen.' });
  }
};
