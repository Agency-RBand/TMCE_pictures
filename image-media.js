const config = () => ({
	init_data: {
		image_tab: {
			name: 'image_tab',
			title: 'Изображение',
			items: [
				{
					type: 'label',
					label: '',
					items: [
						{
							name: 'image',
							type: 'urlinput',
							label: 'Основное изображение',
						},
						{
							type: 'input',
							name: 'alt',
							label: 'Альтернативный текст',
						},
					],
				},
				{
					type: 'bar',
					items: [
						{
							type: 'input',
							name: 'width',
							label: 'Ширина',
						},
						{
							type: 'input',
							name: 'height',
							label: 'Высота',
						},
					],
				},
				{
					type: 'label',
					label: 'Caption',
					items: [
						{
							type: 'checkbox',
							name: 'caption',
							label: 'Show caption',
						},
					],
				},
			],
		},
		image_media_tab: {
			name: 'image_media_tab',
			title: 'Медиа',
			items: [],
		},
	},
});

function getImageDimensions(url) {
	return new Promise((resolve, reject) => {
		const img = new Image();

		img.onload = () => {
			resolve({
				width: img.width,
				height: img.height,
			});
		};

		img.onerror = () => {
			reject(new Error('Не удалось загрузить изображение'));
		};

		img.src = url;
	});
}

var PictureSettings = {
	title: 'Добавить изображения',
	body: {
		type: 'tabpanel',
		tabs: [...Object.values(config().init_data)],
	},
	buttons: [
		{
			type: 'custom',
			text: 'Добавить медиа',
			name: 'addField',
			primary: true,
			align: 'start',
		},
		{
			type: 'cancel',
			text: 'Закрыть',
		},
		{
			type: 'submit',
			text: 'Сохранить',
			primary: true,
		},
	],
	onChange: async (api, detail) => {
		const url = api.getData().image.value;

		if (url) {
			try {
				const dimensions = await getImageDimensions(url);
				api.setData({
					width: dimensions.width.toString(),
					height: dimensions.height.toString(),
				});
			} catch (error) {
				console.error('Ошибка при загрузке изображения:', error);
			}
		}
	},
	onAction: (dialogApi, details) => {
		if (details.name === 'addField') {
			const currentData = dialogApi.getData();
			const tabMedia = PictureSettings.body.tabs.find(
				tab => tab.name === 'image_media_tab'
			);
			const count = tabMedia.items.length;
			const newField = {
				type: 'label',
				label: ' ',
				items: [
					{
						type: 'htmlpanel',
						html: `<div style="background-color: #ccc; width: 100%; height: ${
							count === 0 ? '0px' : '1px'
						}; margin-top: ${count === 0 ? '0px' : '16px'};"></div>`,
					},
					{
						type: 'htmlpanel',
						html: `<h6 style="margin-top: ${
							count === 0 ? '0px' : '10px'
						};">Медиа элемент ${count + 1}</h6>`,
					},
					{
						name: 'source-' + count,
						type: 'urlinput',
						label: 'Source',
					},
					{
						type: 'bar',
						items: [
							{
								type: 'input',
								name: 'min-' + count,
								label: 'Мин. ширина',
								inputMode: 'numeric',
								pattern: '\\d*',
							},
							{
								type: 'input',
								name: 'max-' + count,
								label: 'Макс. ширина',
								inputMode: 'numeric',
								pattern: '\\d*',
							},
						],
					},
				],
			};
			tabMedia.items.push(newField);

			dialogApi.redial(PictureSettings);

			dialogApi.setData(currentData);
			dialogApi.showTab('image_media_tab');
		}
	},

	onSubmit: function (api) {
		const data = api.getData();

		const sources = [];
		for (
			let i = 0;
			i <
			PictureSettings.body.tabs.find(item => item.name === 'image_media_tab')
				.items.length;
			i++
		) {
			const minWidth = data[`min-${i}`];
			const maxWidth = data[`max-${i}`];
			const source = data[`source-${i}`]?.value;

			if ((minWidth || maxWidth) && source) {
				sources.push({
					minWidth: parseInt(minWidth),
					maxWidth: parseInt(maxWidth),
					source: source,
				});
			}
		}
		sources.sort((a, b) => b.maxWidth - a.maxWidth);
		sources.sort((a, b) => b.minWidth - a.minWidth);
		const pictureHTML = `
          <picture>
              ${sources
								.map(item => {
									let s;
									if (!item.maxWidth && !item.minWidth) return false;
									if (item.maxWidth && item.minWidth) {
										s = `<source media="(max-width: ${item.maxWidth}px) and (min-width: ${item.minWidth}px)" srcset="${item.source}">`;
									} else if (item.maxWidth && item.maxWidth !== NaN) {
										s = `<source media="(max-width: ${item.maxWidth}px)" srcset="${item.source}">`;
									} else {
										s = `<source media="(min-width: ${item.minWidth}px)" srcset="${item.source}">`;
									}

									return s;
								})
								.join('')}
              <img src="${data.image.value}" alt="${
			data.alt ? data.alt : 'img'
		}" loading="lazy" width="${data.width ? data.width : ''}" height="${
			data.height ? data.height : ''
		}">
          </picture>
      `;
		console.log('asjhfdghjdfhgjdfhjgdhfj');

		if (data.caption) {
			const figure = `
        <figure class="image" contenteditable="false" data-mce-selected="1">
                ${pictureHTML}
                <figcaption contenteditable="true">caption</figcaption>
        </figure>`;
			// tinymce.activeEditor.execCommand('mceInsertContent', false, figure);
			tinymce.activeEditor.insertContent(figure);
		} else {
			// tinymce.activeEditor.execCommand('mceInsertContent', false, pictureHTML);
			tinymce.activeEditor.insertContent(pictureHTML);
		}

		api.close();
	},
	onClose: function (api) {
		PictureSettings.body.tabs = [...Object.values(config().init_data)];
	},
};

document.addEventListener('DOMContentLoaded', () => {
	tinymce.PluginManager.add('image_media', function (editor, url) {
		function getRelativeUrl(fullUrl) {
			try {
				const urlObj = new URL(fullUrl);
				return urlObj.pathname + urlObj.search + urlObj.hash;
			} catch (e) {
				return fullUrl;
			}
		}

		function openDialog() {
			const selectedNode = editor.selection.getNode();
			let initialData = {};

			if (selectedNode.closest('figure')) {
				const figure = selectedNode.closest('figure');
				const picture = figure.querySelector('picture');
				const img = figure.querySelector('img');
				const figcaption = figure.querySelector('figcaption');

				if (img) {
					initialData = {
						image: { value: getRelativeUrl(img.src) },
						alt: img.alt || '',
						width: img.width.toString(),
						height: img.height.toString(),
						caption: !!figcaption,
					};

					if (picture) {
						const sources = picture.querySelectorAll('source');
						sources.forEach((source, index) => {
							const media = source.getAttribute('media');
							const srcset = source.getAttribute('srcset');

							if (media && srcset) {
								const mediaMatches = media.match(
									/\(max-width:\s*(\d+)px\)\s*and\s*\(min-width:\s*(\d+)px\)/i
								);
								if (mediaMatches) {
									initialData[`min-${index}`] = mediaMatches[2];
									initialData[`max-${index}`] = mediaMatches[1];
								} else {
									const maxWidthMatch = media.match(
										/\(max-width:\s*(\d+)px\)/i
									);
									const minWidthMatch = media.match(
										/\(min-width:\s*(\d+)px\)/i
									);

									if (maxWidthMatch) {
										initialData[`max-${index}`] = maxWidthMatch[1];
									}
									if (minWidthMatch) {
										initialData[`min-${index}`] = minWidthMatch[1];
									}
								}

								initialData[`source-${index}`] = {
									value: getRelativeUrl(srcset),
								};
							}
						});
					}
				}
			} else if (selectedNode.closest('picture')) {
				const picture = selectedNode.closest('picture');
				const img = picture.querySelector('img');
				const sources = picture.querySelectorAll('source');

				if (img) {
					initialData = {
						image: { value: getRelativeUrl(img.src) },
						alt: img.alt || '',
						width: img.width.toString(),
						height: img.height.toString(),
						caption: false,
					};

					sources.forEach((source, index) => {
						const media = source.getAttribute('media');
						const srcset = source.getAttribute('srcset');

						if (media && srcset) {
							const mediaMatches = media.match(
								/\(max-width:\s*(\d+)px\)\s*and\s*\(min-width:\s*(\d+)px\)/i
							);
							if (mediaMatches) {
								initialData[`min-${index}`] = mediaMatches[2];
								initialData[`max-${index}`] = mediaMatches[1];
							} else {
								const maxWidthMatch = media.match(/\(max-width:\s*(\d+)px\)/i);
								const minWidthMatch = media.match(/\(min-width:\s*(\d+)px\)/i);

								if (maxWidthMatch) {
									initialData[`max-${index}`] = maxWidthMatch[1];
								}
								if (minWidthMatch) {
									initialData[`min-${index}`] = minWidthMatch[1];
								}
							}

							initialData[`source-${index}`] = {
								value: getRelativeUrl(srcset),
							};
						}
					});
				}
			}

			const dialog = editor.windowManager.open({
				...PictureSettings,
				initialData: initialData,
			});

			const tabMedia = PictureSettings.body.tabs.find(
				tab => tab.name === 'image_media_tab'
			);
			Object.keys(initialData).forEach(key => {
				if (key.startsWith('source-')) {
					const index = key.replace('source-', '');
					const newField = {
						type: 'label',
						label: ' ',
						items: [
							{
								type: 'htmlpanel',
								html: `<div style="background-color: #ccc; width: 100%; height: ${
									index === '0' ? '0px' : '1px'
								}; margin-top: ${index === '0' ? '0px' : '16px'};"></div>`,
							},
							{
								type: 'htmlpanel',
								html: `<h6 style="margin-top: ${
									index === '0' ? '0px' : '10px'
								};">Медиа элемент ${parseInt(index) + 1}</h6>`,
							},
							{
								name: 'source-' + index,
								type: 'urlinput',
								label: 'Source',
							},
							{
								type: 'bar',
								items: [
									{
										type: 'input',
										name: 'min-' + index,
										label: 'Мин. ширина',
										inputMode: 'numeric',
										pattern: '\\d*',
									},
									{
										type: 'input',
										name: 'max-' + index,
										label: 'Макс. ширина',
										inputMode: 'numeric',
										pattern: '\\d*',
									},
								],
							},
						],
					};
					tabMedia.items.push(newField);
				}
			});

			dialog.redial(PictureSettings);
			dialog.setData(initialData);
		}

		editor.ui.registry.addButton('image_media', {
			text: 'Picture',
			icon: 'gallery',
			onAction: function () {
				openDialog();
			},
		});
	});
});
