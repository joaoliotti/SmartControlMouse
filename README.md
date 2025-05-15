# 🧠 Eye & Head Controlled Cursor
### Este é um projeto experimental de acessibilidade que utiliza a biblioteca face-api.js para rastrear movimentos do rosto e olhos via webcam, permitindo controlar um cursor na tela apenas com o rosto. Também é possível simular cliques com base em gestos faciais, como abrir a boca e piscar.

# 🚀 Funcionalidades
#### 📹 Captura facial em tempo real com webcam.

#### 🎯 Calibração com movimento dos olhos ou cabeça.

#### 🎮 Cursor virtual controlado por movimento do nariz.

#### 👁️‍🗨️ Detecção de olhos fechados e boca aberta para interações:

#### Piscar com o olho esquerdo + boca aberta → clique esquerdo

#### Piscar com o olho direito + boca aberta → clique direito

#### Piscar com ambos os olhos por 2 segundos → desativa o cursor

# 🧰 Tecnologias utilizadas
#### React

#### TypeScript

#### face-api.js

#### Web Speech API para feedback por voz

# 🛠️ Como executar localmente
## Pré-requisitos
Node.js instalado (versão 14 ou superior)

Webcam funcional

# Passos pra clonar o repositório:

## Instalação

1. Clone ou baixe este repositório
```bash
https://github.com/joaoliotti/SmartControlMouse
```
2. Instale as dependências:
```bash
npm install
```

# 🎯 Instruções de uso
## Clique em Iniciar Calibração.

#### Siga a esfera azul com os olhos ou a cabeça (dependendo do modo escolhido).

#### Após a calibração (15 segundos ou fixar o olhar no ponto por 3 segundos), o cursor começará a seguir seus movimentos.

#### Use os gestos para simular cliques.

# ⚙️ Atalhos de gesto

| Parâmetro   | Tipo       | O que faz:                                  |
| :---------- | :--------- | :------------------------------------------ |
| `Gesto`      | `Boca aberta + olho esquerdo fechado` | Clique Esquerdo |
| `Gesto`      | `Boca aberta + olho direito fechado`  | Clique Direito  |
| `Gesto`      | `Ambos olhos fechados por 2 segundos` | Pausar cursor   |
| `Gesto`      | `Boca aberta + olho esquerdo fechado` | Clique esquerdo |

# 📄 Licença
Este projeto está licenciado sob a licença [MIT](https://choosealicense.com/licenses/mit/).
