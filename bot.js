const { chromium } = require('playwright');

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK;
const URL_OBJETIVO = "https://www.allaccess.com.ar/event/bts";

async function enviarAlerta(mensaje) {
    await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: `@everyone ${mensaje}` })
    });
}

async function verificarStock() {
    console.log("Iniciando revisión única...");
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
        await page.goto(URL_OBJETIVO, { timeout: 60000 });
        await page.waitForLoadState("networkidle");
        
        const textoPagina = await page.innerText("body");
        const textoLower = textoPagina.toLowerCase();

        if (textoLower.includes("comprar") && !textoLower.includes("agotado")) {
            await enviarAlerta(`¡ALERTA MÁXIMA! Posible stock detectado en All Access: ${URL_OBJETIVO}`);
            console.log("¡Stock detectado y alerta enviada!");
        } else {
            console.log("Sigue agotado. Fin de la ejecución.");
        }
    } catch (e) {
        console.log(`Error en la ejecución: ${e.message}`);
    } finally {
        await browser.close();
    }
}

verificarStock();