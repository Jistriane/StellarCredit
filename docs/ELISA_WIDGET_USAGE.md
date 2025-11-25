# ElisaOs Widget - Guia de Uso

## 🎯 Visão Geral

O **ElisaWidget** é um componente React reutilizável que adiciona um chat flutuante com a assistente de IA ElisaOs em qualquer página da sua aplicação.

## ✨ Características

- 💬 Chat flutuante e minimalista
- 🎨 Design moderno com gradientes e animações
- 📱 Responsivo e adaptável
- 🔄 Estados de minimizado/maximizado
- ⚡ Integração em tempo real com ElisaOs
- 🎭 Posicionamento configurável
- 🌈 Tema dark com bordas neon

## 🚀 Uso Básico

### Importar o Componente

```tsx
import ElisaWidget from "@/app/components/ElisaWidget";
```

### Adicionar à Página

```tsx
export default function MyPage() {
  const [address, setAddress] = useState("");

  return (
    <div>
      {/* Seu conteúdo da página */}
      
      {/* Widget ElisaOs */}
      {address && <ElisaWidget userAddress={address} />}
    </div>
  );
}
```

## 📋 Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `userAddress` | `string` | **obrigatório** | Endereço Stellar do usuário |
| `position` | `"bottom-right"` \| `"bottom-left"` | `"bottom-right"` | Posição do widget na tela |

## 🎨 Exemplos de Uso

### Posição Padrão (Direita)

```tsx
<ElisaWidget userAddress={userAddress} />
```

### Posição Esquerda

```tsx
<ElisaWidget userAddress={userAddress} position="bottom-left" />
```

### Condicional (Apenas Usuários Logados)

```tsx
{isConnected && userAddress && (
  <ElisaWidget userAddress={userAddress} />
)}
```

## 🎭 Estados do Widget

### 1. Botão Flutuante (Fechado)
- Ícone circular com gradiente
- Animação ao hover
- Clique para abrir

### 2. Minimizado
- Barra de título compacta
- Indicador de status online
- Botões para maximizar/fechar

### 3. Maximizado (Chat Completo)
- Área de mensagens com scroll
- Campo de input
- Botão de envio
- Animação de "digitando..."

## 💅 Customização de Estilo

### Alterar Cores do Gradiente

```tsx
// No componente ElisaWidget.tsx
className="bg-gradient-to-r from-purple-600 to-blue-600"
// Altere para suas cores preferidas:
className="bg-gradient-to-r from-green-600 to-teal-600"
```

### Alterar Tamanho

```tsx
// Largura e altura do chat
<Card className="w-96 h-[500px] ...">
// Altere para:
<Card className="w-[450px] h-[600px] ...">
```

### Alterar Posição Fixa

```tsx
// Adicione mais opções de posição
type Position = "bottom-right" | "bottom-left" | "top-right" | "top-left";

const positionClasses = {
  "bottom-right": "bottom-4 right-4",
  "bottom-left": "bottom-4 left-4",
  "top-right": "top-4 right-4",
  "top-left": "top-4 left-4",
}[position];
```

## 🔧 Funcionalidades

### Enviar Mensagem

```tsx
const handleSend = async () => {
  // Adiciona mensagem do usuário
  setMessages(prev => [...prev, { role: "user", content: input }]);
  
  // Chama API ElisaOs
  const response = await chatWithElisa(userAddress, input);
  
  // Adiciona resposta da IA
  setMessages(prev => [...prev, { 
    role: "assistant", 
    content: response.response 
  }]);
};
```

### Tecla Enter para Enviar

```tsx
const handleKeyPress = (e: React.KeyboardEvent) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
};
```

### Auto-scroll para Última Mensagem

```tsx
useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages]);
```

## 🎯 Integração em Páginas Existentes

### Home Page

```tsx
// apps/web/app/page.tsx
import ElisaWidget from "./components/ElisaWidget";

export default function Home() {
  const [address, setAddress] = useState("");
  
  return (
    <div>
      {/* Conteúdo da home */}
      {address && <ElisaWidget userAddress={address} />}
    </div>
  );
}
```

### Loans Page

```tsx
// apps/web/app/loans/page.tsx
import ElisaWidget from "../components/ElisaWidget";

export default function LoansPage() {
  const [address, setAddress] = useState("");
  
  return (
    <div>
      {/* Conteúdo de empréstimos */}
      {address && <ElisaWidget userAddress={address} />}
    </div>
  );
}
```

### Governance Page

```tsx
// apps/web/app/governance/page.tsx
import ElisaWidget from "../components/ElisaWidget";

export default function GovernancePage() {
  const [address, setAddress] = useState("");
  
  return (
    <div>
      {/* Conteúdo de governança */}
      {address && <ElisaWidget userAddress={address} />}
    </div>
  );
}
```

## 🚨 Tratamento de Erros

### Erro de Conexão

```tsx
try {
  const response = await chatWithElisa(userAddress, input);
  // Processa resposta
} catch (error) {
  setMessages(prev => [...prev, {
    role: "assistant",
    content: "Erro ao conectar com ElisaOs. Tente novamente."
  }]);
}
```

### Validação de Input

```tsx
if (!input.trim() || loading) return;
```

## 🎨 Animações

### Bounce nos Dots de Loading

```tsx
<div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
<div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100" />
<div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-200" />
```

### Pulse no Indicador Online

```tsx
<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
```

## 📱 Responsividade

O widget é fixo e mantém tamanho consistente em todas as telas. Para mobile, considere:

```tsx
// Adicione breakpoints
<Card className="w-96 h-[500px] md:w-96 sm:w-80 xs:w-full ...">
```

## 🔒 Segurança

### Validação de Endereço

```tsx
{address && address.startsWith('G') && (
  <ElisaWidget userAddress={address} />
)}
```

### Sanitização de Input

```tsx
const sanitizedInput = input.trim().slice(0, 500); // Limite de caracteres
```

## 🧪 Testes

### Testar Widget

```tsx
// Test se renderiza
expect(screen.getByRole('button')).toBeInTheDocument();

// Test se abre
fireEvent.click(screen.getByRole('button'));
expect(screen.getByText('ElisaOs AI')).toBeInTheDocument();

// Test envio de mensagem
fireEvent.change(input, { target: { value: 'Hello' } });
fireEvent.click(sendButton);
expect(screen.getByText('Hello')).toBeInTheDocument();
```

## 💡 Dicas

1. **Performance**: O widget só renderiza quando `address` está disponível
2. **UX**: Considere adicionar sons de notificação para novas mensagens
3. **Acessibilidade**: Adicione `aria-labels` para leitores de tela
4. **Persistência**: Salve histórico no localStorage para manter contexto
5. **Notificações**: Adicione badge com contador de mensagens não lidas

## 🚀 Melhorias Futuras

- [ ] Suporte a markdown nas mensagens
- [ ] Upload de arquivos/imagens
- [ ] Mensagens de voz
- [ ] Histórico persistente
- [ ] Notificações push
- [ ] Temas customizáveis
- [ ] Multi-idioma
- [ ] Atalhos de teclado

## 📝 Exemplo Completo

```tsx
"use client";

import { useState } from "react";
import ElisaWidget from "@/app/components/ElisaWidget";

export default function MyPage() {
  const [address, setAddress] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  const connectWallet = async () => {
    // Lógica de conexão com Freighter
    const addr = await getPublicKey();
    setAddress(addr);
    setIsConnected(true);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header>
        <button onClick={connectWallet}>
          {isConnected ? "Conectado" : "Conectar Carteira"}
        </button>
      </header>

      {/* Conteúdo Principal */}
      <main>
        <h1>Minha Página</h1>
        {/* Seu conteúdo aqui */}
      </main>

      {/* Widget ElisaOs - Sempre disponível quando conectado */}
      {isConnected && address && (
        <ElisaWidget 
          userAddress={address} 
          position="bottom-right" 
        />
      )}
    </div>
  );
}
```

---

**Desenvolvido com ❤️ para StellarCredit**
