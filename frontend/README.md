# 🦑 Kraken Messenger - Защищённый мессенджер

## Описание
**Kraken Messenger** — это MVP прототип защищённого мессенджера на React Native (Expo) с уникальными функциями безопасности:
- 🔒 **Скрытые чаты** с защитой PIN-кодом
- 🚨 **Зеркальный пароль** - триггер безопасности (ввод PIN задом наперёд активирует сброс данных)
- 📌 **Закреплённый канал разработчика** (Kraken News) - невозможно удалить
- 🎨 **Тёмная тема** с неоновыми акцентами (синий #00F2FF, фиолетовый #8B5CF6)
- 📱 **UI Mockup** с предопределёнными сообщениями

## Технологический стек
- **Frontend**: React Native (Expo SDK 54)
- **Язык**: TypeScript
- **Навигация**: Expo Router v6 (file-based routing)
- **Хранилище**: 
  - AsyncStorage (чаты, настройки)
  - Expo SecureStore (PIN-код)
- **Безопасность**: expo-local-authentication (готово к биометрии)

## Установка и запуск

### 1. Установка зависимостей
```bash
cd frontend
npm install
# или
yarn install
```

### 2. Запуск в режиме разработки
```bash
# Expo Go (рекомендуется для быстрого тестирования)
npx expo start

# Android эмулятор
npx expo start --android

# iOS симулятор (только на macOS)
npx expo start --ios

# Веб-версия
npx expo start --web
```

### 3. Сканирование QR-кода
После запуска `expo start`:
1. Откройте приложение **Expo Go** на телефоне
2. Отсканируйте QR-код из терминала
3. Приложение загрузится на вашем устройстве

## 📦 Сборка Production APK

### Вариант 1: EAS Build (Рекомендуется)

#### Шаг 1: Установка EAS CLI
```bash
npm install -g eas-cli
```

#### Шаг 2: Авторизация в Expo
```bash
eas login
```

#### Шаг 3: Настройка проекта
```bash
cd frontend
eas build:configure
```

#### Шаг 4: Создание ключей подписи Android
```bash
# EAS автоматически создаст ключи при первой сборке
eas credentials
```

#### Шаг 5: Сборка APK
```bash
# Production APK (для Google Play Store)
eas build --platform android --profile production

# Или APK для установки напрямую (без Google Play)
eas build --platform android --profile preview
```

#### Шаг 6: Скачивание APK
После завершения сборки:
1. Перейдите по ссылке из терминала
2. Скачайте APK файл
3. Установите на Android устройство

### Вариант 2: Локальная сборка (без EAS)

#### Требования:
- Android Studio с Android SDK
- JDK 11+
- Node.js 18+

#### Шаги:
```bash
# 1. Установите Android SDK
# 2. Настройте переменные окружения
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/platform-tools

# 3. Создайте отдельный проект
npx expo prebuild

# 4. Соберите APK
cd android
./gradlew assembleRelease

# APK будет в: android/app/build/outputs/apk/release/app-release.apk
```

## 🔑 Основные функции

### 1. Закреплённый канал "Kraken News"
- Всегда отображается первым в списке
- **Нельзя** удалить или скрыть
- При попытке удаления показывается предупреждение

### 2. Скрытые чаты
- Любой чат можно скрыть через долгое нажатие (long press)
- Доступ к скрытым чатам через Настройки → Скрытые чаты
- Защищено PIN-кодом (4 цифры)
- Структура готова для добавления биометрии (Face ID / Touch ID)

### 3. Зеркальный пароль (Security Trigger)
**ВАЖНО:** Это функция безопасности!
- Если PIN = `1234`
- Ввод `4321` (зеркально) активирует триггер
- Показывается fake ошибка: **"Ошибка 0xDEADBEEF — неверный код"**
- Считается как неудачная попытка
- После 3 неудачных попыток (включая зеркальные):
  - Удаляются все чаты
  - Удаляется PIN-код
  - Сбрасываются все настройки
  - Показывается: "Сброс безопасности выполнен"

### 4. Безопасность
- PIN-код хранится в Expo SecureStore (зашифровано)
- Счётчик неудачных попыток
- Автоматическая очистка данных при превышении лимита
- Готово к добавлению биометрической аутентификации

## 📱 Структура приложения

```
frontend/
├── app/                          # Expo Router (file-based routing)
│   ├── _layout.tsx              # Root layout
│   ├── index.tsx                # Главный экран (список чатов)
│   ├── settings.tsx             # Настройки
│   ├── pin-setup.tsx            # Установка PIN
│   ├── pin-auth.tsx             # Аутентификация PIN
│   ├── hidden-chats.tsx         # Скрытые чаты
│   └── chat/
│       └── [id].tsx             # Отдельный чат (динамический роут)
│
├── src/
│   ├── components/              # Переиспользуемые компоненты
│   │   ├── ChatItem.tsx
│   │   └── PINInput.tsx
│   ├── screens/                 # Экраны приложения
│   │   ├── ChatListScreen.tsx
│   │   ├── ChatScreen.tsx
│   │   ├── HiddenChatsScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   ├── PINSetupScreen.tsx
│   │   └── PINAuthScreen.tsx
│   ├── hooks/                   # Custom хуки
│   │   └── useChats.ts
│   ├── utils/                   # Утилиты
│   │   ├── storage.ts           # AsyncStorage wrapper
│   │   └── security.ts          # PIN hashing, mirror detection
│   ├── data/                    # Mock data
│   │   └── mockChats.ts
│   ├── constants/               # Константы
│   │   └── theme.ts             # Цвета, размеры
│   └── types/                   # TypeScript типы
│       └── index.ts
│
├── assets/                      # Ресурсы
│   └── images/
│       ├── icon.png             # 1024x1024
│       ├── adaptive-icon.png    # 512x512
│       ├── favicon.png          # 192x192
│       └── splash-icon.png      # 200x200
│
├── app.json                     # Expo конфигурация
├── package.json
└── tsconfig.json
```

## 🎨 Дизайн-система

### Цвета
```typescript
background: '#0A0F1A'        // Тёмный фон
neonBlue: '#00F2FF'          // Неоновый синий (акцент)
purple: '#8B5CF6'            // Фиолетовый (дополнительный)
textPrimary: '#FFFFFF'       // Основной текст
textSecondary: '#94A3B8'     // Второстепенный текст
```

### Отступы (8pt grid)
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- xxl: 48px

## 🧪 Тестирование

### Как протестировать основные функции:

1. **Список чатов**: Запустите приложение → увидите 14 чатов + закреплённый канал
2. **Скрытие чата**: Долгое нажатие на любой чат (кроме Kraken News) → Скрыть
3. **Установка PIN**: Настройки → Установить PIN-код → Введите 1234 → Подтвердите
4. **Доступ к скрытым**: Настройки → Скрытые чаты → Введите PIN
5. **Зеркальный пароль**: Попробуйте ввести 4321 → Увидите fake ошибку
6. **Сброс после 3 попыток**: Введите неправильный PIN 3 раза → Данные удалены

## 📝 Конфигурация для Google Play Store

### app.json (уже настроено)
```json
{
  "expo": {
    "name": "Kraken Messenger",
    "android": {
      "package": "com.kraken.messenger",
      "versionCode": 1,
      "permissions": [
        "USE_BIOMETRIC",
        "USE_FINGERPRINT"
      ]
    }
  }
}
```

### Требуемые разрешения:
- `USE_BIOMETRIC` - для биометрической аутентификации (готово к реализации)
- `USE_FINGERPRINT` - для Touch ID (готово к реализации)

## 🚀 Roadmap для расширения

### Скоро:
- [ ] Биометрическая аутентификация (Face ID / Touch ID)
- [ ] Реальный обмен сообщениями (Socket.IO)
- [ ] Backend интеграция (FastAPI + MongoDB)
- [ ] Push-уведомления
- [ ] Отправка фото/файлов
- [ ] Групповые чаты (полноценные)

### Будущее:
- [ ] End-to-end шифрование
- [ ] Самоуничтожающиеся сообщения
- [ ] Voice/Video звонки
- [ ] Desktop приложение (Electron)

## 🐛 Известные ограничения (MVP)

1. **Только UI Mockup** - реального обмена сообщениями нет
2. **Локальное хранилище** - данные не синхронизируются между устройствами
3. **Нет backend** - все данные хранятся на устройстве
4. **Биометрия** - структура готова, но функция отключена (требует физического устройства для теста)

## 📄 Лицензия
MIT License

## 👨‍💻 Автор
Kraken Messenger MVP - Защищённые чаты для вашей безопасности 🦑
