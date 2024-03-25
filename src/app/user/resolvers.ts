
import axios from "axios";
import JWTService from "../../services/jwt";
import { PrismaClient } from "@prisma/client";
import { User } from "@prisma/client";
import { prismaClient } from "../../clients/db";
import { GraphqlContext } from "../../interfaces";
import UserService from "../../services/user";

const queries = {
    verifyGoogleToken: async (parent: any, { token }: { token: string }) => {
       const resulToken = await UserService.verifyGoogleAuthToken(token)
       return resulToken
    }

    , getCurrentUser: async (parent: any, args: any, ctx: GraphqlContext) => {
        console.log("ctx", ctx)
        const id = ctx?.user?.id
        if (!id) return null

        const user = await UserService.getUserById(id)
        return user
    },
    getUserById: async (
        parent: any,
        { id }: { id: string },
        ctx: GraphqlContext
      ) => UserService.getUserById(id)
}

const extraResolvers = {
    User: {
        tweets: (parent: User) => prismaClient.tweet.findMany({ where: { author: { id: parent.id } } })
        // author: (parent: Tweet) => UserService.getUserById(parent.authorId),
    },
};

export const resolvers = { queries, extraResolvers };

