# ElisaOs AI Financial Assistant - Integration Guide

## 🤖 Overview

ElisaOs is an AI-powered financial assistant built with LangChain and OpenAI that provides:
- Credit score analysis and recommendations
- Loan simulations and advice
- Risk assessment
- Financial budgeting tips
- Natural language conversation with memory

## 📋 Prerequisites

- Python 3.11+
- OpenAI API Key
- Running Score, Risk, and Loan services

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd services/elisa-os
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
export OPENAI_API_KEY="sk-..."
export SCORE_SERVICE_URL="http://localhost:8080"
export RISK_SERVICE_URL="http://localhost:8000"
export LOAN_SERVICE_URL="http://localhost:8082"
```

### 3. Run Service

```bash
python main.py
```

ElisaOs will be available at `http://localhost:8001`

## 📡 API Endpoints

### Chat

**POST** `/api/v1/elisa/chat`

```json
{
  "user_address": "GXXXXX...",
  "message": "What's my credit score?",
  "context": {}  // optional
}
```

**Response:**
```json
{
  "response": "Your credit score is 750 (Prime tier)...",
  "suggestions": [
    "How can I improve my score?",
    "What loans can I get?"
  ]
}
```

### Analysis

**POST** `/api/v1/elisa/analyze`

```json
{
  "user_address": "GXXXXX...",
  "analysis_type": "credit"  // or "loan", "risk"
}
```

### Suggestions

**GET** `/api/v1/elisa/suggestions/{user_address}`

Returns personalized question suggestions.

### Clear Memory

**DELETE** `/api/v1/elisa/memory/{user_address}`

Clears conversation history for user.

### Health Check

**GET** `/api/v1/health`

```json
{
  "status": "healthy",
  "service": "elisa-os",
  "openai_configured": true,
  "active_users": 5
}
```

## 🎯 Features

### 1. Real-Time Integration

ElisaOs connects to your services in real-time:

```python
def get_credit_score(address: str):
    response = requests.get(f"{SCORE_SERVICE_URL}/api/v1/score/{address}")
    # Returns actual score from Score Service
```

### 2. AI Tools

Available tools for the AI agent:
- **Get Credit Score** - Fetches real-time score
- **Risk Assessment** - Analyzes default probability
- **Simulate Loan** - Calculates loan offers
- **Financial Tips** - Provides actionable advice
- **Budget Calculator** - Suggests budget breakdown

### 3. Conversation Memory

ElisaOs remembers conversation context per user:

```python
user_agents = {}  # Stores agent instances with memory

def get_or_create_agent(user_address):
    if user_address in user_agents:
        return user_agents[user_address]
    # Creates new agent with ConversationBufferMemory
```

## 💻 Frontend Integration

### Install API Client

```typescript
import { 
  chatWithElisa, 
  getElisaAnalysis,
  getElisaSuggestions,
  clearElisaMemory 
} from "@/lib/api";
```

### Basic Chat

```typescript
const response = await chatWithElisa(
  userAddress,
  "What loan options do I have?"
);

console.log(response.response);
console.log(response.suggestions);
```

### Quick Analysis

```typescript
const analysis = await getElisaAnalysis(userAddress, "credit");
console.log(analysis.analysis);
```

### Load Suggestions

```typescript
const  { suggestions } = await getElisaSuggestions(userAddress);
```

## 🎨 UI Components

### Chat Page

Full chat interface at `/chat`:
- Real-time messaging
- AI-generated suggestions
- Quick analysis buttons (Credit, Loan, Risk)
- Memory management
- Online/offline status

### Integration Example

```tsx
const [response, setResponse] = useState("");

const askElisa = async () => {
  const result = await chatWithElisa(
    address,
    "How do I improve my credit score?"
  );
  setResponse(result.response);
};
```

## 🔧 Configuration

### OpenAI Model

Change in `main.py`:

```python
llm = ChatOpenAI(
    temperature=0.7,  # 0 = deterministic, 1 = creative
    model="gpt-3.5-turbo",  # or "gpt-4"
    openai_api_key=api_key
)
```

### Agent Behavior

Modify `AgentType`:
```python
agent = initialize_agent(
    tools,
    llm,
    agent=AgentType.CHAT_CONVERSATIONAL_REACT_DESCRIPTION,
    verbose=True,  # Debug mode
    max_iterations=3  # Max tool calls per query
)
```

## 🐳 Docker Deployment

### Build Image

```bash
cd services/elisa-os
docker build -t stellarcredit/elisa-service .
```

### Run Container

```bash
docker run -p 8001:8001 \
  -e OPENAI_API_KEY="sk-..." \
  -e SCORE_SERVICE_URL="http://score-service:8080" \
  stellarcredit/elisa-service
```

## ☸️ Kubernetes Deployment

```bash
kubectl apply -f infra/k8s/deployments/elisa-service.yaml
```

Features:
- 2 replicas minimum
- Auto-scaling up to 10 replicas
- Health checks
- Environment variables from secrets

## 📊 Monitoring

### Check Health

```bash
curl http://localhost:8001/api/v1/health
```

### View Active Users

```json
{
  "active_users": 5
}
```

### Logs

```bash
# Docker
docker logs elisa-service

# Kubernetes
kubectl logs -f deployment/elisa-service -n stellarcredit
```

## 🔒 Security

### API Key Management

Never commit OpenAI API keys!

```bash
# Use environment variables
export OPENAI_API_KEY="sk-..."

# Or Kubernetes secrets
kubectl create secret generic stellarcredit-secrets \
  --from-literal=openai-api-key=sk-...
```

### Rate Limiting

OpenAI has rate limits. Consider:
- Caching responses
- User-based throttling
- Fallback responses when offline

## 🧪 Testing

### Test Chat Endpoint

```bash
curl -X POST http://localhost:8001/api/v1/elisa/chat \
  -H "Content-Type: application/json" \
  -d '{
    "user_address": "GTEST123",
    "message": "What is my credit score?"
  }'
```

### Test Analysis

```bash
curl -X POST http://localhost:8001/api/v1/elisa/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "user_address": "GTEST123",
    "analysis_type": "credit"
  }'
``````

## 💡 Tips

1. **Prompt Engineering**: Customize the AI behavior by modifying tool descriptions
2. **Memory Management**: Clear memory periodically to prevent context overflow
3. **Error Handling**: Always handle offline gracefully in the frontend
4. **Caching**: Cache common queries to reduce API costs
5. **Monitoring**: Track OpenAI token usage for cost control

## 🚨 Troubleshooting

### "ElisaOs is offline"

1. Check OpenAI API key is set
2. Verify network connectivity
3. Check OpenAI API status

### "Service unavailable"

1. Verify Score/Risk services are running
2. Check service URLs are correct
3. Review network/firewall rules

### High latency

1. OpenAI API can be slow (2-5s)
2. Consider caching for common queries
3. Use loading states in UI

## 📈 Cost Optimization

### Reduce OpenAI Costs

1. Use GPT-3.5-turbo instead of GPT-4
2. Lower temperature for deterministic responses
3. Limit max_tokens in responses
4. Cache frequent queries
5. Implement user request limits

### Example Cost Savings

```python
llm = ChatOpenAI(
    temperature=0.3,  # More deterministic = less tokens
    max_tokens=500,   # Limit response length
    model="gpt-3.5-turbo"  # Cheaper than GPT-4
)
```

## 🎯 Future Enhancements

- [ ] Streaming responses for faster UX
- [ ] Multi-language support
- [ ] Voice integration
- [ ] Personalized financial coaching
- [ ] Integration with more services (Governance, PIX)
- [ ] Redis for distributed memory
- [ ] Vector database for RAG

## 📝 License

Part of StellarCredit platform.

---

**Built with ❤️ using LangChain + OpenAI**
