/**
 * Mock Channel Posts with Media Support and Link Previews
 * For Kraken News and other channels
 */

export interface MediaItem {
  type: 'image' | 'video' | 'audio' | 'document' | 'voice';
  uri: string;
  width?: number;
  height?: number;
  duration?: number;
  filename?: string;
  size?: number;
}

export interface ChannelPost {
  id: string;
  channelId: string;
  title?: string;
  text: string;
  timestamp: number;
  views: number;
  likes: number;
  media: MediaItem[];
  hasReplies: boolean;
  replyCount: number;
  isPinned?: boolean;
  links?: string[]; // URLs in the post for previews
}

// Sample images (using picsum for demo)
const SAMPLE_IMAGES = [
  'https://picsum.photos/800/600?random=1',
  'https://picsum.photos/800/600?random=2',
  'https://picsum.photos/600/800?random=3',
  'https://picsum.photos/800/600?random=4',
  'https://picsum.photos/600/600?random=5',
];

// Kraken News Channel Posts
export const KRAKEN_NEWS_POSTS: ChannelPost[] = [
  {
    id: 'post_1',
    channelId: 'kraken_news',
    title: '🚀 Kraken Messenger v2.0 Вышел!',
    text: 'Мы рады представить новую версию Kraken Messenger с полной интеграцией Telegram API!\n\n**Новые функции:**\n• Реальные чаты из Telegram\n• Голосовые сообщения\n• Одноразовый просмотр медиа\n• Стикеры и реакции',
    timestamp: Date.now() - 1000 * 60 * 30, // 30 min ago
    views: 15420,
    likes: 892,
    media: [
      { type: 'image', uri: SAMPLE_IMAGES[0], width: 800, height: 600 }
    ],
    hasReplies: true,
    replyCount: 156,
    isPinned: true,
  },
  {
    id: 'post_link_1',
    channelId: 'kraken_news',
    title: '📰 Обзор Telegram в 2025 году',
    text: 'Интересная статья о развитии Telegram и его конкурентах:\n\nhttps://www.theverge.com/2024/3/5/24090213/telegram-one-billion-users-2024',
    timestamp: Date.now() - 1000 * 60 * 45, // 45 min ago
    views: 8234,
    likes: 456,
    media: [],
    hasReplies: true,
    replyCount: 89,
    links: ['https://www.theverge.com/2024/3/5/24090213/telegram-one-billion-users-2024'],
  },
  {
    id: 'post_2',
    channelId: 'kraken_news',
    text: '🔒 **Безопасность на первом месте**\n\nВсе ваши данные зашифрованы и хранятся только на вашем устройстве. Мы не собираем личную информацию.',
    timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
    views: 8934,
    likes: 445,
    media: [],
    hasReplies: true,
    replyCount: 67,
  },
  {
    id: 'post_link_2',
    channelId: 'kraken_news',
    title: '🛠️ Полезные инструменты для разработчиков',
    text: 'Рекомендуем отличную статью о React Native:\n\nhttps://reactnative.dev/blog/2024/04/22/release-0.74\n\nТакже читайте документацию Expo: https://docs.expo.dev/',
    timestamp: Date.now() - 1000 * 60 * 60 * 3, // 3 hours ago
    views: 5678,
    likes: 234,
    media: [],
    hasReplies: true,
    replyCount: 45,
    links: ['https://reactnative.dev/blog/2024/04/22/release-0.74'],
  },
  {
    id: 'post_3',
    channelId: 'kraken_news',
    title: '🎨 Новые темы оформления',
    text: 'Добавили 6 новых цветовых тем! Выбирайте свой стиль в настройках.',
    timestamp: Date.now() - 1000 * 60 * 60 * 5, // 5 hours ago
    views: 12567,
    likes: 723,
    media: [
      { type: 'image', uri: SAMPLE_IMAGES[1], width: 800, height: 600 },
      { type: 'image', uri: SAMPLE_IMAGES[2], width: 600, height: 800 },
      { type: 'image', uri: SAMPLE_IMAGES[3], width: 800, height: 600 },
    ],
    hasReplies: true,
    replyCount: 234,
  },
  {
    id: 'post_link_3',
    channelId: 'kraken_news',
    title: '📱 GitHub репозиторий',
    text: 'Наш проект теперь открыт!\n\nСмотрите исходный код: https://github.com/nicepkg/gpt-runner\n\nСтавьте звёзды ⭐',
    timestamp: Date.now() - 1000 * 60 * 60 * 8, // 8 hours ago
    views: 9876,
    likes: 567,
    media: [],
    hasReplies: true,
    replyCount: 123,
    links: ['https://github.com/nicepkg/gpt-runner'],
  },
  {
    id: 'post_4',
    channelId: 'kraken_news',
    text: '❓ **FAQ: Частые вопросы**\n\n**Q:** Как скрыть чат?\n**A:** Долгое нажатие на чат → "Скрыть"\n\n**Q:** Как включить PIN?\n**A:** Настройки → Безопасность → PIN-код',
    timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
    views: 5678,
    likes: 234,
    media: [],
    hasReplies: true,
    replyCount: 89,
  },
  {
    id: 'post_link_4',
    channelId: 'kraken_news',
    title: '🌐 Новости технологий',
    text: 'Интересная статья от Habr:\n\nhttps://habr.com/ru/companies/yandex/articles/\n\nРекомендуем к прочтению!',
    timestamp: Date.now() - 1000 * 60 * 60 * 36, // 1.5 days ago
    views: 7654,
    likes: 345,
    media: [],
    hasReplies: true,
    replyCount: 78,
    links: ['https://habr.com/ru/companies/yandex/articles/'],
  },
  {
    id: 'post_5',
    channelId: 'kraken_news',
    title: '🎥 Видео-туториал',
    text: 'Посмотрите как настроить скрытые чаты и mirror-пароль.',
    timestamp: Date.now() - 1000 * 60 * 60 * 48, // 2 days ago
    views: 23456,
    likes: 1567,
    media: [
      { type: 'video', uri: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: 10, width: 320, height: 176 }
    ],
    hasReplies: true,
    replyCount: 456,
  },
  {
    id: 'post_6',
    channelId: 'kraken_news',
    title: '📄 Политика конфиденциальности',
    text: 'Ознакомьтесь с нашей политикой конфиденциальности и условиями использования.',
    timestamp: Date.now() - 1000 * 60 * 60 * 72, // 3 days ago
    views: 3456,
    likes: 123,
    media: [
      { type: 'document', uri: 'privacy_policy.pdf', filename: 'Privacy_Policy.pdf', size: 245000 }
    ],
    hasReplies: false,
    replyCount: 0,
  },
  {
    id: 'post_7',
    channelId: 'kraken_news',
    title: '🎵 Голосовое сообщение от команды',
    text: 'Привет всем! Спасибо что используете Kraken.',
    timestamp: Date.now() - 1000 * 60 * 60 * 96, // 4 days ago
    views: 8765,
    likes: 567,
    media: [
      { type: 'audio', uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', duration: 180, filename: 'team_message.mp3' }
    ],
    hasReplies: true,
    replyCount: 78,
  },
  {
    id: 'post_8',
    channelId: 'kraken_news',
    title: '📸 Скриншоты нового интерфейса',
    text: 'Вот как выглядит новый дизайн!',
    timestamp: Date.now() - 1000 * 60 * 60 * 120, // 5 days ago
    views: 19876,
    likes: 1234,
    media: [
      { type: 'image', uri: SAMPLE_IMAGES[4], width: 600, height: 600 },
      { type: 'image', uri: SAMPLE_IMAGES[0], width: 800, height: 600 },
    ],
    hasReplies: true,
    replyCount: 345,
  },
  {
    id: 'post_9',
    channelId: 'kraken_news',
    text: '👋 Добро пожаловать в Kraken Messenger!\n\nЭто официальный канал проекта. Здесь мы публикуем новости, обновления и полезные советы.\n\nПодписывайтесь!',
    timestamp: Date.now() - 1000 * 60 * 60 * 168, // 7 days ago
    views: 45678,
    likes: 3456,
    media: [],
    hasReplies: true,
    replyCount: 567,
  },
  {
    id: 'post_10',
    channelId: 'kraken_news',
    title: '🛠️ Роадмап разработки',
    text: '**Q3 2025:**\n• Секретные чаты\n• Видеозвонки\n\n**Q4 2025:**\n• Мульти-аккаунты\n• Desktop версия',
    timestamp: Date.now() - 1000 * 60 * 60 * 240, // 10 days ago
    views: 34567,
    likes: 2345,
    media: [
      { type: 'image', uri: SAMPLE_IMAGES[1], width: 800, height: 600 }
    ],
    hasReplies: true,
    replyCount: 890,
  },
];

// Helper to get posts by channel
export function getChannelPosts(channelId: string): ChannelPost[] {
  if (channelId === 'kraken_news') {
    return KRAKEN_NEWS_POSTS;
  }
  return [];
}

// Format view count
export function formatViews(count: number): string {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M';
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K';
  }
  return count.toString();
}

// Format timestamp
export function formatPostTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 60) return `${minutes} мин назад`;
  if (hours < 24) return `${hours} ч назад`;
  if (days < 7) return `${days} дн. назад`;
  
  const date = new Date(timestamp);
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

// Extract first URL from text
export function extractFirstUrl(text: string): string | null {
  const urlPattern = /https?:\/\/[^\s<>"]+/g;
  const matches = text.match(urlPattern);
  return matches ? matches[0] : null;
}
