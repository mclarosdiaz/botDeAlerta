const WEBHOOK_URL = process.env.DISCORD_WEBHOOK;
const URL_API = "https://www.allaccess.com.ar/api/event/bts"; // O el endpoint de datos si lo detecta, o vamos directo a simular fetch con headers de navegador real

async function enviarAlerta(mensaje) {
    if (!WEBHOOK_URL) return;
    await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: `@everyone ${mensaje}` })
    });
}

async function verificarStock() {
    console.log("Consultando disponibilidad de BTS...");
    try {
        const respuesta = await fetch("https://www.allaccess.com.ar/event/bts", {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
            }
        });
        const html = await respuesta.text();
        const htmlLower = html.toLowerCase();

        // Como sabemos que cuando hay stock aparece "sector disponible"
        if (htmlLower.includes("sector disponible") || htmlLower.includes("comprar entradas")) {
            await enviar_alerta("¡ALERTA MÁXIMA! Hay entradas disponibles para BTS en All Access: https://www.allaccess.com.ar/event/bts");
            console.log("¡Stock detectado y alerta enviada!");
        } else {
            console.log("No se detectó stock en la respuesta HTML.");
        }
    } catch (e) {
        console.log(`Error en la petición: ${e.message}`);
    }
}

verificarStock();
