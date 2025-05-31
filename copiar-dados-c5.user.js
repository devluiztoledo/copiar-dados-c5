// ==UserScript==
// @name         A7 Relatório TP-LINK C5 e G5 - Luiz Toledo
// @namespace    http://tampermonkey.net/
// @version      2.0
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

    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    const extractCount = text => {
        const m = text.match(/\((\d+)\)/) || text.match(/^(\d+)$/);
        return m ? parseInt(m[1], 10) : 0;
    };

    async function buildReport() {
        const modeloEl = document.getElementById('modelName');
        if (!modeloEl) {
            alert('[EC220-G5] Elemento "modelName" não encontrado. Está na interface correta do roteador?');
            return;
        }

        await sleep(1000);
        const modelo = modeloEl.textContent.trim();
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


        let largura2 = 'N/A';
        let largura5 = 'N/A';

        const advancedTab = document.getElementById('advanced');
        if (advancedTab) {
            advancedTab.click();
            await sleep(500);


            const show24g = document.getElementById('showWireless_2g');
            if (show24g) {
                show24g.click();
                await sleep(500);
                const larguraEl = document.getElementById('channelWidth_2g');
                largura2 = larguraEl?.value.trim() || 'N/A';
            }


            const show5g = document.getElementById('showWireless_5g');
            if (show5g) {
                show5g.click();
                await sleep(500);
                const larguraEl = document.getElementById('channelWidth_5g');
                largura5 = larguraEl?.value.trim() || 'N/A';
            }
        }
        let prior5g = 'N/A';
        if (ssid2g && ssid5g) {
            const has5gInName = /(5g|5ghz)/i.test(ssid5g);
            prior5g = (ssid2g === ssid5g && !has5gInName) ? 'Habilitado' : 'Desabilitado';
        }

        const ipv6 = 'Habilitado';


        let upnp = 'N/A';
        if (advancedTab) {
            advancedTab.click();
            await sleep(400);
            const upnpLink = [...document.querySelectorAll('a.click')].find(a => a.getAttribute('url') === 'upnp.htm');
            if (upnpLink) {
                upnpLink.click();
                await sleep(600);
                const upnpEl = document.getElementById('upnp_on');
                upnp = (upnpEl?.classList.contains('selected')) ? 'Habilitado' : 'Desabilitado';
            }
        }


        let uptime = 'N/A';
        if (advancedTab) {
            advancedTab.click();
            await sleep(400);
            const timeLink = [...document.querySelectorAll('a.click.more')].find(a => a.getAttribute('url') === 'time.htm');
            if (timeLink) {
                timeLink.click();
                for (let i = 0; i < 10; i++) {
                    await sleep(300);
                    const up = document.getElementById('UpTime');
                    if (up) {
                        uptime = up.textContent.trim();
                        break;
                    }
                }
            }
        }

        const report = `
[DADOS DO ROTEADOR]
Cliente possui um ${modelo}
Equipamentos Wireless: ${wifiCount}
Equipamentos Cabeados: ${wireCount}
Priorizar 5G: ${prior5g}
IPV6: ${ipv6}
UPnP: ${upnp}
DNS Primário: ${dns1}
DNS Secundário: ${dns2}
Rede 2.4GHz Canal: ${canal2} | Largura: ${largura2}
Rede 5GHz  Canal: ${canal5} | Largura: ${largura5}
Uptime: ${uptime}
        `.trim();

        GM_setClipboard(report);
        alert('Relatório TP-LINK copiado para a área de transferência!');
    }


    document.addEventListener('keydown', e => {
        if (e.key === 'Insert') {
            e.preventDefault();
            buildReport();
        }
    });
})();
