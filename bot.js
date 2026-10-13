const { chromium } = require('playwright');

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK;
const URL_OBJETIVO = "https://www.allaccess.com.ar/event/bts";

async function enviarAlerta(mensaje) {
    if (!WEBHOOK_URL) return;
    await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: `@everyone ${mensaje}` })
    });
}

async function verificarStock() {
    console.log("Iniciando navegador en la nube...");
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
        await page.goto(URL_OBJETIVO, { timeout: 60000 });
        
        // Esperamos a que carguen los elementos de la tiquetera
        await page.waitForTimeout(10000);

        // Capturamos el texto visible
        const texto = await page.evaluate(() => document.body.innerText);
        console.log("--- TEXTO CAPTURADO POR EL BOT ---");
        console.log(texto.substring(0, 500)); // Imprime los primeros 500 caracteres para ver qué lee
        console.log("----------------------------------");

        const textoLower = texto.toLowerCase();

        if (textoLower.includes("sector disponible") || textoLower.includes("ver entradas")) {
            await enviar_alerta(`¡ALERTA MÁXIMA! Entradas disponibles para BTS: ${URL_OBJETIVO}`);
            console.log("¡Alerta enviada a Discord!");
        } else {
            console.log("No se detectó stock en la lectura.");
        }
    } catch (e) {
        console.log(`Error: ${e.message}`);
    } finally {
        await browser.close();
    }
}

verificarStock();
