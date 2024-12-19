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

# Argumentos para definir variáveis de ambiente em tempo de build
ARG DATABASE_URL
ARG REDIS_PASSWORD
ARG PORT

# Defina essas variáveis como variáveis de ambiente dentro do container
ENV DATABASE_URL=${DATABASE_URL}
ENV REDIS_PASSWORD=${REDIS_PASSWORD}
ENV PORT=${PORT}

# Exponha a porta para o servidor
EXPOSE ${PORT}

# Comando para rodar o servidor
CMD ["npm", "start"]
