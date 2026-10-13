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
    const browser = await chromium.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // Simulamos un User-Agent real de navegador para evitar filtros anti-bot
    await page.setExtraHTTPHeaders({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    
    try {
        await page.goto(URL_OBJETIVO, { timeout: 60000, waitUntil: 'domcontentloaded' });
        
        // Damos tiempo a que carguen los scripts internos de la tiquetera
        await page.waitForTimeout(8000);

        // Extraemos todo el contenido de texto visible de la página renderizada
        const contenidoTotal = await page.evaluate(() => document.body.innerText.toLowerCase());

        // Verificamos si aparece cualquiera de los indicadores de que hay entradas
        const hayDisponibilidad = contenidoTotal.includes("sector disponible") || 
                                  contenidoTotal.includes("ver entradas") || 
                                  (contenidoTotal.includes("comprar") && !contenidoTotal.includes("agotado"));

        if (hayDisponibilidad) {
            await enviar_alerta(`¡ALERTA MÁXIMA! Posible stock o entradas detectadas para BTS: ${URL_OBJETIVO}`);
            console.log("¡Stock detectado! Alerta enviada a Discord.");
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
