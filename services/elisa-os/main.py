from fastapi import FastAPI, BackgroundTasks
import joblib
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import requests
from typing import List, Dict, Optional
from langchain_openai import ChatOpenAI
from langchain.agents import initialize_agent, Tool, AgentType
from langchain.memory import ConversationBufferMemory

app = FastAPI(title="ElisaOs - AI Financial Assistant")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Service URLs
SCORE_SERVICE_URL = os.getenv("SCORE_SERVICE_URL", "http://localhost:8080")
RISK_SERVICE_URL = os.getenv("RISK_SERVICE_URL", "http://localhost:8000")
LOAN_SERVICE_URL = os.getenv("LOAN_SERVICE_URL", "http://localhost:8082")

class ChatRequest(BaseModel):
    user_address: str
    message: str
    context: Optional[Dict] = None

class ChatResponse(BaseModel):
    response: str
    suggestions: Optional[List[str]] = None
    data: Optional[Dict] = None

class AnalysisRequest(BaseModel):
    user_address: str
    analysis_type: str  # "credit", "loan", "risk"

# Real Tools integrating with services
def get_credit_score(address: str) -> str:
    """Retrieves user's current credit score from Score Service."""
    try:
        response = requests.get(f"{SCORE_SERVICE_URL}/api/v1/score/{address}", timeout=5)
        if response.status_code == 200:
            data = response.json()
            score = data.get("score", 0)
            tier = data.get("risk_tier", "Unknown")
            confidence = data.get("confidence", 0)
            return f"Credit Score: {score} ({tier} tier, {confidence}% confidence)"
        else:
            return f"Credit Score: 750 (Estimated - service unavailable)"
    except Exception as e:
        return f"Credit Score: 750 (Estimated - {str(e)})"

def get_risk_assessment(address: str, amount: str = "5000") -> str:
    """Gets risk assessment for a user."""
    try:
        response = requests.post(
            f"{RISK_SERVICE_URL}/api/v1/risk/assess",
            json={"address": address, "amount": float(amount)},
            timeout=5
        )
        if response.status_code == 200:
            data = response.json()
            prob = data.get("default_probability", 0)
            fraud = data.get("fraud_detected", False)
            return f"Risk Assessment: {prob*100:.1f}% default probability, Fraud: {'Yes' if fraud else 'No'}"
        else:
            return "Risk Assessment: Low risk (service unavailable)"
    except Exception as e:
        return f"Risk Assessment: Unable to assess - {str(e)}"

def simulate_loan(amount: str) -> str:
    """Simulates loan offers based on amount."""
    try:
        amt = float(amount)
        if amt < 1000:
            return f"Loan of R$ {amt:.2f}: 4.5% interest, 12 months, monthly payment R$ {amt * 1.045 / 12:.2f}"
        elif amt < 10000:
            return f"Loan of R$ {amt:.2f}: 5.5% interest, 24 months, monthly payment R$ {amt * 1.055 / 24:.2f}"
        else:
            return f"Loan of R$ {amt:.2f}: 6.0% interest, 36 months, monthly payment R$ {amt * 1.06 / 36:.2f}"
    except:
        return "Please provide a valid loan amount in BRL"

def get_financial_tips() -> str:
    """Provides financial tips to improve credit score."""
    return """
    Top 3 Tips to Improve Your Credit Score:
    1. Pay bills on time (35% impact)
    2. Keep credit utilization below 30%
    3. Don't close old credit accounts
    """

def calculate_budget(income: str) -> str:
    """Calculates recommended budget breakdown."""
    try:
        inc = float(income)
        return f"""
        Budget for R$ {inc:.2f} monthly income:
        - Essentials (50%): R$ {inc * 0.5:.2f}
        - Savings (20%): R$ {inc * 0.2:.2f}
        - Lifestyle (30%): R$ {inc * 0.3:.2f}
        """
    except:
        return "Please provide your monthly income in BRL"

# Tools for AI Agent
tools = [
    Tool(
        name="Get Credit Score",
        func=get_credit_score,
        description="Get the current credit score for a user address. Input: user wallet address"
    ),
    Tool(
        name="Risk Assessment",
        func=get_risk_assessment,
        description="Assess default risk for a user. Input: user address and optional loan amount"
    ),
    Tool(
        name="Simulate Loan",
        func=simulate_loan,
        description="Simulate loan offers for a given amount. Input: loan amount in BRL"
    ),
    Tool(
        name="Financial Tips",
        func=get_financial_tips,
        description="Get tips to improve credit score"
    ),
    Tool(
        name="Budget Calculator",
        func=calculate_budget,
        description="Calculate recommended budget breakdown. Input: monthly income in BRL"
    )
]

# Agent instances per user (simple in-memory, should use Redis in production)
user_agents = {}

def get_or_create_agent(user_address: str):
    """Get or create agent for user with memory."""
    if user_address in user_agents:
        return user_agents[user_address]
    
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return None
    
    try:
        llm = ChatOpenAI(
            temperature=0.7,
            model="gpt-3.5-turbo",
            openai_api_key=api_key
        )
        
        memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True
        )
        
        agent = initialize_agent(
            tools,
            llm,
            agent=AgentType.CHAT_CONVERSATIONAL_REACT_DESCRIPTION,
            verbose=True,
            memory=memory,
            handle_parsing_errors=True,
            max_iterations=3
        )
        
        user_agents[user_address] = agent
        return agent
    except Exception as e:
        print(f"Error creating agent: {e}")
        return None

@app.post("/api/v1/elisa/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Chat with ElisaOs AI assistant."""
    agent = get_or_create_agent(request.user_address)
    
    if not agent:
        return ChatResponse(
            response="🤖 ElisaOs is currently offline. Please configure OPENAI_API_KEY to enable AI features.",
            suggestions=[
                "Check your credit score manually",
                "View loan options",
                "Contact support"
            ]
        )
    
    try:
        # Add context to message if provided
        message = request.message
        if request.context:
            context_str = f"\nContext: {request.context}"
            message = f"{message}{context_str}"
        
        response = agent.run(input=message)
        
        # Generate suggestions based on response
        suggestions = []
        if "score" in response.lower():
            suggestions = ["How can I improve my score?", "What's my risk level?", "Show me loan options"]
        elif "loan" in response.lower():
            suggestions = ["What's the best rate?", "Check my approval odds", "Compare loan options"]
        elif "risk" in response.lower():
            suggestions = ["How to reduce risk?", "What affects my risk?", "Check my score"]
        
        return ChatResponse(
            response=response,
            suggestions=suggestions if suggestions else None
        )
    
    except Exception as e:
        print(f"Chat error: {e}")
        return ChatResponse(
            response="⚠️ Sorry, I encountered an error processing your request. Please try again.",
            suggestions=["Try rephrasing your question", "Check system status"]
        )

@app.post("/api/v1/elisa/analyze")
async def analyze(request: AnalysisRequest):
    """Get AI-powered analysis for user."""
    agent = get_or_create_agent(request.user_address)
    
    if not agent:
        return {"error": "ElisaOs offline"}
    
    prompts = {
        "credit": f"Analyze the credit profile for user {request.user_address}. Get their score and provide recommendations.",
        "loan": f"What loan options would you recommend for user {request.user_address}?",
        "risk": f"Assess the risk profile for user {request.user_address}."
    }
    
    prompt = prompts.get(request.analysis_type, "Provide financial advice")
    
    try:
        response = agent.run(input=prompt)
        return {"analysis": response, "type": request.analysis_type}
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/v1/elisa/suggestions/{user_address}")
async def get_suggestions(user_address: str):
    """Get personalized suggestions for user."""
    suggestions = [
        "What's my current credit score?",
        "How can I improve my credit?",
        "Show me available loans",
        "What's my default risk?",
        "Help me budget my finances",
        "Compare loan rates"
    ]
    
    return {"suggestions": suggestions}

@app.delete("/api/v1/elisa/memory/{user_address}")
async def clear_memory(user_address: str):
    """Clear conversation memory for user."""
    if user_address in user_agents:
        del user_agents[user_address]
        return {"message": "Memory cleared"}
    return {"message": "No memory found"}

@app.get("/api/v1/health")
def health_check():
    """Health check endpoint."""
    api_key_configured = bool(os.getenv("OPENAI_API_KEY"))
    return {
        "status": "healthy",
        "service": "elisa-os",
        "openai_configured": api_key_configured,
        "active_users": len(user_agents)
    }

if __name__ == "__main__":
    import uvicorn
    print("🤖 Starting ElisaOs AI Financial Assistant...")
    print(f"📊 Score Service: {SCORE_SERVICE_URL}")
    print(f"⚠️  Risk Service: {RISK_SERVICE_URL}")
    print(f"💰 Loan Service: {LOAN_SERVICE_URL}")
    uvicorn.run(app, host="0.0.0.0", port=8001)
