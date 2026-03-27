# 📦 Инструкция по сборке APK для Google Play Market

## 🎯 Kraken Messenger - Production Build

Это пошаговое руководство по созданию production APK для публикации в Google Play Store.

---

## Вариант 1: EAS Build (Рекомендуется) ☁️

EAS Build — облачный сервис от Expo для сборки приложений. Не требует установки Android Studio.

### Шаг 1: Установка EAS CLI

```bash
npm install -g eas-cli
```

### Шаг 2: Авторизация в Expo

```bash
eas login
```

Введите ваши учётные данные Expo аккаунта (или зарегистрируйтесь на expo.dev).

### Шаг 3: Конфигурация проекта

```bash
cd /app/frontend
eas build:configure
```

Это создаст/обновит файл `eas.json` (уже создан).

### Шаг 4: Создание Build Profile

Файл `eas.json` уже настроен со следующими профилями:
- **development** - для разработки
- **preview** - APK для тестирования
- **production** - готовый APK для Play Market

### Шаг 5: Сборка Production APK

```bash
eas build --platform android --profile production
```

**Что произойдёт:**
1. EAS создаст Android keystore (если его нет)
2. Загрузит код на облачные серверы
3. Соберёт APK в облаке
4. Предоставит ссылку на скачивание

**Время сборки:** 10-20 минут

### Шаг 6: Скачивание APK

После завершения сборки:
1. Перейдите по ссылке из терминала
2. Или откройте https://expo.dev/accounts/[ваш-аккаунт]/projects/kraken-messenger/builds
3. Скачайте APK файл

### Шаг 7: Тестирование APK

Установите APK на Android устройство:
```bash
adb install kraken-messenger.apk
```

Или отправьте файл на телефон и установите вручную.

---

## Вариант 2: Локальная сборка 🖥️

Требует установки Android Studio и Android SDK.

### Требования:
- Android Studio
- JDK 17+
- Android SDK (API 34)
- Node.js 18+

### Шаг 1: Установка зависимостей

```bash
cd /app/frontend
npm install
```

### Шаг 2: Prebuild (генерация нативных папок)

```bash
npx expo prebuild --platform android
```

Это создаст папку `android/` с нативным Android проектом.

### Шаг 3: Генерация Keystore

Создайте keystore для подписи APK:

```bash
keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore kraken-release-key.keystore \
  -alias kraken-key-alias \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

**Сохраните:**
- Пароль keystore
- Пароль ключа
- Алиас ключа

⚠️ **ВАЖНО:** Храните keystore в безопасном месте! Потеря keystore = невозможность обновить приложение в Play Store.

### Шаг 4: Настройка Gradle

Отредактируйте `android/gradle.properties`:

```properties
MYAPP_RELEASE_STORE_FILE=kraken-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=kraken-key-alias
MYAPP_RELEASE_STORE_PASSWORD=ваш_пароль_keystore
MYAPP_RELEASE_KEY_PASSWORD=ваш_пароль_ключа
```

### Шаг 5: Сборка Release APK

```bash
cd android
./gradlew assembleRelease
```

APK будет создан в:
```
android/app/build/outputs/apk/release/app-release.apk
```

### Шаг 6: Сборка AAB (для Play Store)

Google Play требует формат AAB (Android App Bundle):

```bash
cd android
./gradlew bundleRelease
```

AAB будет создан в:
```
android/app/build/outputs/bundle/release/app-release.aab
```

---

## 📱 Публикация в Google Play Store

### Шаг 1: Создание приложения в Play Console

1. Перейдите на https://play.google.com/console
2. Создайте новое приложение
3. Заполните обязательные поля:
   - Название: **Kraken Messenger**
   - Категория: **Communication**
   - Описание: Защищённый мессенджер с PIN-кодом

### Шаг 2: Подготовка ресурсов

Необходимые материалы (уже созданы в `/app/frontend/assets/images/`):
- **Иконка**: 512x512 PNG
- **Feature Graphic**: 1024x500 (создайте в Photoshop/Figma)
- **Скриншоты**: минимум 2 скриншота (сделайте с работающего приложения)

### Шаг 3: Загрузка APK/AAB

В Play Console:
1. Перейдите в **Production** → **Create new release**
2. Загрузите **app-release.aab**
3. Заполните Release Notes:
   ```
   Первый релиз Kraken Messenger v1.0.0
   
   Возможности:
   - Защищённые чаты с PIN-кодом
   - Скрытие чатов
   - Зеркальный пароль для безопасности
   - Тёмная тема с неоновым дизайном
   ```

### Шаг 4: Заполнение информации о приложении

#### Описание приложения:
```
Kraken Messenger — защищённый мессенджер с уникальными функциями безопасности.

🔒 Основные возможности:
• PIN-защита для скрытых чатов
• Зеркальный пароль — защита от принуждения
• Автоматический сброс данных после 3 неудачных попыток
• Закреплённый канал разработчика
• Тёмная тема с неоновым дизайном

🛡️ Безопасность превыше всего:
Ваши личные переписки защищены PIN-кодом. Скройте важные чаты от посторонних глаз.

⚡ Уникальная функция: Зеркальный пароль
Если кто-то принуждает вас разблокировать скрытые чаты, введите PIN задом наперёд — и все данные будут автоматически удалены.

Kraken Messenger — ваш надёжный защитник конфиденциальности! 🦑
```

#### Краткое описание:
```
Защищённый мессенджер с PIN-кодом и уникальной системой безопасности
```

### Шаг 5: Контент и возрастные ограничения

- **Возрастной рейтинг**: 3+ (Everyone)
- **Категория контента**: Communication
- **Реклама**: Нет
- **Покупки**: Нет

### Шаг 6: Политика конфиденциальности

Создайте простую страницу политики конфиденциальности или используйте генератор:
https://www.freeprivacypolicy.com/

Пример содержания:
```
Kraken Messenger Privacy Policy

Мы не собираем персональные данные.
Все данные хранятся локально на вашем устройстве.
Мы не передаём информацию третьим лицам.
```

### Шаг 7: Отправка на проверку

1. Заполните все обязательные поля
2. Нажмите **Review & Rollout**
3. Подтвердите отправку на проверку

**Время проверки:** 1-7 дней

---

## 🚀 EAS Submit (Автоматическая публикация)

После успешной сборки через EAS Build:

```bash
eas submit --platform android --profile production
```

Это автоматически загрузит AAB в Google Play Console.

---

## ✅ Checklist перед публикацией

- [ ] Протестировано на физическом Android устройстве
- [ ] Все функции работают (PIN, скрытые чаты, зеркальный пароль)
- [ ] Иконка и название корректны
- [ ] Версия в app.json: 1.0.0
- [ ] versionCode: 1
- [ ] Keystore сохранён в безопасном месте
- [ ] Скриншоты приложения готовы
- [ ] Описание и политика конфиденциальности заполнены
- [ ] Контакты поддержки указаны

---

## 🔄 Обновление приложения

Для выпуска обновлений:

1. Обновите `version` в `app.json` (например, 1.0.0 → 1.1.0)
2. Увеличьте `versionCode` (1 → 2)
3. Соберите новый APK/AAB
4. Загрузите в Play Console
5. Опубликуйте обновление

---

## 🆘 Troubleshooting

### Ошибка: "Invalid keystore"
```bash
keytool -list -v -keystore kraken-release-key.keystore
```

### Ошибка: "Build failed"
Проверьте логи:
```bash
eas build:list
eas build:view [build-id]
```

### APK слишком большой
Используйте AAB вместо APK — Google Play автоматически оптимизирует размер.

---

## 📞 Контакты

- **Проект**: Kraken Messenger
- **Package**: com.kraken.messenger
- **Version**: 1.0.0
- **Build tool**: EAS Build / Gradle

---

**Удачи с публикацией! 🦑**
