// ==UserScript==
// @name         A7 Relatório TP-LINK C5 - Luiz Toledo
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Coleta modelo, dispositivos, DNS, largura de canal, UPnP e uptime do Archer C5 automaticamente.
// @author       Luiz Toledo
// @match        *://*/*
// @updateURL    https://raw.githubusercontent.com/devluiztoledo/copiar-dados-c5/main/copiar-dados-c5.user.js
// @downloadURL  https://raw.githubusercontent.com/devluiztoledo/copiar-dados-c5/main/copiar-dados-c5.user.js
// @icon         https://raw.githubusercontent.com/devluiztoledo/copiar-dados-c5/main/icon.png
// @grant        GM_setClipboard
// @run-at       document-idle

// ==/UserScript==

(function() {
  'use strict';
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const extractCount = text => { const m = text.match(/\((\d+)\)/) || text.match(/^(\d+)$/); return m ? parseInt(m[1], 10) : 0; };

  async function buildReport() {
    const modeloEl = document.getElementById('modelName');
    if (!modeloEl) return;

    await sleep(1500);
    const modelo = modeloEl.textContent.trim();
    const wifiCount = extractCount(document.getElementById('map_num_wireless')?.textContent || '');
    const wireCount = extractCount(document.getElementById('map_num_wire')?.textContent || '');


    const dnsRaw = document.getElementById('internetDns')?.value || '';
    const ipv4s = dnsRaw.match(/\b\d+\.\d+\.\d+\.\d+\b/g) || [];
    const dns1 = ipv4s[0] || 'N/A';
    const dns2 = ipv4s[1] || 'N/A';


    document.getElementById('advanced')?.click();
    await sleep(400);
    document.getElementById('showWireless_5g')?.click();
    await sleep(400);
    const ssid5g = document.getElementById('ssid_5g')?.value.trim() || '';
    const prior5g = /(5g|5ghz)$/i.test(ssid5g.replace(/\s+$/, '').toLowerCase()) ? 'Desabilitado' : 'Habilitado';


    const ipv6 = 'Habilitado';


    document.getElementById('advanced')?.click();
    await sleep(400);


    document.getElementById('showWireless_2g')?.click();
    await sleep(400);
    const canal24 = document.getElementById('channel_2g')?.value.trim() || 'N/A';
    const largura24 = document.getElementById('channelWidth_2g')?.value.trim() || 'N/A';


    document.getElementById('showWireless_5g')?.click();
    await sleep(400);
    const canal5 = document.getElementById('channel_5g')?.value.trim() || 'N/A';
    const largura5 = document.getElementById('channelWidth_5g')?.value.trim() || 'N/A';


    document.getElementById('advanced')?.click();
    await sleep(400);
    const natLink = Array.from(document.querySelectorAll('a.click.more')).find(a => a.querySelector('span.text.T')?.textContent.includes('Direcionamento NAT'));
    natLink?.click();
    await sleep(400);
    const upnpMenu = Array.from(document.querySelectorAll('a.click')).find(a => a.getAttribute('url') === 'upnp.htm');
    upnpMenu?.click();
    await sleep(400);
    const upnp = document.getElementById('upnp_on')?.classList.contains('selected') ? 'Habilitado' : 'Desabilitado';


    document.getElementById('advanced')?.click();
    await sleep(400);
    const fsLink = Array.from(document.querySelectorAll('a.click.more')).find(a => a.getAttribute('url') === 'time.htm');
    fsLink?.click();

    let uptime = 'N/A';
    for (let i = 0; i < 10; i++) {
      await sleep(300);
      const up = document.getElementById('UpTime');
      if (up) {
        uptime = up.textContent.trim();
        break;
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
Rede 2.4 com canal em ${canal24} e largura em ${largura24} MHz
Rede 5G com canal em ${canal5} e largura em ${largura5} MHz
Uptime: ${uptime}
`.trim();

    GM_setClipboard(report);
    alert('Relatório copiado para a área de transferência!');
  }

  window.addEventListener('load', buildReport);
})();
