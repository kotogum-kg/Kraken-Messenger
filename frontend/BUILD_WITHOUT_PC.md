# 📱 Сборка APK БЕЗ компьютера - БЕСПЛАТНО!

## 🎉 Способ 1: EAS Build (Облачная сборка) - РЕКОМЕНДУЕТСЯ

**Полностью бесплатно! 30 сборок в месяц.**

### Что нужно:
- ✅ Аккаунт Expo (бесплатная регистрация)
- ✅ Интернет (на телефоне, планшете или любом устройстве)
- ✅ GitHub аккаунт (опционально, для автоматизации)

### ⚡ Быстрый старт (через телефон):

#### Вариант A: Через GitHub + EAS Build (автоматическая сборка)

**Это самый простой способ - всё делается автоматически!**

1. **Создайте GitHub аккаунт** (если нет): https://github.com/join

2. **Загрузите код на GitHub:**
   - Можно через web интерфейс GitHub
   - Или через Termux (см. ниже)

3. **Подключите EAS Build к GitHub:**
   - Перейдите: https://expo.dev
   - Войдите/Зарегистрируйтесь
   - Create Project → Import from GitHub

4. **Запустите сборку:**
   - В проекте нажмите "Build" → "Android" → "Preview"
   - Подождите 15-20 минут
   - Скачайте APK по ссылке!

---

#### Вариант B: Через Termux на Android (ручная сборка)

**Если у вас Android телефон/планшет:**

##### Шаг 1: Установите Termux
```
1. Откройте F-Droid: https://f-droid.org
2. Скачайте и установите Termux
   (НЕ используйте Google Play версию - устаревшая!)
```

##### Шаг 2: Настройте Termux
```bash
# Обновите пакеты
pkg update && pkg upgrade -y

# Установите Node.js
pkg install nodejs-lts -y

# Установите Git
pkg install git -y

# Дайте доступ к хранилищу
termux-setup-storage
```

##### Шаг 3: Клонируйте проект
```bash
# Перейдите в хранилище
cd /storage/emulated/0/

# Создайте папку для проекта
mkdir kraken-build && cd kraken-build

# Если код на GitHub:
git clone https://github.com/your-username/kraken-messenger
cd kraken-messenger/frontend

# Или скопируйте файлы проекта сюда
```

##### Шаг 4: Установите EAS CLI
```bash
npm install -g eas-cli
```

##### Шаг 5: Авторизуйтесь в Expo
```bash
eas login
# Введите email и пароль Expo аккаунта
# Если нет аккаунта - зарегистрируйтесь на expo.dev
```

##### Шаг 6: Инициализируйте проект
```bash
cd /storage/emulated/0/kraken-build/kraken-messenger/frontend
eas init
```

##### Шаг 7: СОБЕРИТЕ APK! 🚀
```bash
eas build --platform android --profile preview
```

**Что произойдёт:**
1. EAS загрузит код на облачные серверы Expo
2. Соберёт APK в облаке (НЕ на вашем телефоне!)
3. Через 15-20 минут пришлёт ссылку на скачивание

##### Шаг 8: Скачайте и установите APK
```bash
# После завершения сборки откроется ссылка
# Или проверьте: https://expo.dev/accounts/[ваш-аккаунт]/builds

# Скачайте APK на телефон и установите!
```

---

## 💰 Бесплатно ли это?

### ✅ EAS Build - ПОЛНОСТЬЮ БЕСПЛАТНО:
- **30 сборок в месяц** на бесплатном плане
- **Неограниченный доступ** к скачиванию APK
- **Бесплатное хранилище** APK на 30 дней
- **Автоматическое управление** keystore

**Для 1-2 сборок в месяц - ВЕЧНО БЕСПЛАТНО!**

### 📊 Сравнение планов:

| План | Цена | Сборок/месяц | Keystore |
|------|------|--------------|----------|
| **Free** | $0 | 30 | ✅ Авто |
| **Developer** | $29/мес | Безлимит | ✅ Авто |

**Для Kraken Messenger Free плана более чем достаточно!**

---

## 🎯 Процесс сборки (что происходит):

```
1. [Ваш телефон] → Загрузка кода на Expo облако (1-2 мин)
2. [Облако Expo] → Установка зависимостей (3-5 мин)
3. [Облако Expo] → Сборка APK с подписью (10-15 мин)
4. [Облако Expo] → Готовый APK доступен для скачивания
5. [Ваш телефон] → Скачиваете и устанавливаете APK
```

**Весь процесс: ~20-25 минут**

---

## 📱 После сборки:

### Установка APK на Android:
1. Скачайте APK по ссылке из email или expo.dev
2. Откройте файл
3. Разрешите установку из неизвестных источников (Settings → Security)
4. Установите Kraken Messenger
5. Запустите и наслаждайтесь! 🦑

### Проверка сборок:
```bash
# Список всех сборок
eas build:list

# Подробности конкретной сборки
eas build:view [build-id]
```

---

## 🔧 Troubleshooting

### Проблема: "Command not found: eas"
```bash
# Переустановите EAS CLI
npm install -g eas-cli

# Или используйте npx
npx eas-cli build --platform android --profile preview
```

### Проблема: "Not logged in"
```bash
eas login
# Введите credentials от expo.dev
```

### Проблема: "Project not configured"
```bash
cd /path/to/frontend
eas init
```

### Проблема: Termux не может установить Node.js
```bash
# Используйте официальный репозиторий
pkg install nodejs-lts

# Если не работает, обновите Termux:
pkg update && pkg upgrade
```

---

## 🌐 Способ 2: GitHub Actions (полная автоматизация)

**Ещё проще - вообще без Termux!**

### Настройка за 5 минут:

1. **Создайте файл** `.github/workflows/build.yml` в проекте:

```yaml
name: EAS Build

on:
  workflow_dispatch:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Setup EAS
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      
      - name: Install dependencies
        run: cd frontend && npm install
      
      - name: Build APK
        run: cd frontend && eas build --platform android --profile preview --non-interactive
```

2. **Добавьте Expo Token в GitHub Secrets:**
   - Получите token: `eas login && eas whoami`
   - GitHub → Settings → Secrets → New secret
   - Name: `EXPO_TOKEN`
   - Value: ваш token

3. **Запустите сборку:**
   - GitHub → Actions → EAS Build → Run workflow
   - Подождите 20 минут
   - Скачайте APK из артефактов!

**Теперь при каждом push в main ветку APK будет собираться автоматически!**

---

## 💡 Лайфхаки

### 🔥 Быстрая сборка через web:

1. Перейдите: https://expo.dev
2. Войдите в аккаунт
3. Create new project → Import from GitHub
4. Configure → Android → Preview build
5. Start build → Подождите → Скачайте APK!

**Всё через браузер, даже на телефоне!**

### 📧 Email уведомления:

EAS Build автоматически присылает email когда:
- ✅ Сборка началась
- ✅ Сборка завершена (со ссылкой на APK)
- ❌ Сборка провалилась (с логами ошибок)

### 🔗 Короткая ссылка на сборку:

```bash
# После сборки получите короткую ссылку
eas build:list
# Скопируйте ссылку: exp.host/@username/project-name/builds/xxx

# Отправьте себе на WhatsApp/Telegram для скачивания на телефон
```

---

## ⏱️ Сколько времени займёт:

| Этап | Время |
|------|-------|
| Регистрация Expo аккаунта | 2 минуты |
| Установка Termux (если нужно) | 5 минут |
| Установка EAS CLI | 2 минуты |
| Инициализация проекта | 1 минута |
| **Запуск сборки** | **1 команда!** |
| Ожидание сборки | 15-20 минут |
| Скачивание APK | 2 минуты |
| Установка на телефон | 1 минута |

**ИТОГО: ~30 минут (из них 20 минут - просто ожидание)**

---

## 🎁 Бонус: Автообновление APK

После публикации в Google Play можно настроить автоматические обновления через EAS Update:

```bash
# Опубликовать обновление без пересборки APK
eas update --branch production --message "Исправлены баги"
```

**Пользователи получат обновление при следующем запуске!**

---

## 📞 Поддержка

- **EAS Build Docs**: https://docs.expo.dev/build/introduction/
- **Expo Forums**: https://forums.expo.dev
- **Telegram**: https://t.me/+GsJRkVsUS6U5OTc5

---

## ✨ Итог

**Для сборки APK без ПК:**

1. **Самый простой**: GitHub Actions (автоматическая сборка при push)
2. **Через телефон**: Termux + EAS CLI
3. **Через браузер**: expo.dev → Import → Build

**Всё БЕСПЛАТНО! 30 сборок в месяц!**

**Команда для сборки:**
```bash
eas build --platform android --profile preview
```

**Готово! 🦑 Kraken Messenger APK без компьютера!**
