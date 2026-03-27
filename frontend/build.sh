#!/bin/bash

echo "🦑 Kraken Messenger - Build Script"
echo "=================================="
echo ""

# Проверка установки EAS CLI
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI не установлен"
    echo "Установите с помощью: npm install -g eas-cli"
    exit 1
fi

echo "✅ EAS CLI установлен"
echo ""

# Выбор типа сборки
echo "Выберите тип сборки:"
echo "1) Preview APK (для тестирования)"
echo "2) Production APK (для Play Market)"
echo "3) Production AAB (для Play Market, рекомендуется)"
read -p "Введите номер (1-3): " choice

case $choice in
    1)
        echo ""
        echo "🔨 Сборка Preview APK..."
        eas build --platform android --profile preview
        ;;
    2)
        echo ""
        echo "🔨 Сборка Production APK..."
        eas build --platform android --profile production
        ;;
    3)
        echo ""
        echo "🔨 Сборка Production AAB..."
        # Временно меняем buildType на app-bundle
        sed -i 's/"buildType": "apk"/"buildType": "app-bundle"/' eas.json
        eas build --platform android --profile production
        # Возвращаем обратно
        sed -i 's/"buildType": "app-bundle"/"buildType": "apk"/' eas.json
        ;;
    *)
        echo "❌ Неверный выбор"
        exit 1
        ;;
esac

echo ""
echo "✅ Сборка запущена!"
echo ""
echo "📊 Проверить статус сборки:"
echo "   eas build:list"
echo ""
echo "🔗 Или перейдите на:"
echo "   https://expo.dev/accounts/[ваш-аккаунт]/builds"
