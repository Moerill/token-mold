export const initStickyTemplates = function() {
	// Call all hooks on ready to be able to check if user isTrusted or not
	Hooks.on('ready', () => {
		// // Don't allow for non trusted users
		// if (!game.user.isTrusted) return;
		// Removed.. since it doesn#t matter. The user will only be able to use templates as long as they're allowed to..

		// Add sticky template options to MeasureTemplateConfig
		Hooks.on('renderMeasuredTemplateConfig', (app, html, data) => {
			const submitBtn = html.find('button[type="submit"]');
			const selectedTokenId = getProperty(data, 'object.flags.token-mold.sticky-templates.tokenId') || -1;
			
			// Only allow controlled tokens
			const el = `
			<div class="form-group">
				<label>Stick to Token </label>
				<select name="flags.token-mold.sticky-templates.tokenId" data-dtype="String">
					<option value="-1" ${selectedTokenId < 0 ? `selected` : ``}>None</option>
						${canvas.tokens.ownedTokens.map(e =>`<option value="${e.id}" ${e.id === selectedTokenId ? `selected` : ``}>${e.name}</option>`).join(``)}
				</select>
			</div>
			${data.object.t === "rect" ? '' : `
			<div class="form-group">
				<label>Rotate with sticked token?</label>
				<input type="checkbox" name="flags.token-mold.sticky-templates.rotate" data-dtype="Boolean" ${getProperty(data.object, "flags.token-mold.sticky-templates.rotate") === true ? 'checked': ''}/>
			</div>`}
			`
			submitBtn.before(el);
		})
		
		// When updating a measuredTemplate and sticking it to a new token, remove template from old token and add to new.
		Hooks.on('preUpdateMeasuredTemplate', (scene, parentId, uData, data) => {
			const oldTId = getProperty(data, "currentData.flags.token-mold.sticky-templates.tokenId"),
						newTId = getProperty(uData, "flags.token-mold.sticky-templates.tokenId"),
						templateId = uData.id;
			
			// If attached TokenId hasn't changed or isn't defined do nothing
			if (oldTId === newTId || newTId === -2) return;
		
			// Is old Token Id set?
			if (oldTId) {
				// get Token
				const token = canvas.tokens.ownedTokens.find(e => e.id === oldTId);
				if (token !== undefined) {
					// Get ids
					let templates = duplicate(getProperty(token, "data.flags.token-mold.sticky-templates.templateIds") || []);
					// Find current template
					const idx = templates.indexOf(templateId);
					if (idx > -1) {
						// Remove current Template
						templates.splice(idx, 1);
						token.update(parentId, {"flags.token-mold.sticky-templates.templateIds": templates});
					}
				}
			}
		
		
			// Is  new Token Id set to a token?
			if (newTId) {
				// Find Token
				const token = canvas.tokens.ownedTokens.find(e => e.id === newTId);
				if (token !== undefined) {
					let templates = duplicate(getProperty(token, "data.flags.token-mold.sticky-templates.templateIds") || []);
					// Add curent Template to list
					templates.push(templateId);
					token.update({"flags.token-mold.sticky-templates.templateIds": templates});
				}
			}
		})
		
		// Move sticked templates on Token update accordingly
		Hooks.on('preUpdateToken', (scene, parentId, uData) => {
			const token = canvas.tokens.get(uData._id);
			let templateIds = duplicate(getProperty(token, "data.flags.token-mold.sticky-templates.templateIds") || []);
			// No templates? Leave
			if (templateIds.length === 0) return;
		
			// Get position and rotation delta
			const x = token.data.x,
						y = token.data.y,
						newX = uData.x || x,
						newY = uData.y || y,
						dx = newX - x,
						dy = newY - y,
						alpha = token.data.rotation,
						newAlpha = getProperty(uData, "rotation");
			// Didnt move? leave
			if (dx === dy === 0 && newAlpha === undefined) return;
		
			const dAlpha = newAlpha === undefined ? 0 : newAlpha - alpha;

			// Move each template by the same distance the token moved
			templateIds.forEach(async id => {
				const template = canvas.scene.getEmbeddedEntity("MeasuredTemplate", id);
				let data = {};
				// Rotate template around token if flag is set
				if (template.t !== "rect" && dAlpha !== 0 && getProperty(template, "flags.token-mold.sticky-templates.rotate") === true) {
					
					const tokenCenter = token.center;
					let x = template.x,
							y = template.y;
					if (template.t === "rect") {
						x += template.width / 2;
						y += template.height / 2;
					}
					// get vector from center to template
					const dAlphaR = toRadians(dAlpha),
							dx = x - tokenCenter.x,
							dy = y - tokenCenter.y;
					// rotate vector around angle
					data = {
						x: tokenCenter.x + Math.cos(dAlphaR)*dx - Math.sin(dAlphaR)*dy,
						y: tokenCenter.y + Math.sin(dAlphaR)*dx + Math.cos(dAlphaR)*dy,
						direction: template.direction + (template.t === "rect" ? 0 : dAlpha)
					}
				} else {
					data = {
						x: template.x + dx,
						y: template.y + dy
					}
				}
				data._id = id;
				await canvas.scene.updateEmbeddedEntity("MeasuredTemplate", data)
			});
		});
		
		// Remove template from tokens template list when delted
		Hooks.on('preDeleteMeasuredTemplate',  (template, parentId, templateId) => {
			let tokenId = getProperty(template, "data.flags.token-mold.sticky-templates.tokenId");
			// Return if there is no token or wrong scene
			if (tokenId === undefined || parentId !== canvas.scene.id) return;	// Make sure the parent Scene is the active scene. Should be though..?

			let token = canvas.tokens.get(tokenId);
			if (token === undefined) return;

			let templates = duplicate(getProperty(token, "data.flags.token-mold.sticky-templates.templateIds") || []);
			const idx = templates.indexOf(template.id);
			if (idx > -1) {
				// Remove template from tokens template list
				templates.splice(idx, 1);
				token.update(parentId, {"flags.token-mold.sticky-templates.templateIds": templates});
			}	
		})

		// Remove token templates on token deletion
		Hooks.on('preDeleteToken', (token, parentId, options) => {
			let templateIds = getProperty(token, "data.flags.token-mold.sticky-templates.templateIds") || [];
			if (templateIds.length === 0) return;

			let templates = templateIds.map(e => canvas.templates.placeables.find(t => t.id === e));
			// Error: the following results in not reliable deleting all templates
			// templates.forEach(async template => await template.delete(parentId))	

			templates.forEach(async template => await template.update(parentId, {"flags.token-mold.sticky-templates": {}}))
		})
		
		// Remove templateList from token when copy pasting
		// TODO: Change this with 0.3.8 to copy templates as well?
		Hooks.on('preCreateToken', (entity, parentId, data) => {
			let templates = getProperty(data, "flags.token-mold.sticky-templates.templateIds");
		
			if (templates === undefined) return;
			
			setProperty(data, "flags.token-mold.sticky-templates.templateIds", []);
		})
	})
}