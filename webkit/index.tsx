import './browser';
import { getLang } from './browser';
import { injectPreferences } from './preferences';
import { getNeededScripts } from './script-loading';
import { getCdn, loadScript, loadScriptWithContent, loadStyle, Logger } from './shared';
import { createFakeApplicationConfig } from './fakeApplicationConfig';

async function loadJsScripts(scripts: string[]) {
    for (const script of scripts.filter(script => script.includes('.js'))) {
        await loadScript(getCdn(script.replace('.js', '.min.js')));
    }
}

async function loadCssStyles(scripts: string[]) {
    for (const style of scripts.filter(script => script.includes('.css'))) {
        await loadStyle(getCdn(style));
    }
}

async function initCommonScript() {
    let commonScript = await (await fetch(getCdn('scripts/common.min.js'))).text();
    commonScript = commonScript.replaceAll('browser', 'steamDBBrowser');
    loadScriptWithContent(commonScript);
}

const applicationConfigUrls = [
    /steamcommunity\.com\/stats\//,
    /steamcommunity\.com\/id\/.+?\/stats\//,
];

function addPreferencesButton() {
    const defaultPreferencesButton = document.evaluate('//a[contains(@class, "popup_menu_item") and contains(text(), "Preferences")]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue as HTMLAnchorElement;
    if (defaultPreferencesButton) {
        const newButton = defaultPreferencesButton.cloneNode() as HTMLAnchorElement;
        newButton.href += '&steamdb=true';
        newButton.innerHTML = `
            <img class="ico16" style="background: none" src="${getCdn('/icons/white.svg')}" alt="logo">
            <span>${window.steamDBBrowser.i18n.getMessage('steamdb_options')}</span>
        `;
        defaultPreferencesButton.after(newButton);
    }
}

export default async function WebkitMain() {
    const href = window.location.href;

    if (!href.includes('https://store.steampowered.com') && !href.includes('https://steamcommunity.com')) {
        return;
    }

    Logger.Log('plugin is running');

    const scripts = getNeededScripts();

    await Promise.all([
        initCommonScript(),
        getLang(),
        loadCssStyles(scripts),
    ]);
    await loadScript(getCdn('scripts/global.min.js'));

    for (const url of applicationConfigUrls) {
        if (url.test(href)) {
            createFakeApplicationConfig();
            break;
        }
    }

    await loadJsScripts(scripts);

    addPreferencesButton();

    if (window.location.href.includes('https://store.steampowered.com/account')) {
        injectPreferences();
    }
}
