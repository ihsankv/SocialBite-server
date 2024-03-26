import express from 'express';
import bodyParser from 'body-parser';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { User } from './user';
import cors from 'cors'
import { GraphqlContext } from '../interfaces';
import JWTService from '../services/jwt';
import { Tweet } from './tweet';
import { queries } from './tweet/queries';
export async function initServer() {
  const app = express();

  app.use(bodyParser.json())
  app.use(cors())
  const graphqlServer = new ApolloServer<GraphqlContext>({
    typeDefs: `
           ${User.types}
           ${Tweet.types}
    
            type Query {
                ${User.queries}
                ${Tweet.queries}
            }
           
            type Mutation {
                ${Tweet.mutations}
                ${User.mutations}
            }
    
        `,
    resolvers: {
      Query: {
        ...User.resolvers.queries,
        ...Tweet.resolvers.queries,
      },
      Mutation: {
        ...Tweet.resolvers.mutations,
        ...User.resolvers.mutations,
      },
      ...Tweet.resolvers.extraResolvers,
      ...User.resolvers.extraResolvers

    },
  });
  // const graphqlServer = new ApolloServer({
  //     typeDefs: `
  //         ${User.types}
  //             type Query {
  //                 ${User.queries}
  //             } 
  //         `,
  //     resolvers: {
  //         Query: {
  //             ...User.resolvers.queries,
  //         },
  //     },
  // });
  // const graphqlServer = new ApolloServer({
  //     typeDefs: `
  //         type Query {
  //             sayHello: String
  //         }
  //     `,
  //     resolvers: {
  //         Query: {
  //             sayHello: () => 'Hello from Graphql Server'
  //         },
  //         // Muatation:{},
  //     },
  // });

  await graphqlServer.start();

  app.use('/graphql', expressMiddleware(graphqlServer, {
    context: async ({ req, res }) => {
      return {
        user: req.headers.authorization
          ? JWTService.decodeToken(
            req.headers.authorization.split('Bearer ')[1]
          )
          : undefined,
      };
    },
  }));

  return app;
}

