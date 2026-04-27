FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG NEXT_PUBLIC_API_URL=http://34.229.147.34:4000/graphql
ARG NEXTAUTH_URL=http://34.229.147.34:3000
ARG NEXTAUTH_SECRET=shopsmart-nextauth-secret-2026
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXTAUTH_URL=$NEXTAUTH_URL
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET
RUN mkdir -p public && npm run build

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/.next ./.next
RUN mkdir -p public
EXPOSE 3000
CMD ["npm", "start"]
