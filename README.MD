# Плагин для добавления изображений в редактор TinyMCE
Важно! Плагин протестирован на TinyMCE 5.2.1.

На других версиях плагин не тестировалсяю

### Плагин picture позволяет реализовать тег picture с различными source в зависимости от ширины экрана

### Интеграция плагина:

1. Клонируем или скачиваем репозиторий

2. Находим каталог TinyMCE и папку plugins. Копируем папку image-picture из репозитория в папку plugins

3. Находим код инициализации TinyMCE, например:
```js
tinymce.init({...});
```
4. Подключем внешний плагин в конфигурацию инициализации TinyMCE:
```js
tinymce.init({
    plugins: 'image_picture ...', // подключаем плагин для инициализации
    ...,
    external_plugins: {
        //...  Любые другие внешние плагины в вашей конфигурации
        "image_picture": "plugins/image-picture/image-picture.js",
    },
});
```
5. Подключаем плагин в toolbar и в другие удобные меню или контекстные меню, например:
```js
tinymce.init({
    toolbar: 'image_picture ...',
    contextmenu: 'image_picture ...',
});
```

6. Будет полезно! Обновить кеш браузера для загрузки актуальной версии скриптов

### Немного скриншотов
![screenshot](images/1.png)
![screenshot](images/2.png)
![screenshot](images/3.png)
![screenshot](images/4.png)