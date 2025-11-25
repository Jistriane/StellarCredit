const SCORE_API = "http://localhost:8081/api/v1";
const RISK_API = "http://localhost:8000/api/v1";
const PIX_API = "http://localhost:3001/api/v1";
const ELISA_API = "http://localhost:8001/api/v1";

export async function getCreditScore(address: string) {
  try {
    const res = await fetch(`${SCORE_API}/score/${address}`);
    if (!res.ok) throw new Error("Failed to fetch score");
    return await res.json();
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function assessRisk(address: string, amount: number) {
  try {
    const res = await fetch(`${RISK_API}/risk/assess`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address, amount }),
    });
    return await res.json();
  } catch (e) {
    console.error(e);
    return null;
  }
}

// ElisaOs AI Functions
export async function chatWithElisa(address: string, message: string, context?: any) {
  try {
    const res = await fetch(`${ELISA_API}/elisa/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_address: address, message, context }),
    });
    return await res.json();
  } catch (e) {
    console.error(e);
    return { response: "ElisaOs is offline. Please try again later." };
  }
}

export async function getElisaAnalysis(address: string, analysisType: "credit" | "loan" | "risk") {
  try {
    const res = await fetch(`${ELISA_API}/elisa/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_address: address, analysis_type: analysisType }),
    });
    return await res.json();
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function getElisaSuggestions(address: string) {
  try {
    const res = await fetch(`${ELISA_API}/elisa/suggestions/${address}`);
    return await res.json();
  } catch (e) {
    console.error(e);
    return { suggestions: [] };
  }
}

export async function clearElisaMemory(address: string) {
  try {
    const res = await fetch(`${ELISA_API}/elisa/memory/${address}`, {
      method: "DELETE",
    });
    return await res.json();
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function checkElisaHealth() {
  try {
    const res = await fetch(`${ELISA_API}/health`);
    return await res.json();
  } catch (e) {
    console.error(e);
    return { status: "offline" };
  }
}
