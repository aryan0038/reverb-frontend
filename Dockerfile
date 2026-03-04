FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
# Vite needs this host flag to work inside Docker
CMD ["npm", "run", "dev", "--", "--host"]   