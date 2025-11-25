#!/usr/bin/env python3
"""
StellarCredit Auto-Translator
Translates all Portuguese text to English in frontend files
"""

import re
import os
from pathlib import Path

# Translation dictionary - Portuguese to English
TRANSLATIONS = {
    # Navigation
    "Empréstimos": "Loans",
    "Governança": "Governance",
    "Perfil": "Profile",
    "Conectar Carteira": "Connect Wallet",
    "Início": "Home",
    
    # Common terms
    "Pontuação de Crédito": "Credit Score",
    "Score de Crédito": "Credit Score",
    "Conecte a Carteira": "Connect Wallet",
    "Taxa de Juros": "Interest Rate",
    "Empréstimos Ativos": "Active Loans",
    "Insights da IA": "AI Insights",
    "Volume Total": "Total Volume",
    "Usuários Ativos": "Active Users",
    
    # Loans page
    "Meus Empréstimos": "My Loans",
    "Criar Novo Empréstimo": "Create New Loan",
    "Valor do Empréstimo (BRL)": "Loan Amount (BRL)",
    "Valor do Empréstimo": "Loan Amount",
    "Garantia (XLM)": "Collateral (XLM)",
    "Garantia": "Collateral",
    "Prazo (Dias)": "Term (Days)",
    "Prazo": "Term",
    "Criar Empréstimo": "Create Loan",
    "Principal": "Principal",
    "Pago": "Paid",
    "Restante": "Remaining",
    "Fazer Pagamento": "Make Payment",
    "Ativo": "Active",
    "Pago": "Repaid",
    "Inadimplente": "Defaulted",
    "Vencimento": "Due",
    "Dias": "Days",
    
    # Governance
    "Governança (DAO)": "Governance (DAO)",
    "Criar Proposta": "Create Proposal",
    "Título": "Title",
    "Descrição": "Description",
    "Enviar Proposta": "Submit Proposal",
    "Propostas Ativas": "Active Proposals",
    "A Favor": "For",
    "Contra": "Against",
    "Quórum": "Quorum",
    "Votar a Favor": "Vote For",
    "Votar Contra": "Vote Against",
    "Proposto por": "Proposed by",
    "Termina": "Ends",
    "Período de votação": "Voting period",
    "dias": "days",
    "votos": "votes",
    "Título da proposta": "Proposal title",
    "Descreva sua proposta": "Describe your proposal",
    "Descreva sua proposta...": "Describe your proposal...",
    "Sucedido": "Succeeded",
    "Derrotado": "Defeated",
    "Executado": "Executed",
    
    # PIX
    "Operações PIX": "PIX Operations",
    "Depósito (PIX → BRLT)": "Deposit (PIX → BRLT)",
    "Saque (BRLT → PIX)": "Withdrawal (BRLT → PIX)",
    "Depósito": "Deposit",
    "Saque": "Withdrawal",
    "Valor (BRL)": "Amount (BRL)",
    "Valor": "Amount",
    "Gerar QR Code PIX": "Generate PIX QR Code",
    "Chave PIX": "PIX Key",
    "Solicitar Saque": "Request Withdrawal",
    "Histórico de Transações": "Transaction History",
    "Completado": "Completed",
    "Pendente": "Pending",
    "Escaneie com o app do seu banco": "Scan with your bank app",
    "Limite diário": "Daily limit",
    "Processamento instantâneo": "Instant processing",
    "Taxa": "Fee",
    "Processamento": "Processing",
    "minutos": "minutes",
    "CPF, email, telefone ou chave aleatória": "CPF, email, phone, or random key",
    
    # Chat
    "Chat com ElisaOs": "Chat with ElisaOs",
    "Online": "Online",
    "Offline": "Offline",
    "Análise de Crédito": "Credit Analysis",
    "Recomendações de Empréstimo": "Loan Recommendations",
    "Avaliação de Risco": "Risk Assessment",
    "Pergunte sobre seu crédito, empréstimos ou obtenha conselhos financeiros...": "Ask about your credit, loans, or get financial advice...",
    "Questões sugeridas": "Suggested questions",
    "Questões sugeridas:": "Suggested questions:",
    "Olá! Sou ElisaOs, sua assistente financeira de IA": "Hi! I'm ElisaOs, your AI financial assistant",
    "Como posso ajudar você hoje?": "How can I help you today?",
    "Desculpe, encontrei um erro": "Sorry, I encountered an error",
    "Por favor, tente novamente": "Please try again",
    "Memória limpa!": "Memory cleared!",
    "Memória limpa! Como posso ajudar você hoje?": "Memory cleared! How can I help you today?",
    
    # Profile
    "Meu Perfil": "My Profile",
    "Editar Perfil": "Edit Profile",
    "Total de Empréstimos": "Total Loans",
    "Total Emprestado": "Total Borrowed",
    "Atividade Recente": "Recent Activity",
    "Pagamento de Empréstimo": "Loan Payment",
    "Depósito PIX": "PIX Deposit",
    "Empréstimo Criado": "Loan Created",
    "Configurações de Segurança": "Security Settings",
    "Autenticação de Dois Fatores": "Two-Factor Authentication",
    "Adicione segurança extra à sua conta": "Add extra security to your account",
    "Habilitar": "Enable",
    "Frase de Recuperação": "Recovery Phrase",
    "Faça backup do acesso à sua carteira": "Backup your wallet access",
    "Ver": "View",
    "Dispositivos Conectados": "Connected Devices",
    "Gerencie suas sessões ativas": "Manage your active sessions",
    "Gerenciar": "Manage",
    "Membro desde": "Member since",
    "Verificado": "Verified",
    
    # ElisaWidget
    "Olá! Sou ElisaOs, sua assistente financeira": "Hi! I'm ElisaOs, your financial assistant",
    "Digite sua mensagem...": "Type your message...",
    "Desculpe, não consegui processar sua mensagem": "Sorry, I couldn't process your message",
    "Erro ao conectar com ElisaOs": "Error connecting to ElisaOs",
    "Tente novamente": "Please try again",
    
    # Status
    "Inativo": "Inactive",
    "Aprovado": "Approved",
    "Rejeitado": "Rejected",
    "Processando": "Processing",
    "Sucesso": "Success",
    "Erro": "Error",
    "Carregando": "Loading",
    
    # Actions
    "Criar": "Create",
    "Editar": "Edit",
    "Excluir": "Delete",
    "Salvar": "Save",
    "Cancelar": "Cancel",
    "Confirmar": "Confirm",
    "Enviar": "Send",
    "Voltar": "Back",
    "Próximo": "Next",
    "Anterior": "Previous",
    "Atualizar": "Update",
    "Fechar": "Close",
    
    # Messages
    "Sucesso!": "Success!",
    "Erro ao processar": "Error processing",
    "Operação concluída": "Operation completed",
    "Aguarde...": "Please wait...",
    "Nenhum resultado encontrado": "No results found",
    "Carregando dados...": "Loading data...",
    
    # Specific phrases
    "Conecte a carteira para obter insights": "Connect wallet to get insights",
    "Conecte a carteira para obter insights.": "Connect wallet to get insights.",
    "Dê-me uma breve visão sobre minha pontuação de crédito": "Give me a short insight about my credit score",
    "Dê-me uma breve visão sobre minha pontuação de crédito.": "Give me a short insight about my credit score.",
    "Criando empréstimo": "Creating loan",
    "com": "with",
    "de garantia": "collateral",
}

def translate_text(text):
    """Translate text using the translation dictionary"""
    # Sort by length (longest first) to avoid partial replacements
    sorted_translations = sorted(TRANSLATIONS.items(), key=lambda x: len(x[0]), reverse=True)
    
    result = text
    for pt, en in sorted_translations:
        # Use word boundaries to avoid partial matches
        result = re.sub(r'\b' + re.escape(pt) + r'\b', en, result)
    
    return result

def translate_file(file_path):
    """Translate a single file"""
    print(f"📝 Translating: {file_path}")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Translate content
        translated = translate_text(content)
        
        # Write back
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(translated)
        
        print(f"✅ Translated: {file_path}")
        return True
    except Exception as e:
        print(f"❌ Error translating {file_path}: {e}")
        return False

def main():
    """Main translation function"""
    print("🌍 StellarCredit Auto-Translator")
    print("=" * 50)
    
    # Files to translate
    base_path = Path(__file__).parent.parent
    files_to_translate = [
        base_path / "apps/web/app/page.tsx",
        base_path / "apps/web/app/loans/page.tsx",
        base_path / "apps/web/app/governance/page.tsx",
        base_path / "apps/web/app/chat/page.tsx",
        base_path / "apps/web/app/pix/page.tsx",
        base_path / "apps/web/app/profile/page.tsx",
    ]
    
    success_count = 0
    total_count = len(files_to_translate)
    
    for file_path in files_to_translate:
        if file_path.exists():
            if translate_file(file_path):
                success_count += 1
        else:
            print(f"⚠️  File not found: {file_path}")
    
    print("\n" + "=" * 50)
    print(f"✨ Translation complete!")
    print(f"📊 Success: {success_count}/{total_count} files")
    
    if success_count == total_count:
        print("🎉 All files translated successfully!")
    else:
        print(f"⚠️  {total_count - success_count} files had issues")

if __name__ == "__main__":
    main()
