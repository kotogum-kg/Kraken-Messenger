# 🚀 Быстрый старт: Публикация Kraken Messenger

## Краткие команды для сборки и публикации

### 1. Установка и авторизация (один раз)
```bash
npm install -g eas-cli
eas login
cd /app/frontend
eas init
```

### 2. Генерация Android Keystore (один раз)
```bash
keytool -genkeypair -v -storetype PKCS12 \
  -keystore kraken-release-key.keystore \
  -alias kraken-messenger \
  -keyalg RSA -keysize 2048 -validity 10000

# ⚠️ СОХРАНИТЕ keystore и пароли в безопасном месте!
```

### 3. Сборка production билдов

#### Android AAB (для Play Store):
```bash
eas build --platform android --profile production
```

#### Android APK (для тестирования):
```bash
eas build --platform android --profile production-apk
```

#### iOS IPA (для App Store):
```bash
eas build --platform ios --profile production
```

### 4. Автоматическая загрузка в магазины

#### Google Play:
```bash
eas submit --platform android --profile production
```

#### App Store:
```bash
eas submit --platform ios --profile production
```

---

## 📋 Минимальный чек-лист

### Перед сборкой:
- [ ] Обновил версию в `app.json` (1.0.0)
- [ ] Создал все иконки
- [ ] Политика конфиденциальности размещена онлайн
- [ ] Keystore создан и сохранён

### После сборки:
- [ ] AAB/IPA файл скачан
- [ ] Протестировал на устройстве
- [ ] Создал скриншоты (минимум 2)
- [ ] Заполнил описание на русском и английском

### Публикация:
- [ ] Google Play аккаунт создан ($25)
- [ ] Apple Developer аккаунт создан ($99/год, опционально)
- [ ] Приложение загружено
- [ ] Release notes написаны
- [ ] Отправлено на модерацию

---

## 💰 Необходимые затраты

| Сервис | Стоимость | Когда |
|--------|-----------|-------|
| Google Play Console | **$25** | Единоразово |
| Apple Developer Program | **$99/год** | Ежегодно (опционально для iOS) |
| EAS Build | **Бесплатно** | 30 сборок/месяц бесплатно |
| Хостинг политики | **Бесплатно** | GitHub Pages, Netlify |

**Минимум для Android: $25 (Google Play)**
**Для iOS дополнительно: $99/год**

---

## 🎯 Приоритеты

### ✅ Обязательно (для Android):
1. Создать Google Play аккаунт ($25)
2. Собрать AAB файл
3. Загрузить политику конфиденциальности онлайн
4. Сделать 2-3 скриншота
5. Заполнить описание
6. Отправить на модерацию

### 🔜 Опционально (для iOS):
1. Создать Apple Developer аккаунт ($99/год)
2. Собрать IPA файл
3. Загрузить в App Store Connect
4. Пройти модерацию Apple

---

## ⏱️ Ожидаемое время

| Этап | Длительность |
|------|--------------|
| Подготовка документов | 1-2 часа |
| Сборка через EAS | 15-25 минут |
| Заполнение Play Console | 1 час |
| Модерация Google Play | 1-7 дней |
| **ИТОГО** | **~2-8 дней** |

---

## 📞 Если что-то не так

**Проблемы со сборкой:**
```bash
eas build:list
eas build:view [build-id]
```

**Проблемы с публикацией:**
- Проверьте email от Google/Apple
- Читайте причины отклонения
- Исправьте и отправьте заново

**Документация:**
- EAS: https://docs.expo.dev/build/introduction/
- Play Console: https://support.google.com/googleplay/android-developer
- App Store: https://developer.apple.com/app-store/review/

**Поддержка:**
- Telegram: https://t.me/+GsJRkVsUS6U5OTc5

---

## 🎉 После успешной публикации

1. **Проверьте ссылки:**
   - Play Store: `https://play.google.com/store/apps/details?id=com.kraken.messenger`
   - App Store: `https://apps.apple.com/app/id[app-id]`

2. **Обновите Telegram канал** с ссылками на приложение

3. **Мониторьте отзывы** в консолях разработчиков

4. **Планируйте обновления:**
   - При каждом обновлении увеличивайте:
     - `version`: 1.0.0 → 1.1.0
     - `versionCode`: 1 → 2 (Android)
     - `buildNumber`: 1 → 2 (iOS)

---

**Готово! Kraken Messenger готов к публикации! 🦑**
