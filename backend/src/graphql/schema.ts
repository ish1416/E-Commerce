export const typeDefs = `#graphql
  type User {
    id: ID!
    email: String!
    name: String
    role: Role!
    createdAt: String!
  }

  type Product {
    id: ID!
    name: String!
    description: String
    price: Float!
    stock: Int!
    images: [String!]!
    category: Category!
    store: Store!
    createdAt: String!
  }

  type Category {
    id: ID!
    name: String!
    slug: String!
  }

  type Store {
    id: ID!
    name: String!
    slug: String!
    description: String
  }

  type Order {
    id: ID!
    status: OrderStatus!
    total: Float!
    items: [OrderItem!]!
    createdAt: String!
  }

  type OrderItem {
    id: ID!
    product: Product!
    quantity: Int!
    price: Float!
  }

  type CartItem {
    id: ID!
    product: Product!
    quantity: Int!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  enum Role {
    SHOPPER
    SELLER
    ADMIN
  }

  enum OrderStatus {
    PENDING
    CONFIRMED
    PROCESSING
    SHIPPED
    DELIVERED
    CANCELLED
  }

  type Query {
    me: User
    products(categoryId: String, search: String, limit: Int, offset: Int): [Product!]!
    product(id: ID!): Product
    categories: [Category!]!
    cart: [CartItem!]!
    orders: [Order!]!
    order(id: ID!): Order
  }

  type Mutation {
    register(email: String!, password: String!, name: String): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    addToCart(productId: ID!, quantity: Int!): CartItem!
    removeFromCart(productId: ID!): Boolean!
    placeOrder(shippingAddress: ShippingAddressInput!): Order!
  }

  input ShippingAddressInput {
    street: String!
    city: String!
    state: String!
    zip: String!
    country: String!
  }
`;
