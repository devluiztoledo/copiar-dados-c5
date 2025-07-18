// ==UserScript==
// @name         A7 Relatório TP-LINK C5 e G5 - Luiz Toledo
// @namespace    http://tampermonkey.net/
// @version      3.0
// @description  Coleta modelo, dispositivos, DNS, largura de canal, UPnP e uptime do Archer C5 e G5 automaticamente.
// @author       Luiz Toledo
// @match        *://*/*
// @updateURL    https://raw.githubusercontent.com/devluiztoledo/copiar-dados-c5/main/copiar-dados-c5.user.js
// @downloadURL  https://raw.githubusercontent.com/devluiztoledo/copiar-dados-c5/main/copiar-dados-c5.user.js
// @icon         https://raw.githubusercontent.com/devluiztoledo/copiar-dados-c5/main/icon.png
// @grant        GM_setClipboard
// @run-at       document-idle

// ==/UserScript==

(function () {
    'use strict';

    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const extractCount = text => {
        const m = text.match(/\((\d+)\)/) || text.match(/^(\d+)$/);
        return m ? parseInt(m[1], 10) : 0;
    };

    async function buildReport() {

        let modelo;
        const modelNameEl = document.getElementById('modelName');
        if (modelNameEl) {

            modelo = modelNameEl.textContent.trim();
        } else {

            const botHver = document.getElementById('bot_hver');
            if (botHver) {
                modelo = botHver.textContent.trim();
            } else {

                return;
            }
        }


        await sleep(1000);


        const wifiCount = extractCount(document.getElementById('map_num_wireless')?.textContent || '');
        const wireCount = extractCount(document.getElementById('map_num_wire')?.textContent || '');
        const dnsRaw = document.getElementById('internetDns')?.value || '';
        const ipv4s = dnsRaw.match(/\b\d+\.\d+\.\d+\.\d+\b/g) || [];
        const dns1 = ipv4s[0] || 'N/A';
        const dns2 = ipv4s[1] || 'N/A';


        const ssid2g = document.getElementById('routerWirelessSsid_2g')?.value.trim() || '';
        const ssid5g = document.getElementById('routerWirelessSsid_5g')?.value.trim() || '';
        const canal2 = document.getElementById('routerWirelessChannel_2g')?.value.trim() || 'N/A';
        const canal5 = document.getElementById('routerWirelessChannel_5g')?.value.trim() || 'N/A';


        let largura2 = 'N/A', largura5 = 'N/A';
        const advTab = document.getElementById('advanced');
        if (advTab) {
            advTab.click();
            await sleep(500);
            const show24 = document.getElementById('showWireless_2g');
            if (show24) { show24.click(); await sleep(400);
                largura2 = document.getElementById('channelWidth_2g')?.value.trim() || 'N/A';
            }
            const show5 = document.getElementById('showWireless_5g');
            if (show5) { show5.click(); await sleep(400);
                largura5 = document.getElementById('channelWidth_5g')?.value.trim() || 'N/A';
            }
        }


        let prior5g = 'N/A';
        if (ssid2g && ssid5g) {
            const has5 = /(5g|5ghz)/i.test(ssid5g);
            prior5g = (ssid2g === ssid5g && !has5) ? 'Habilitado' : 'Desabilitado';
        }


        const ipv6 = 'Habilitado';


        let upnp = 'N/A';
        if (advTab) {
            advTab.click();
            await sleep(400);
            const link = [...document.querySelectorAll('a.click')].find(a => a.getAttribute('url') === 'upnp.htm');
            if (link) { link.click(); await sleep(500);
                upnp = document.getElementById('upnp_on')?.classList.contains('selected') ? 'Habilitado' : 'Desabilitado';
            }
        }


        let uptime = 'N/A';
        if (advTab) {
            advTab.click();
            await sleep(400);
            const tlink = [...document.querySelectorAll('a.click.more')].find(a => a.getAttribute('url') === 'time.htm');
            if (tlink) {
                tlink.click();
                for (let i = 0; i < 10; i++) {
                    await sleep(300);
                    const u = document.getElementById('UpTime');
                    if (u) { uptime = u.textContent.trim(); break; }
                }
            }
        }


        const report = `
[DADOS DO ROTEADOR]
Modelo: ${modelo}
Equipamentos Wireless: ${wifiCount}
Equipamentos Cabeados: ${wireCount}
Priorizar 5G: ${prior5g}
IPV6: ${ipv6}
UPnP: ${upnp}
DNS Primário: ${dns1}
DNS Secundário: ${dns2}
Rede 2.4GHz Canal: ${canal2} | Largura: ${largura2}
Rede 5GHz Canal: ${canal5} | Largura: ${largura5}
Uptime: ${uptime}
        `.trim();

        GM_setClipboard(report);
        alert('Relatório TP‑LINK copiado para a área de transferência!');
    }


    document.addEventListener('keydown', e => {
        if (e.key === 'Insert') {
            e.preventDefault();
            buildReport();
        }
    });
})();
