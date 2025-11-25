import { ApolloServer } from '@apollo/server';
import { ApolloGateway, IntrospectAndCompose, RemoteGraphQLDataSource } from '@apollo/gateway';
import { expressMiddleware } from '@apollo/server/express4';
import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { makeExecutableSchema } from '@graphql-tools/schema';

// GraphQL Gateway for StellarCredit microservices
class StellarCreditGateway {
  private gateway: ApolloGateway;
  private server: ApolloServer;

  constructor() {
    // Configure gateway with all microservices
    this.gateway = new ApolloGateway({
      supergraphSdl: new IntrospectAndCompose({
        subgraphs: [
          {
            name: 'score',
            url: process.env.SCORE_SERVICE_URL || 'http://score-service:8080/graphql',
          },
          {
            name: 'risk',
            url: process.env.RISK_SERVICE_URL || 'http://risk-service:8000/graphql',
          },
          {
            name: 'loan',
            url: process.env.LOAN_SERVICE_URL || 'http://loan-service:8082/graphql',
          },
          {
            name: 'pix',
            url: process.env.PIX_SERVICE_URL || 'http://pix-service:3001/graphql',
          },
          {
            name: 'elisa',
            url: process.env.ELISA_SERVICE_URL || 'http://elisa-service:8001/graphql',
          },
        ],
      }),
      buildService({ url }) {
        return new RemoteGraphQLDataSource({
          url,
          willSendRequest({ request, context }) {
            // Forward auth headers
            if (context.authorization) {
              request.http?.headers.set('authorization', context.authorization);
            }
          },
        });
      },
    });

    this.server = new ApolloServer({
      gateway: this.gateway,
      plugins: [
        {
          async serverWillStart() {
            console.log('🚀 Apollo Federation Gateway started');
          },
        },
      ],
    });
  }

  async start() {
    await this.server.start();
    
    const app = express();
    
    app.use(
      '/graphql',
      cors(),
      express.json(),
      expressMiddleware(this.server, {
        context: async ({ req }) => ({
          authorization: req.headers.authorization,
          user: req.headers['x-user-address'],
        }),
      })
    );

    // Health check
    app.get('/health', (req, res) => {
      res.json({ status: 'healthy', service: 'graphql-gateway' });
    });

    const PORT = process.env.PORT || 4000;
    const httpServer = app.listen(PORT, () => {
      console.log(`🚀 Gateway ready at http://localhost:${PORT}/graphql`);
    });

    // WebSocket server for subscriptions
    const wsServer = new WebSocketServer({
      server: httpServer,
      path: '/graphql',
    });

    // Setup subscription handling
    // useServer({ schema: this.gateway.schema }, wsServer);

    return httpServer;
  }
}

// Federated schema examples for each service
const federatedSchemas = {
  score: `
    type CreditScore @key(fields: "address") {
      address: String!
      score: Int!
      confidence: Float!
      riskTier: RiskTier!
      timestamp: String!
      factors: [ScoreFactor!]!
    }

    type ScoreFactor {
      name: String!
      value: Float!
      weight: Float!
    }

    enum RiskTier {
      PRIME
      NEAR_PRIME
      SUBPRIME
    }

    extend type Query {
      getCreditScore(address: String!): CreditScore
      getScoreHistory(address: String!, limit: Int): [CreditScore!]!
    }

    extend type Subscription {
      scoreUpdated(address: String!): CreditScore!
    }
  `,

  risk: `
    type RiskAssessment @key(fields: "id") {
      id: ID!
      address: String!
      defaultProbability: Float!
      fraudDetected: Boolean!
      riskTier: String!
      factors: [String!]!
    }

    extend type Query {
      assessRisk(address: String!, amount: Float!): RiskAssessment!
    }
  `,

  loan: `
    type Loan @key(fields: "id") {
      id: ID!
      borrower: String!
      lender: String!
      principal: Float!
      collateralAmount: Float!
      interestRate: Float!
      termDays: Int!
      status: LoanStatus!
      paidAmount: Float!
    }

    enum LoanStatus {
      ACTIVE
      REPAID
      DEFAULTED
      LIQUIDATED
    }

    extend type Query {
      getLoan(id: ID!): Loan
      getUserLoans(address: String!): [Loan!]!
    }

    extend type Mutation {
      createLoan(input: CreateLoanInput!): Loan!
      makePayment(loanId: ID!, amount: Float!): Loan!
    }

    input CreateLoanInput {
      borrower: String!
      lender: String!
      principal: Float!
      collateralAmount: Float!
      interestRate: Float!
      termDays: Int!
    }

    extend type Subscription {
      loanUpdated(loanId: ID!): Loan!
    }
  `,
};

// Start gateway
if (require.main === module) {
  const gateway = new StellarCreditGateway();
  gateway.start().catch(console.error);
}

export { StellarCreditGateway, federatedSchemas };
