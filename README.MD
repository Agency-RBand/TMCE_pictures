# Плагин для добавления изображений в редактор TinyMCE

## В отличии от стандартного плагина image у данного есть возможность добавления конструкции picture source

![screenshot](/1.png)

### Старт работы:

1. Клонируем либо скачиваем репозиторий

```bash
git clone <ссылка на репозиторий> <папка назначения или .>
```

2. Подключаем в header админки

через HTML тег script

```html
<script src="<Путь до файла>" type="text/javascript"></script>
```

через header.php

```php
$this->document->addScript('<Путь до файла>');
```

3. Подключение плагина в TinyMCE

```js
tinymce.init({
	selector: tinymce_selector,
	plugins: 'image_media ...other plugins',
	toolbar: 'image_media ...other plugins',
	// ...other,
});
```
