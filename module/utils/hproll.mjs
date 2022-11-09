//Original PF1E Random Health Roller by @mkahvi (https://gitlab.com/mkahvi/fvtt-micro-modules/-/blob/master/pf1-health-randomizer)
const signNum = (n) => n < 0 ? `${n}` : `+${n}`;

async function randomizeHealth(doc, opts, _userId) {
	if (!game.user.isGM) return; // might be unnecessary
	if (doc.data.actorLink) return; // handle only unlinked
	if (opts.temporary) return; // don't care about temporaries

	const classes = doc.actor.itemTypes.class;
	const formula = `(@hdCount)d(@hdSize)`;
	const hpconf = game.settings.get('pf1', 'healthConfig').hitdice;

	if (hpconf.NPC.auto || hpconf.Racial.auto) {
		console.warn('Health randomization not supported with NPC/Racial HD set to auto.');
		return;
	}

	const abilities = doc.actor.getRollData().abilities;

	let maximized = 0, tdiff = 0;

	const items = [];

	for (const c of classes) {
		const type = c.data.data.classType,
			hdSize = c.data.data.hd,
			hp = c.data.data.hp,
			hdCount = c.data.data.level;

		if (['mythic'].includes(type)) continue;

		let hdLeft = hdCount;
		const conf = type === 'racial' ? hpconf.Racial : hpconf.NPC;
		let maximizedHp = 0, maximizedD = 0;
		for (; maximized < conf.maximized; maximized++) {
			hdLeft--;
			maximizedHp += hdSize;
			maximizedD++;
		}
		if (hdLeft === 0) continue;
		/* global RollPF */
		const roll = RollPF.safeRoll(formula, { hdSize, hdCount: hdLeft, abilities });
		const newhp = Math.max(1, roll.total ?? 0) + maximizedHp;

		// Statistics
		let underMax = 0, overMin = 0;
		for (const d of roll.dice) {
			for (const r of d.results) {
				underMax += d.faces - r.result;
				overMin += r.result - 1;
			}
		}
		const min = roll.total - overMin,
			max = roll.total + underMax,
			avg = Math.floor((min + max) / 2 * 100) / 100,
			diff = newhp - hp;

		tdiff += diff;
		const dice = roll.dice.reduce((arr, v) => [...arr, ...v.results.map(r => r.result)], []);
		console.log(`Updating HP [${roll.formula}]:`, hp, '->', newhp, 'diff:', signNum(diff),
			`\n[max: ${hdCount - hdLeft}, range: ${min}–${avg}–${max}]`,
			'Rolls:', dice, '=', roll.total, '; Maximized:', maximizedD, '=', maximizedHp);

		// Push update data
		if (hp !== newhp) items.push(mergeObject(c.data.toObject(), { 'data.hp': newhp }));
	}

	if (items.length) {
		// Unlinked tokens require all items to be included
		const missingItems = doc.actor.items.filter(i => i.type !== 'class').map(i => i.data.toObject());
		const missingItems2 = doc.actor.itemTypes.class.filter(i => i.data.data.classType === 'mythic').map(i => i.data.toObject());
		if (missingItems.length) items.push(...missingItems);
		if (missingItems2.length) items.push(...missingItems2);

		const maxHp = getProperty(doc.actor.data, 'data.attributes.hp.max');
		console.log(doc.name, doc.id, '– HP Delta:', signNum(tdiff), 'HP Max:', maxHp + tdiff);
		// hp.value change is just to force an update on health which does not happen otherwise.
		await doc.actor.update({ items, 'data.attributes.hp.value': maxHp });
	}
}
