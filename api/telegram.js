// api/telegram.js
// Webhook simplu pentru botul Beanly hostat pe Vercel

export default async function handler(req, res) {
  const BOT_TOKEN = process.env.BOT_TOKEN; // vezi mai jos la Environment Variables
  const WEBAPP_URL = process.env.WEBAPP_URL || "https://beanlymap01.vercel.app";

  if (!BOT_TOKEN) {
    console.error("❌ Lipsă BOT_TOKEN în Environment Variables");
    return res.status(500).send("No bot token");
  }

  // Dacă cineva deschide URL-ul în browser (GET), doar răspundem simplu
  if (req.method !== "POST") {
    return res.status(200).send("Beanly bot webhook este activ.");
  }

  const update = req.body;

  const message = update.message;
  if (!message || !message.chat || !message.chat.id) {
    // nimic interesant, dar nu e eroare
    return res.status(200).send("No message");
  }

  const chatId = message.chat.id;
  const text = message.text || "";

  // helper pentru a trimite mesaj înapoi la Telegram
  async function sendMessage(replyText, replyMarkup) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    const payload = {
      chat_id: chatId,
      text: replyText,
      reply_markup: replyMarkup,
    };

    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  // tastatura principală
  const mainKeyboard = {
    keyboard: [
      [
        {
          text: "📍 Deschide Beanly Map",
          web_app: { url: WEBAPP_URL },
        },
      ],
      [{ text: "⭐ Top cafenele" }, { text: "ℹ️ Ajutor" }],
    ],
    resize_keyboard: true,
    one_time_keyboard: false,
  };

  // tastatura pentru ecranul Top
  const topKeyboard = {
    keyboard: [
      [
        {
          text: "📍 Deschide Beanly Map",
          web_app: { url: WEBAPP_URL },
        },
      ],
      [{ text: "⬅️ Înapoi la start" }],
    ],
    resize_keyboard: true,
  };

  const topCafes = [
    "1️⃣ COFFEE DRIVE",
    "2️⃣ Black Coffee Drive",
    "3️⃣ Grand Coffee Place",
    "4️⃣ Coffee Stop",
    "5️⃣ Flamingo Coffee",
  ];

  // ---- logica de răspuns ----

  if (text === "/start") {
    const firstName = message.from?.first_name || "acolo";

    const welcomeText = [
      `👋 Salut, ${firstName}! Bine ai venit în Beanly – mini aplicația care îți arată cele mai bune cafenele din oraș.`,
      "",
      "☕ Ce poți face aici:",
      "• vezi pe hartă cafenelele cu cele mai bune reviews",
      "• vezi top 5 locații recomandate",
      "• lași propriul tău review după ce bei cafeaua",
      "",
      "🚀 Pornește de aici:",
      "– apasă „📍 Deschide Beanly Map” ca să vezi harta interactivă",
      "– sau „⭐ Top cafenele” ca să vezi o listă rapidă",
    ].join("\n");

    await sendMessage(welcomeText, mainKeyboard);
    return res.status(200).send("OK");
  }

  if (text === "⭐ Top cafenele") {
    const topText = [
      "⭐ Top cafenele Beanly (conform reviews din aplicație):",
      "",
      ...topCafes,
      "",
      "📍 Pentru locație exactă și reviews detaliate, apasă „📍 Deschide Beanly Map”.",
    ].join("\n");

    await sendMessage(topText, topKeyboard);
    return res.status(200).send("OK");
  }

  if (text === "ℹ️ Ajutor" || text === "/help") {
    const helpText = [
      "ℹ️ Cum funcționează Beanly:",
      "",
      "1. Deschizi „📍 Deschide Beanly Map” din butonul de jos",
      "2. Alegi o cafenea de pe hartă",
      "3. Vezi reviews lăsate de alți oameni",
      "4. Lași și tu un review direct în app – o singură dată per locație de pe telefonul tău",
      "",
      "Dacă ai o sugestie de cafenea nouă sau idei pentru aplicație, scrie pur și simplu aici în chat ☕",
    ].join("\n");

    await sendMessage(helpText, mainKeyboard);
    return res.status(200).send("OK");
  }

  if (text === "⬅️ Înapoi la start") {
    const backText =
      "Ai revenit la start. Folosește /start dacă vrei mesajul complet de bun venit 😊";
    await sendMessage(backText, mainKeyboard);
    return res.status(200).send("OK");
  }

  // orice altceva
  const defaultText =
    "Poți folosi butoanele de jos sau comanda /start pentru a reveni la meniul principal ☕";

  await sendMessage(defaultText, mainKeyboard);
  return res.status(200).send("OK");
}
