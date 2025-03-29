# 🔒 Locked In App

Um aplicativo desktop moderno construído com Next.js e Tauri, projetado para aumentar sua produtividade e foco.

![Locked In App Banner](public/placeholder-logo.svg)

## 📋 Índice

- [Recursos](#-recursos)
- [Tecnologias](#-tecnologias)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
  - [Windows](#windows)
  - [macOS](#macos)
  - [Linux](#linux)
- [Desenvolvimento](#-desenvolvimento)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)

## 🚀 Recursos

- ⏰ **Pomodoro Timer**: Gerencie seu tempo eficientemente com o método Pomodoro
- 📝 **Lista de Tarefas**: Organize suas atividades diárias
- 📅 **Diário**: Mantenha um registro de suas reflexões e progresso
- 🎵 **Player Spotify**: Integração com Spotify para música de fundo
- 🎥 **Player YouTube**: Assista vídeos educacionais sem sair do app
- 🌓 **Modo Escuro/Claro**: Interface adaptável para seu conforto visual
- ⚡ **Performance Nativa**: Construído com Tauri para máxima eficiência

## 💻 Tecnologias

- [Next.js 15](https://nextjs.org/) - Framework React
- [Tauri 2](https://tauri.app/) - Framework para apps desktop
- [Rust](https://www.rust-lang.org/) - Backend nativo
- [TypeScript](https://www.typescriptlang.org/) - Tipagem estática
- [Tailwind CSS](https://tailwindcss.com/) - Estilização
- [shadcn/ui](https://ui.shadcn.com/) - Componentes de UI

## 📋 Pré-requisitos

Antes de instalar o app, você precisa ter:

- Windows 10/11, macOS 10.15+, ou Linux
- Conexão com internet para instalação inicial

## 🔧 Instalação

### Windows

Execute os seguintes comandos no PowerShell (como administrador):

\`\`\`bash
# Instalar dependências necessárias
winget install Microsoft.VisualStudio.2022.BuildTools
winget install Rust.Rust
winget install Git.Git
winget install OpenJS.NodeJS.LTS
winget install pnpm

# Clonar e instalar o app
git clone https://github.com/Lenoncardozo/Locked-In-App.git
cd Locked-In-App
pnpm install
pnpm desktop:build
\`\`\`

O instalador será gerado em \`src-tauri/target/release/bundle/\`

### macOS

\`\`\`bash
# Instalar Homebrew (se não tiver)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar dependências
brew install node
brew install rust
brew install pnpm
brew install git

# Clonar e instalar o app
git clone https://github.com/Lenoncardozo/Locked-In-App.git
cd Locked-In-App
pnpm install
pnpm desktop:build
\`\`\`

### Linux (Ubuntu/Debian)

\`\`\`bash
# Instalar dependências
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
curl -fsSL https://get.pnpm.io/install.sh | sh -

sudo apt update
sudo apt install -y nodejs build-essential git

# Clonar e instalar o app
git clone https://github.com/Lenoncardozo/Locked-In-App.git
cd Locked-In-App
pnpm install
pnpm desktop:build
\`\`\`

## 👩‍💻 Desenvolvimento

Para rodar o app em modo de desenvolvimento:

\`\`\`bash
# Instalar dependências
pnpm install

# Iniciar em modo desenvolvimento
pnpm desktop:dev
\`\`\`

## 📁 Estrutura do Projeto

\`\`\`
Locked-In-App/
├── app/                    # Componentes e páginas Next.js
├── components/             # Componentes React reutilizáveis
├── hooks/                  # React hooks personalizados
├── lib/                    # Utilitários e funções auxiliares
├── public/                 # Arquivos estáticos
├── src-tauri/             # Código Rust do Tauri
├── styles/                 # Arquivos CSS globais
└── package.json           # Dependências e scripts
\`\`\`

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, leia nossas diretrizes de contribuição antes de submeter um PR.

1. Faça um Fork do projeto
2. Crie sua Feature Branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit suas mudanças (\`git commit -m 'Add some AmazingFeature'\`)
4. Push para a Branch (\`git push origin feature/AmazingFeature\`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

Feito com ❤️ usando Next.js e Tauri