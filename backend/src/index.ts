import express from 'express';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';
import { createContext } from './graphql/context';

const app = express();
const PORT = process.env.PORT || 4000;

async function main() {
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();

  app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
  app.use(express.json());

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  app.use('/graphql', expressMiddleware(server, { context: createContext }));

  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on http://localhost:${PORT}/graphql`);
  });
}

main().catch(console.error);

export { app };
