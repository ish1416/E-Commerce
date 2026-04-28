import { ApolloServer } from '@apollo/server';
import { typeDefs } from '../../graphql/schema';
import { resolvers } from '../../graphql/resolvers';

// Mock prisma
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  product: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  category: {
    findMany: jest.fn(),
  },
  cartItem: {
    findMany: jest.fn(),
    upsert: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
  order: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
  },
  $transaction: jest.fn(),
};

function buildServer(_userId: string | null = null) {
  return new ApolloServer({
    typeDefs,
    resolvers,
  });
}

describe('GraphQL resolvers – products', () => {
  let server: ApolloServer;

  beforeEach(() => {
    server = buildServer();
    jest.clearAllMocks();
  });

  it('returns products list', async () => {
    const mockProducts = [
      {
        id: 'p1',
        name: 'Test Product',
        description: 'desc',
        price: 29.99,
        stock: 10,
        images: [],
        category: { id: 'c1', name: 'Electronics', slug: 'electronics' },
        store: { id: 's1', name: 'Test Store', slug: 'test-store', description: null },
        createdAt: new Date().toISOString(),
      },
    ];

    mockPrisma.product.findMany.mockResolvedValue(mockProducts);

    const response = await server.executeOperation(
      { query: `query { products { id name price } }` },
      { contextValue: { prisma: mockPrisma, userId: null } }
    );

    expect(response.body.kind).toBe('single');
    if (response.body.kind === 'single') {
      expect(response.body.singleResult.errors).toBeUndefined();
      expect((response.body.singleResult.data as { products: unknown[] }).products).toHaveLength(1);
    }
  });

  it('returns categories', async () => {
    mockPrisma.category.findMany.mockResolvedValue([
      { id: 'c1', name: 'Electronics', slug: 'electronics' },
    ]);

    const response = await server.executeOperation(
      { query: `query { categories { id name slug } }` },
      { contextValue: { prisma: mockPrisma, userId: null } }
    );

    expect(response.body.kind).toBe('single');
    if (response.body.kind === 'single') {
      expect(response.body.singleResult.errors).toBeUndefined();
    }
  });

  it('rejects cart query when unauthenticated', async () => {
    const response = await server.executeOperation(
      { query: `query { cart { id } }` },
      { contextValue: { prisma: mockPrisma, userId: null } }
    );

    expect(response.body.kind).toBe('single');
    if (response.body.kind === 'single') {
      expect(response.body.singleResult.errors).toBeDefined();
      expect(response.body.singleResult.errors![0].extensions?.code).toBe('UNAUTHORIZED');
    }
  });
});
