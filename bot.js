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
    console.log("Iniciando revisión en All Access...");
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
        await page.goto(URL_OBJETIVO, { timeout: 60000 });
        
        // Esperamos a que aparezca el botón principal o cualquier elemento de la tiquetera
        await page.waitForSelector('body', { timeout: 10000 });
        
        // Damos un par de segundos extra para que cargue el contenido dinámico
        await page.waitForTimeout(5000);

        // Verificamos si existe el botón de "Comprar entradas" o similar de forma explícita en el DOM
        const hayBotonCompra = await page.evaluate(() => {
            const botones = Array.from(document.querySelectorAll('a, button, div'));
            return botones.some(el => el.innerText && el.innerText.toLowerCase().includes('comprar entradas'));
        });

        if (hayBotonCompra) {
            await enviarAlerta(`¡ALERTA MÁXIMA! Botón de compra detectado para BTS en All Access: ${URL_OBJETIVO}`);
            console.log("¡Stock o botón detectado! Alerta enviada.");
        } else {
            console.log("No se detectó el botón de compra en este momento.");
        }
    } catch (e) {
        console.log(`Error durante la ejecución: ${e.message}`);
    } finally {
        await browser.close();
    }
}

verificarStock();
