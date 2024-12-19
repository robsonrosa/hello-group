# Use uma imagem base do Node.js
FROM node:18-alpine

# Defina o diretório de trabalho na imagem
WORKDIR /app

# Copie os arquivos de configuração para o diretório de trabalho
COPY package.json package-lock.json ./

# Instale as dependências
RUN npm install

# Copie o restante do código do servidor
COPY . .

# Exponha a porta para o servidor
EXPOSE 3000

# Comando para rodar o servidor
CMD ["npm", "start"]
