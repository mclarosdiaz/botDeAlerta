const { chromium } = require('playwright');

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK;
const URL_OBJETIVO = "https://www.allaccess.com.ar/event/bts";

async function enviarAlerta(mensaje) {
    if (!WEBHOOK_URL) {
        console.log("Error: Falta configurar el DISCORD_WEBHOOK.");
        return;
    }
    await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: `@everyone ${mensaje}` })
    });
}

async function verificarStock() {
    console.log("Iniciando revisión en All Access...");
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
        await page.goto(URL_OBJETIVO, { timeout: 60000 });
        await page.waitForLoadState("networkidle");

        // Buscamos si existe el botón de compra o elementos de sectores disponibles
        const hayStock = await page.evaluate(() => {
            const textoBody = document.body.innerText.toLowerCase();
            // Detecta si aparece algún indicador de sector disponible o botón activo
            return textoBody.includes("sector disponible") || textoBody.includes("comprar entradas");
        });

        if (hayStock) {
            await enviar_alerta(`¡ALERTA MÁXIMA! Hay entradas disponibles para BTS en All Access: ${URL_OBJETIVO}`);
            console.log("¡Stock detectado y alerta enviada a Discord!");
        } else {
            console.log("No se detectó stock disponible en este momento.");
        }
    } catch (e) {
        console.log(`Error durante la ejecución: ${e.message}`);
    } finally {
        await browser.close();
    }
}

verificarStock();
