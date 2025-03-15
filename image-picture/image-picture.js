tinymce.PluginManager.add('image_picture', function (editor, url) {

	const config = () => ({
		init_data: {
			image_tab: {
				name: 'image_tab',
				title: 'Image',
				items: [
					{
						type: 'label',
						label: '',
						items: [
							{
								name: 'image',
								type: 'urlinput',
								filetype:"image",
								label: 'Main image',
							},
							{
								type: 'input',
								name: 'alt',
								label: 'Alt text',
							},
						],
					},
					// {
					// 	type: 'bar',
					// 	items: [
					// 		{
					// 			type: 'input',
					// 			name: 'width',
					// 			label: 'Width',
					// 		},
					// 		{
					// 			type: 'input',
					// 			name: 'height',
					// 			label: 'Height',
					// 		},
					// 	],
					// },
					{
						name: 'dimensions',
						type: "sizeinput",
						// label: 'Width',
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
				title: 'Sources',
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

	function checkSelectedTag(Element){
		var selectedNode = Element || false;

		if(selectedNode === false || selectedNode.tagName.toLowerCase() === 'body') return false;

		if(selectedNode.closest('figure')){
			return selectedNode.closest('figure');
		}

		if(selectedNode.closest('picture')){
			return selectedNode.closest('picture');
		}

		return false;	
	}

	function targetParentFornInsert(Element){
		var Element = Element || false;
		var parentTag = null;

		if(Element === false || Element.tagName.toLowerCase() === 'body') return false;

		if(parentTag = targetParentFornInsert(Element.parentNode)){
			return parentTag;
		} else {
			return Element;
		}
	}

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
			const figcaption = true;

			if (img) {
				initialData = {
					image: { value: getRelativeUrl(img.src) },
					alt: img.alt || '',
					dimensions: {
						width: img.width.toString(),
						height: img.height.toString(),
					},
					caption: figcaption,
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
					dimensions: {
						width: img.width.toString(),
						height: img.height.toString(),
					},
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
							filetype:"image",
							label: 'Source',
						},
						{
							type: 'bar',
							items: [
								{
									type: 'input',
									name: 'min-' + index,
									label: 'Min width',
									inputMode: 'numeric',
									pattern: '\\d*',
								},
								{
									type: 'input',
									name: 'max-' + index,
									label: 'Max width',
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

	var PictureSettings = {
		title: 'Add picture',
		body: {
			type: 'tabpanel',
			tabs: [...Object.values(config().init_data)],
		},
		buttons: [
			{
				type: 'custom',
				text: 'Add source',
				name: 'addField',
				primary: true,
				align: 'start',
			},
			{
				type: 'cancel',
				text: 'Close',
			},
			{
				type: 'submit',
				text: 'Save',
				primary: true,
			},
		],
		onChange: async (dialogApi, detail) => {
			const data = dialogApi.getData();
			const url = data.image.value;

	
			if (url && detail.name === 'image') {
				try {
					const dimensions_image = await getImageDimensions(url);
					dialogApi.setData({
						dimensions: {
							width: dimensions_image.width.toString(),
							height: dimensions_image.height.toString(),
						}
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
							filetype:"image",
							label: 'Source',
						},
						{
							type: 'bar',
							items: [
								{
									type: 'input',
									name: 'min-' + count,
									label: 'Min width',
									inputMode: 'numeric',
									pattern: '\\d*',
								},
								{
									type: 'input',
									name: 'max-' + count,
									label: 'Max width',
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
		onSubmit: function (dialogApi) {
			const data = dialogApi.getData();
	
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

		const sourceHTML = `
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
					<img 
					src="${data.image.value}" 
					${data.alt ? `alt="${data.alt}"` : ''} 
					loading="lazy" 
					${data.dimensions.width ? `width="${data.dimensions.width}"` : ''} 
					${data.dimensions.height ? `height="${data.dimensions.height}"` : ''}>
		  `;

		  let insertHTML = (data.caption) ? `
			<figure class="picture" contenteditable="false" data-mce-selected="1">
					<picture>${sourceHTML}</picture>
					<figcaption contenteditable="true">${data.alt ? `${data.alt}` : 'caption'} </figcaption>
			</figure>`: `<picture>${sourceHTML}</picture>`;
			
		  	const selectedNode = tinymce.activeEditor.selection.getNode();
    		const parentNode = selectedNode.parentNode;
			var previousElement = null;
			const editElement = checkSelectedTag(tinymce.activeEditor.selection.getNode());

			if(editElement){
				previousElement = editElement.previousElementSibling;
			} else {
				previousElement = targetParentFornInsert(tinymce.activeEditor.selection.getNode());
			}

			// Проверяем, является ли родитель элементом body
			if ( previousElement) {
				// Удалить тег необходимо для исключения вставки <br> или оберток
				if(editElement)	editElement.remove();
				InsertdomElement = (data.caption) ? tinymce.activeEditor.dom.create('figure',{class: 'picture'}, `
					<picture>${sourceHTML}</picture>
					<figcaption contenteditable="true">${data.alt ? `${data.alt}` : 'caption'} </figcaption>
					`) : tinymce.activeEditor.dom.create('picture',{},sourceHTML);

				// Если родитель не body, вставляем контент после выбранного элемента
				tinymce.activeEditor.dom.insertAfter(InsertdomElement, previousElement);
			} else {
				// tinymce.activeEditor.selection.setContent(insertHTML);
				tinymce.activeEditor.insertContent(insertHTML)
			}
	
			dialogApi.close();
		},
		onClose: function (dialogApi) {
			PictureSettings.body.tabs = [...Object.values(config().init_data)];
		},
	};

	editor.ui.registry.addButton('image_picture', {
		// text: 'Picture',
		icon: 'gallery',
		tooltip: 'Insert picture',
		onAction: function () {
			openDialog();
		},
	});

	editor.ui.registry.addMenuItem('image_picture', {
		text: 'Insert Picture',
		icon: 'gallery',
		context: 'insert', // Важно: это добавляет элемент в меню "Insert"
		onAction: function () {
			openDialog();
		},
	});
});
