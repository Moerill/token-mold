import Mold from './mold.js';
import ConfigMold from './molds/config.js';
import SystemMold from './molds/system.js';
import NameMold from './molds/name.js';

export default class MoldConfig extends FormApplication {
  static init() {
    MoldConfig.registerSettings();
    Hooks.on('ready', () => {
    })

    Hooks.on('renderActorDirectory', MoldConfig.renderQuickSettings);
  }

  static async renderQuickSettings(app, html, options) {
    const section = document.createElement('section');
    section.classList.add('token-mold');
    section.id = 'token-mold-quick-config';

    section.insertAdjacentHTML('afterbegin',`
			<h3>Token Mold</h3>
			<label class='label-inp' title='(De-)activate Name randomizing'>
					<input class='name rollable' type='checkbox' name='name' ${game.settings.get('token-mold', 'name')?.active ? 'checked' : ''}><span><span class='checkmark'></span>&nbsp;Name</span>
			</label>
			<label class='label-inp' title='(De-)activate Token Config Overwrite'>
					<input class='config rollable' type='checkbox' name='config' ${game.settings.get('token-mold', 'config')?.active ? 'checked' : ''}><span><span class='checkmark'></span>&nbsp;Config</span>
			</label>
			<label class='label-inp' title='(De-)activate Stat Overlay On Hover'>
					<input class='config rollable' type='checkbox' name='overlay' ${game.settings.get('token-mold', 'overlay')?.active ? 'checked' : ''}><span><span class='checkmark'></span>&nbsp;Overlay</span>
			</label>

			<a class='refresh-selected' title="Reapplies all settings to selected tokens as if those were replaced onto the scene."><i class="fas fa-sync-alt"></i></a>
			<a class='token-rand-form-btn' title='Settings'><i class="fa fa-cog"></i></a>
			<h2></h2>
    `);

    const inputs = section.querySelectorAll('input[type="checkbox"]');
    for (let checkbox of inputs) {
      checkbox.addEventListener('change', (ev) => {
				const data = game.settings.get('token-mold', ev.currentTarget.name);
				data.active = ev.currentTarget.checked;
				game.settings.set('token-mold', ev.currentTarget.name, data);
      })
    }

    section.querySelector('.refresh-selected').addEventListener('click', (ev) => Mold.refreshSelected());
    section.querySelector('.token-rand-form-btn').addEventListener('click', (ev) => {
			new MoldConfig().render(true);
    });
		const dirHeader = html[0].querySelector('.directory-header');
		dirHeader.parentNode.insertBefore(section, dirHeader);
  }

  static registerSettings() {
    game.settings.registerMenu('token-mold', 'menu', {
      name: game.i18n.localize('TOKEN-MOLD.fvtt-settings.name'),
      label: game.i18n.localize('TOKEN-MOLD.fvtt-settings.label'),
      icon: 'fas fa-mug-hot',
      type: MoldConfig,
      restricted: true
    });

    game.settings.register('token-mold', 'config', {
      default: ConfigMold.defaultSettings,
      type: Object,
      scope: 'world',
      onChange: data => MoldConfig.updateQuickSettings(data, 'config')
    });

    game.settings.register('token-mold', 'system', {
      default: SystemMold.defaultSettings,
      type: Object,
      scope: 'world'
    });

    game.settings.register('token-mold', 'name', {
      default: NameMold.defaultSettings,
      type: Object,
      scope: 'world',
      onChange: data => MoldConfig.updateQuickSettings(data, 'name')
    });

    game.settings.register('token-mold', 'overlay', {
      default: NameMold.defaultSettings,
      type: Object,
      scope: 'world',
      onChange: data => MoldConfig.updateQuickSettings(data, 'overlay')
    });
  }

  static updateQuickSettings(data, type) {
    
  }

}