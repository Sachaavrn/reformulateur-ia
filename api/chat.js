export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({
      error: {
        message: "Méthode non autorisée. Utilise POST."
      }
    });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: {
        message: "La variable d'environnement GROQ_API_KEY est manquante."
      }
    });
  }

  const body = req.body || {};
  const { model, messages, temperature } = body;

  if (!model || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({
      error: {
        message: "Paramètres invalides : 'model' et 'messages' sont requis."
      }
    });
  }

  try {
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: typeof temperature === "number" ? temperature : 0.7
      })
    });

    const data = await groqResponse.json();

    if (!groqResponse.ok) {
      const errorMessage = data && data.error && data.error.message
        ? data.error.message
        : "Erreur Groq inconnue.";
      return res.status(groqResponse.status).json({
        error: {
          message: errorMessage
        }
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      error: {
        message: `Erreur serveur lors de l'appel Groq : ${error.message}`
      }
    });
  }
}
