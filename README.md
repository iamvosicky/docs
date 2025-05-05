# Contract Generator Platform

A comprehensive platform for automated contract generation, including:

- Next.js frontend application
- Cloudflare Workers backend API
- PDF conversion service

## Project Structure

- `/contract-generator` - Next.js frontend application
- `/contract-generator/worker` - Cloudflare Worker backend API
- `/contract-generator/pdf-service` - PDF conversion service

## Deployment

### Frontend (Next.js)

The frontend application is deployed to Cloudflare Pages:

```bash
# From the root directory
npm run pages:deploy

# Or from the contract-generator directory
cd contract-generator
npm run pages:deploy
```

### Backend API (Cloudflare Worker)

The backend API is deployed to Cloudflare Workers:

```bash
cd contract-generator/worker
npm run deploy
```

### PDF Service

The PDF service can be deployed as a standalone service or containerized with Docker:

```bash
cd contract-generator/pdf-service
docker build -t contract-generator-pdf-service .
docker run -p 8080:8080 contract-generator-pdf-service
```

## Development

### Frontend

```bash
cd contract-generator
npm run dev
```

### Backend API

```bash
cd contract-generator/worker
npm run dev
```

### PDF Service

```bash
cd contract-generator/pdf-service
npm run dev
```
