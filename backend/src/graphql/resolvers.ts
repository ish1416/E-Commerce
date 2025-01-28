import { GraphQLError } from 'graphql';
import { hashPassword, comparePassword, signToken } from '../services/auth';
import { Context } from './context';

function requireAuth(ctx: Context): string {
  if (!ctx.userId) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHORIZED' } });
  return ctx.userId;
}

export const resolvers = {
  Query: {
    me: async (_: unknown, __: unknown, ctx: Context) => {
      const userId = requireAuth(ctx);
      return ctx.prisma.user.findUnique({ where: { id: userId } });
    },

    products: async (
      _: unknown,
      args: { categoryId?: string; search?: string; limit?: number; offset?: number },
      ctx: Context
    ) => {
      return ctx.prisma.product.findMany({
        where: {
          ...(args.categoryId && { categoryId: args.categoryId }),
          ...(args.search && { name: { contains: args.search, mode: 'insensitive' } }),
        },
        include: { category: true, store: true },
        take: args.limit ?? 20,
        skip: args.offset ?? 0,
      });
    },

    product: async (_: unknown, { id }: { id: string }, ctx: Context) => {
      return ctx.prisma.product.findUnique({
        where: { id },
        include: { category: true, store: true },
      });
    },

    categories: async (_: unknown, __: unknown, ctx: Context) => {
      return ctx.prisma.category.findMany();
    },

    cart: async (_: unknown, __: unknown, ctx: Context) => {
      const userId = requireAuth(ctx);
      return ctx.prisma.cartItem.findMany({
        where: { userId },
        include: { product: { include: { category: true, store: true } } },
      });
    },

    orders: async (_: unknown, __: unknown, ctx: Context) => {
      const userId = requireAuth(ctx);
      return ctx.prisma.order.findMany({
        where: { userId },
        include: { items: { include: { product: { include: { category: true, store: true } } } } },
        orderBy: { createdAt: 'desc' },
      });
    },

    order: async (_: unknown, { id }: { id: string }, ctx: Context) => {
      const userId = requireAuth(ctx);
      return ctx.prisma.order.findFirst({
        where: { id, userId },
        include: { items: { include: { product: { include: { category: true, store: true } } } } },
      });
    },
  },

  Mutation: {
    register: async (
      _: unknown,
      args: { email: string; password: string; name?: string },
      ctx: Context
    ) => {
      const existing = await ctx.prisma.user.findUnique({ where: { email: args.email } });
      if (existing) throw new GraphQLError('Email already in use');

      const passwordHash = await hashPassword(args.password);
      const user = await ctx.prisma.user.create({
        data: { email: args.email, name: args.name, passwordHash },
      });
      return { token: signToken(user.id), user };
    },

    login: async (
      _: unknown,
      args: { email: string; password: string },
      ctx: Context
    ) => {
      const user = await ctx.prisma.user.findUnique({ where: { email: args.email } });
      if (!user?.passwordHash) throw new GraphQLError('Invalid credentials');

      const valid = await comparePassword(args.password, user.passwordHash);
      if (!valid) throw new GraphQLError('Invalid credentials');

      return { token: signToken(user.id), user };
    },

    addToCart: async (
      _: unknown,
      args: { productId: string; quantity: number },
      ctx: Context
    ) => {
      const userId = requireAuth(ctx);
      return ctx.prisma.cartItem.upsert({
        where: { userId_productId: { userId, productId: args.productId } },
        update: { quantity: { increment: args.quantity } },
        create: { userId, productId: args.productId, quantity: args.quantity },
        include: { product: { include: { category: true, store: true } } },
      });
    },

    removeFromCart: async (
      _: unknown,
      args: { productId: string },
      ctx: Context
    ) => {
      const userId = requireAuth(ctx);
      await ctx.prisma.cartItem.delete({
        where: { userId_productId: { userId, productId: args.productId } },
      });
      return true;
    },

    placeOrder: async (
      _: unknown,
      args: { shippingAddress: Record<string, string> },
      ctx: Context
    ) => {
      const userId = requireAuth(ctx);
      const cartItems = await ctx.prisma.cartItem.findMany({
        where: { userId },
        include: { product: true },
      });

      if (cartItems.length === 0) throw new GraphQLError('Cart is empty');

      const total = cartItems.reduce(
        (sum, item) => sum + Number(item.product.price) * item.quantity,
        0
      );

      const order = await ctx.prisma.$transaction(async (tx) => {
        const newOrder = await tx.order.create({
          data: {
            userId,
            total,
            shippingAddress: args.shippingAddress,
            items: {
              create: cartItems.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.product.price,
              })),
            },
          },
          include: { items: { include: { product: { include: { category: true, store: true } } } } },
        });

        await tx.cartItem.deleteMany({ where: { userId } });
        return newOrder;
      });

      return order;
    },
  },
};
