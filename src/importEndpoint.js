'use strict';

/*
		***** BEGIN LICENSE BLOCK *****
		
		Copyright © 2018 Corporation for Digital Scholarship
										 Vienna, Virginia, USA
										 https://www.zotero.org
		
		This file is part of Zotero.
		
		Zotero is free software: you can redistribute it and/or modify
		it under the terms of the GNU Affero General Public License as published by
		the Free Software Foundation, either version 3 of the License, or
		(at your option) any later version.
		
		Zotero is distributed in the hope that it will be useful,
		but WITHOUT ANY WARRANTY; without even the implied warranty of
		MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.	See the
		GNU Affero General Public License for more details.
		
		You should have received a copy of the GNU Affero General Public License
		along with Zotero.	If not, see <http://www.gnu.org/licenses/>.
		
		***** END LICENSE BLOCK *****
*/

const Translate = require('./translation/translate');

module.exports = {
	handle: async function (ctx, _next) {
		const translate = new Translate.Import();
		translate.setString(ctx.req.body || '');

		const translators = await translate.getTranslators();
		if (translators.length === 0) {
			ctx.throw(500, 'No suitable translators found', { expose: true });
			return;
		}
		translate.setTranslator(translators[0]);
		var items = await translate.translate({ libraryID: 1 });
		
		ctx.set('Content-Type', 'application/json');
		ctx.set('Zotero-Translator-ID', translators[0].translatorID);
		
		// Convert translator JSON to API JSON
		var newItems = [];
		items.forEach((item) => {
			newItems.push(...Zotero.Utilities.Item.itemToAPIJSON(item));
		});
		
		ctx.response.body = JSON.stringify(newItems, null, 2);
	}
};
