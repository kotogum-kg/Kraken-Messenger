/**
 * Mock chat data for Kraken Messenger
 */
import { Chat, Message } from '../types';

/**
 * Fixed developer channel - cannot be deleted or hidden
 */
export const KRAKEN_NEWS_CHANNEL: Chat = {
  id: 'kraken_news',
  title: 'Kraken News',
  lastMessage: 'Подписывайтесь на наш Telegram канал! Нажмите, чтобы открыть. 📢',
  timestamp: Date.now() - 3600000,
  isHidden: false,
  isPinned: true,
  type: 'channel',
  unreadCount: 0,
};

/**
 * Mock chats data
 */
export const MOCK_CHATS: Chat[] = [
  KRAKEN_NEWS_CHANNEL,
  {
    id: 'chat_1',
    title: 'Alice Cooper',
    lastMessage: 'Hey! Are you free for a call later?',
    timestamp: Date.now() - 600000,
    isHidden: false,
    isPinned: false,
    type: 'personal',
    unreadCount: 2,
  },
  {
    id: 'chat_2',
    title: 'Bob Smith',
    lastMessage: 'Thanks for the info!',
    timestamp: Date.now() - 1200000,
    isHidden: false,
    isPinned: false,
    type: 'personal',
    unreadCount: 0,
  },
  {
    id: 'chat_3',
    title: 'Dev Team',
    lastMessage: 'Meeting at 3 PM tomorrow',
    timestamp: Date.now() - 1800000,
    isHidden: false,
    isPinned: false,
    type: 'group',
    unreadCount: 5,
  },
  {
    id: 'chat_4',
    title: 'Carol Davis',
    lastMessage: 'See you tomorrow!',
    timestamp: Date.now() - 3600000,
    isHidden: false,
    isPinned: false,
    type: 'personal',
    unreadCount: 0,
  },
  {
    id: 'chat_5',
    title: 'Family Group',
    lastMessage: 'Mom: Dinner is ready',
    timestamp: Date.now() - 7200000,
    isHidden: false,
    isPinned: false,
    type: 'group',
    unreadCount: 3,
  },
  {
    id: 'chat_6',
    title: 'David Wilson',
    lastMessage: 'Check out this link!',
    timestamp: Date.now() - 10800000,
    isHidden: false,
    isPinned: false,
    type: 'personal',
    unreadCount: 0,
  },
  {
    id: 'chat_7',
    title: 'Project Alpha',
    lastMessage: 'Updated the roadmap',
    timestamp: Date.now() - 14400000,
    isHidden: false,
    isPinned: false,
    type: 'group',
    unreadCount: 1,
  },
  {
    id: 'chat_8',
    title: 'Emma Thompson',
    lastMessage: 'Let me know when you are available',
    timestamp: Date.now() - 18000000,
    isHidden: false,
    isPinned: false,
    type: 'personal',
    unreadCount: 0,
  },
  {
    id: 'chat_9',
    title: 'Frank Miller',
    lastMessage: 'Got it, thanks!',
    timestamp: Date.now() - 21600000,
    isHidden: false,
    isPinned: false,
    type: 'personal',
    unreadCount: 0,
  },
  {
    id: 'chat_10',
    title: 'Gaming Squad',
    lastMessage: 'Who is online tonight?',
    timestamp: Date.now() - 25200000,
    isHidden: false,
    isPinned: false,
    type: 'group',
    unreadCount: 12,
  },
  {
    id: 'chat_11',
    title: 'Grace Lee',
    lastMessage: 'Happy birthday! 🎉',
    timestamp: Date.now() - 28800000,
    isHidden: false,
    isPinned: false,
    type: 'personal',
    unreadCount: 0,
  },
  {
    id: 'chat_12',
    title: 'Henry Brown',
    lastMessage: 'The files are ready',
    timestamp: Date.now() - 32400000,
    isHidden: false,
    isPinned: false,
    type: 'personal',
    unreadCount: 0,
  },
  {
    id: 'chat_13',
    title: 'Book Club',
    lastMessage: 'Next meeting: Friday 7 PM',
    timestamp: Date.now() - 36000000,
    isHidden: false,
    isPinned: false,
    type: 'group',
    unreadCount: 0,
  },
  {
    id: 'chat_14',
    title: 'Ivy Martinez',
    lastMessage: 'Sounds good to me',
    timestamp: Date.now() - 39600000,
    isHidden: false,
    isPinned: false,
    type: 'personal',
    unreadCount: 0,
  },
];

/**
 * Mock messages for each chat
 */
export const MOCK_MESSAGES: Record<string, Message[]> = {
  kraken_news: [
    {
      id: 'msg_kn_1',
      chatId: 'kraken_news',
      text: 'Добро пожаловать в Kraken Messenger! 🦑',
      timestamp: Date.now() - 7200000,
      isMine: false,
    },
    {
      id: 'msg_kn_2',
      chatId: 'kraken_news',
      text: 'Подписывайтесь на наш Telegram канал для получения новостей и обновлений!',
      timestamp: Date.now() - 3600000,
      isMine: false,
    },
    {
      id: 'msg_kn_3',
      chatId: 'kraken_news',
      text: '📢 https://t.me/+GsJRkVsUS6U5OTc5',
      timestamp: Date.now() - 1800000,
      isMine: false,
    },
  ],
  chat_1: [
    {
      id: 'msg_1_1',
      chatId: 'chat_1',
      text: 'Hey! Are you free for a call later?',
      timestamp: Date.now() - 600000,
      isMine: false,
    },
    {
      id: 'msg_1_2',
      chatId: 'chat_1',
      text: 'Sure! What time works for you?',
      timestamp: Date.now() - 300000,
      isMine: true,
    },
  ],
  chat_2: [
    {
      id: 'msg_2_1',
      chatId: 'chat_2',
      text: 'Can you send me that document?',
      timestamp: Date.now() - 1500000,
      isMine: false,
    },
    {
      id: 'msg_2_2',
      chatId: 'chat_2',
      text: 'Here you go!',
      timestamp: Date.now() - 1300000,
      isMine: true,
    },
    {
      id: 'msg_2_3',
      chatId: 'chat_2',
      text: 'Thanks for the info!',
      timestamp: Date.now() - 1200000,
      isMine: false,
    },
  ],
};
