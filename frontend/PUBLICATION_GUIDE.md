# 📱 Полное руководство по публикации Kraken Messenger в Google Play и App Store

## 🎯 Содержание
1. [Предварительная подготовка](#1-предварительная-подготовка)
2. [Генерация подписывающих ключей](#2-генерация-подписывающих-ключей)
3. [Сборка production билдов](#3-сборка-production-билдов)
4. [Публикация в Google Play](#4-публикация-в-google-play)
5. [Публикация в App Store](#5-публикация-в-app-store)
6. [Чек-лист перед публикацией](#6-чек-лист-перед-публикацией)

---

## 1. Предварительная подготовка

### 1.1. Установка необходимых инструментов

```bash
# Установка EAS CLI
npm install -g eas-cli

# Авторизация в Expo
eas login

# Инициализация проекта
cd /app/frontend
eas init
```

### 1.2. Проверка конфигурации

Убедитесь, что файлы настроены:
- ✅ `app.json` - версия 1.0.0, bundle identifiers
- ✅ `eas.json` - профили для production
- ✅ Все иконки созданы (icon.png, adaptive-icon.png, splash-icon.png)
- ✅ Политика конфиденциальности (`assets/privacy-policy.html`)

---

## 2. Генерация подписывающих ключей

### 2.1. Android Keystore

EAS может автоматически создать и управлять keystore, НО для полного контроля создайте свой:

```bash
# Генерация keystore
keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore kraken-release-key.keystore \
  -alias kraken-messenger \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass YOUR_KEYSTORE_PASSWORD \
  -keypass YOUR_KEY_PASSWORD \
  -dname "CN=Kraken Messenger, OU=Mobile, O=KrakenApp, L=City, ST=State, C=RU"
```

**⚠️ КРИТИЧЕСКИ ВАЖНО:**
- Сохраните `kraken-release-key.keystore` в БЕЗОПАСНОМ месте (вне репозитория!)
- Запишите пароли (keystore password и key password)
- Потеря keystore = НЕВОЗМОЖНОСТЬ ОБНОВИТЬ приложение в Play Store!

**Рекомендуемое хранение:**
- Зашифрованное облако (Google Drive, Dropbox с шифрованием)
- Менеджер паролей (1Password, LastPass) для паролей
- Резервные копии на разных носителях

#### Загрузка keystore в EAS (опционально):

```bash
eas credentials -p android
# Выберите: Set up a new keystore
# Загрузите файл kraken-release-key.keystore
```

### 2.2. iOS Signing

Для iOS требуется Apple Developer аккаунт ($99/год).

```bash
# EAS автоматически создаст сертификаты
eas build --platform ios --profile production

# Или вручную через Apple Developer Portal:
# 1. Перейдите: https://developer.apple.com/account
# 2. Certificates, Identifiers & Profiles
# 3. Создайте App ID: com.kraken.messenger
# 4. Создайте Distribution Certificate
# 5. Создайте Provisioning Profile
```

---

## 3. Сборка production билдов

### 3.1. Android AAB (для Play Store)

```bash
# Production AAB (рекомендуется для Play Store)
eas build --platform android --profile production

# Или APK для тестирования
eas build --platform android --profile production-apk
```

**Процесс сборки:**
1. EAS загрузит код на облачные серверы
2. Соберёт AAB/APK с подписью
3. Займёт ~15-25 минут
4. Получите ссылку на скачивание

**Проверка сборки:**
```bash
# Список всех сборок
eas build:list

# Подробности конкретной сборки
eas build:view [build-id]
```

### 3.2. iOS IPA (для App Store)

```bash
# Production IPA
eas build --platform ios --profile production
```

**Требования:**
- Активная подписка Apple Developer ($99/год)
- App ID зарегистрирован в Apple Developer Portal
- Сертификаты и профили настроены

---

## 4. Публикация в Google Play

### 4.1. Создание Google Play аккаунта

1. Перейдите: https://play.google.com/console
2. Оплатите единоразовый взнос **$25**
3. Заполните данные разработчика

### 4.2. Создание приложения

1. **Create app** → Заполните форму:
   - **App name**: Kraken Messenger
   - **Default language**: Русский
   - **App or game**: App
   - **Free or paid**: Free

2. **Store presence** → Main store listing:

#### Описание на русском:
```
Kraken Messenger — защищённый мессенджер с уникальными функциями безопасности.

🔒 ОСНОВНЫЕ ВОЗМОЖНОСТИ:
• PIN-защита скрытых чатов
• Зеркальный пароль — защита от принуждения
• Автосброс данных после 3 неудачных попыток
• До 10 аккаунтов одновременно
• Настройка прокси-серверов
• Закреплённый канал новостей

📸 ФОТО С ГЕОМЕТКАМИ:
• Отправка фото из галереи или камеры
• Водяные знаки с координатами (опционально)
• Полный контроль над геолокацией

🛡️ БЕЗОПАСНОСТЬ:
• Все данные хранятся локально
• Нет серверов — нет утечек
• Зашифрованное хранилище PIN-кодов

🌐 ДОПОЛНИТЕЛЬНО:
• Тёмная/светлая тема
• Работает полностью офлайн
• Не требует регистрации

Kraken Messenger — ваш надёжный защитник конфиденциальности! 🦑
```

#### Short description (80 символов):
```
Защищённый мессенджер с PIN-кодом, геометками и зеркальным паролем
```

#### Описание на английском:
```
Kraken Messenger — secure messenger with unique security features.

🔒 KEY FEATURES:
• PIN-protected hidden chats
• Mirror password — protection from coercion
• Auto-wipe after 3 failed attempts
• Up to 10 accounts simultaneously
• Proxy server configuration
• Pinned news channel

📸 PHOTOS WITH GEOTAGS:
• Send photos from gallery or camera
• Watermarks with coordinates (optional)
• Full geolocation control

🛡️ SECURITY:
• All data stored locally
• No servers — no leaks
• Encrypted PIN storage

🌐 ADDITIONAL:
• Dark/light theme
• Works completely offline
• No registration required

Kraken Messenger — your reliable privacy protector! 🦑
```

3. **Скриншоты** (минимум 2 скриншота):
   - Размер: 16:9 или 9:16
   - Форматы: PNG, JPEG
   - Разрешение: минимум 320px

**Рекомендация:** Сделайте скриншоты:
- Список чатов
- Экран чата
- Настройки PIN
- Отправка фото с геометкой

4. **Иконка приложения**:
   - Размер: 512x512 PNG
   - Уже создана: `/app/frontend/assets/images/adaptive-icon.png`

5. **Feature Graphic** (обязательно):
   - Размер: 1024x500 PNG/JPEG
   - Создайте в Figma/Canva с текстом "Kraken Messenger" и иконкой

### 4.3. Настройка контента

1. **App content** → Privacy Policy:
   - Загрузите `privacy-policy.html` на хостинг (GitHub Pages, Netlify)
   - Или используйте: https://your-domain.com/privacy-policy.html
   - URL политики конфиденциальности: укажите ссылку

2. **Content rating**:
   - Пройдите анкету IARC
   - Вопросы о контенте: violence, sex, drugs, etc.
   - Для мессенджера без пользовательского контента: **Everyone (3+)**

3. **Target audience**:
   - **Age**: 13+
   - **Target country**: Russia, Worldwide

4. **Data safety**:
   - **Does your app collect or share user data?** → NO
   - **Is all user data encrypted in transit?** → N/A (no server)
   - **Can users request data deletion?** → YES (uninstall app)

### 4.4. Загрузка AAB

1. **Production** → **Create new release**
2. **Upload** → Выберите скачанный AAB файл
3. **Release name**: 1.0.0 (1)
4. **Release notes** (на русском):
```
Первый релиз Kraken Messenger v1.0.0

Возможности:
✅ PIN-защита скрытых чатов
✅ Зеркальный пароль для безопасности
✅ До 10 аккаунтов
✅ Прокси-серверы
✅ Отправка фото с геометками
✅ Тёмная/светлая тема
✅ Полностью офлайн

Приятного использования! 🦑
```

5. **Review and roll out** → **Start rollout to production**

### 4.5. Модерация

- **Время проверки**: 1-7 дней
- **Статус**: отслеживайте в Play Console
- **Возможные причины отклонения**:
  - Отсутствие политики конфиденциальности
  - Неполное описание разрешений
  - Нарушение контент-политики

---

## 5. Публикация в App Store

### 5.1. Apple Developer аккаунт

1. Зарегистрируйтесь: https://developer.apple.com
2. Оплатите подписку: **$99/год**
3. Дождитесь активации (1-2 дня)

### 5.2. App Store Connect

1. Перейдите: https://appstoreconnect.apple.com
2. **My Apps** → **+** → **New App**

**Заполните форму:**
- **Platform**: iOS
- **Name**: Kraken Messenger
- **Primary Language**: Russian
- **Bundle ID**: com.kraken.messenger
- **SKU**: com.kraken.messenger.1
- **User Access**: Full Access

### 5.3. Информация о приложении

1. **App Information**:
   - **Name**: Kraken Messenger
   - **Subtitle** (30 символов): Защищённый мессенджер
   - **Category**: Social Networking
   - **Secondary Category**: Utilities

2. **Pricing and Availability**:
   - **Price**: Free
   - **Availability**: All countries

3. **App Privacy**:
   - **Do you collect data from this app?** → NO
   - **Data Types**: None

### 5.4. Версия для рассмотрения

1. **Version Information**:
   - **Version**: 1.0.0
   - **Copyright**: © 2025 Kraken Messenger
   
2. **Description** (используйте английскую версию из описания Play Store)

3. **Keywords** (100 символов):
```
messenger,secure,privacy,PIN,chat,encrypted,safe,kraken
```

4. **Support URL**: https://t.me/+GsJRkVsUS6U5OTc5
5. **Marketing URL**: (опционально)

### 5.5. Скриншоты для iOS

Требуются скриншоты для разных размеров экранов:
- **iPhone 6.7"**: 1290x2796 (iPhone 14 Pro Max)
- **iPhone 6.5"**: 1242x2688 (iPhone XS Max)
- **iPhone 5.5"**: 1242x2208 (iPhone 8 Plus)

**Инструмент для скриншотов:**
```bash
# Используйте симулятор iOS
npx expo start --ios

# Или онлайн-инструменты:
# - screenshots.app
# - appscreenshots.io
```

### 5.6. Загрузка IPA

```bash
# Автоматическая загрузка через EAS
eas submit --platform ios --profile production

# Или вручную через Application Loader:
# 1. Скачайте IPA файл
# 2. Откройте Transporter (macOS)
# 3. Перетащите IPA файл
# 4. Нажмите "Deliver"
```

### 5.7. Submit for Review

1. Заполните **App Review Information**:
   - **Contact Information**: email, phone
   - **Notes**: Опишите функции приложения

2. **Submit for Review**

**Время проверки:** 1-3 дня

---

## 6. Чек-лист перед публикацией

### ✅ Код и конфигурация
- [ ] Версия в `app.json`: 1.0.0
- [ ] versionCode (Android): 1
- [ ] buildNumber (iOS): 1
- [ ] Bundle ID: com.kraken.messenger
- [ ] Все permissions описаны в `app.json`
- [ ] Иконки созданы (512x512, 1024x1024)
- [ ] Splash screen настроен
- [ ] `eas.json` настроен для production

### ✅ Функциональность
- [ ] Приложение запускается без ошибок
- [ ] Все основные функции работают:
  - [ ] Список чатов отображается
  - [ ] PIN-защита работает
  - [ ] Скрытые чаты скрываются/показываются
  - [ ] Зеркальный пароль срабатывает
  - [ ] Настройки сохраняются
- [ ] Тестирование на Android (эмулятор + реальное устройство)
- [ ] Тестирование на iOS (симулятор, если доступно)
- [ ] Приложение работает офлайн
- [ ] Нет крашей при типичных сценариях

### ✅ Безопасность и разрешения
- [ ] Разрешения запрашиваются только при необходимости
- [ ] Камера запрашивается только при нажатии "Камера"
- [ ] Геолокация запрашивается только при включённых геометках
- [ ] PIN-код хранится зашифрованным
- [ ] Сброс данных работает корректно

### ✅ Контент для магазинов
- [ ] Описание на русском (Play Store)
- [ ] Описание на английском (App Store)
- [ ] Короткое описание (80 символов)
- [ ] Скриншоты (минимум 2)
- [ ] Feature Graphic (1024x500, только Play Store)
- [ ] Иконка приложения (512x512)
- [ ] Политика конфиденциальности размещена онлайн
- [ ] Keywords подобраны

### ✅ Юридические аспекты
- [ ] Политика конфиденциальности соответствует GDPR
- [ ] Политика конфиденциальности соответствует CCPA
- [ ] Возрастной рейтинг: 13+
- [ ] Контент не нарушает политики магазинов
- [ ] Copyright информация заполнена

### ✅ Сборка и публикация
- [ ] AAB файл собран успешно
- [ ] IPA файл собран успешно (для iOS)
- [ ] Keystore сохранён в безопасном месте
- [ ] Пароли keystore записаны
- [ ] Google Play аккаунт создан ($25 оплачено)
- [ ] Apple Developer аккаунт создан ($99/год оплачено)
- [ ] Release notes написаны
- [ ] Support email указан

### ✅ После публикации
- [ ] Приложение прошло модерацию
- [ ] Приложение доступно в магазине
- [ ] Ссылки на приложение работают:
  - Play Store: https://play.google.com/store/apps/details?id=com.kraken.messenger
  - App Store: https://apps.apple.com/app/id[app-id]
- [ ] Мониторинг отзывов настроен
- [ ] Telegram канал обновлён с ссылками на приложение

---

## 📊 Ожидаемые сроки

| Этап | Время |
|------|-------|
| Подготовка конфигурации | 1-2 часа |
| Генерация ключей | 30 минут |
| Сборка AAB/APK через EAS | 15-25 минут |
| Сборка IPA через EAS | 20-30 минут |
| Создание аккаунта Play Store | 10 минут |
| Создание аккаунта Apple Developer | 1-2 дня (ожидание активации) |
| Заполнение информации о приложении | 1-2 часа |
| Создание скриншотов | 1 час |
| Модерация Google Play | 1-7 дней |
| Модерация App Store | 1-3 дня |

**Итого от начала до публикации: ~2-10 дней**

---

## 🆘 Troubleshooting

### Проблема: Сборка AAB не удалась

**Решение:**
```bash
# Проверьте логи
eas build:view [build-id]

# Типичные причины:
# 1. Неверный keystore
# 2. Конфликты зависимостей
# 3. Превышен лимит памяти

# Попробуйте пересобрать
eas build --platform android --profile production --clear-cache
```

### Проблема: App Store отклонил приложение

**Частые причины:**
- **Guideline 2.1**: Крашится при запуске → Исправьте баги
- **Guideline 5.1.1**: Нет политики конфиденциальности → Добавьте ссылку
- **Guideline 2.3.1**: Неполное описание функций → Обновите описание

### Проблема: Play Store показывает "Requires review"

**Действия:**
- Подождите 1-7 дней
- Проверьте email на уведомления
- Если отклонили — исправьте замечания и отправьте заново

---

## 📞 Поддержка

- **EAS Build Docs**: https://docs.expo.dev/build/introduction/
- **Play Console Help**: https://support.google.com/googleplay/android-developer
- **App Store Review**: https://developer.apple.com/app-store/review/
- **Telegram поддержка**: https://t.me/+GsJRkVsUS6U5OTc5

---

**Удачи с публикацией Kraken Messenger! 🦑**
