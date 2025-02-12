import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';

const handler = NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || '',
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const res = await fetch(
            process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                query: `mutation Login($email: String!, $password: String!) {
                  login(email: $email, password: $password) {
                    token user { id email name role }
                  }
                }`,
                variables: { email: credentials.email, password: credentials.password },
              }),
            }
          );
          const { data } = await res.json();
          if (data?.login) {
            return {
              id: data.login.user.id,
              email: data.login.user.email,
              name: data.login.user.name,
              token: data.login.token,
            };
          }
          return null;
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.accessToken = (user as { token?: string }).token;
      return token;
    },
    async session({ session, token }) {
      (session as { accessToken?: unknown }).accessToken = token.accessToken;
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    newUser: '/auth/signup',
  },
  session: { strategy: 'jwt' },
});

export { handler as GET, handler as POST };
