
import axios from "axios";
// import { prismaClient } from "../../clients/db";
import JWTService from "../../services/jwt";
import { PrismaClient } from "@prisma/client";
// import { GraphqlContext } from "../../intefaces";
import { User } from "@prisma/client";
import { prismaClient } from "../../clients/db";
import { GraphqlContext } from "../../interfaces";
// import UserService from "../../services/user";
// import { redisClient } from "../../clients/redis";

interface GoogleTokenResult {
    iss?: string;
    nbf?: string;
    aud?: string;
    sub?: string;
    email: string;
    email_verified: string;
    azp?: string;
    name?: string;
    picture?: string;
    given_name: string;
    family_name?: string;
    iat?: string;
    exp?: string;
    jti?: string;
    alg?: string;
    kid?: string;
    typ?: string;
}

const queries = {
    verifyGoogleToken: async (parent: any, { token }: { token: string }) => {
        const googleToken = token;
        const googleOauthURL = new URL("https://oauth2.googleapis.com/tokeninfo");
        googleOauthURL.searchParams.set("id_token", googleToken);

        //     const { data} = await axios.get<GoogleTokenResult> (
        //         googleOauthURL.toString(),
        //     {
        //     responseType: "json",
        //     });

        //     const user = await prismaClient.user.findUnique({
        //     where: {email: data.email},
        //     });

        //     if (!user) {
        //         await prismaClient.user.create({
        //         data: {
        //         email: data.email,
        //         firstName: data.given_name,
        //         lastName: data.family_name,
        //         profileInageURL: data.picture,
        //         },
        //     });
        // }

        const { data } = await axios.get<GoogleTokenResult>(
            googleOauthURL.toString(),
            {
                responseType: "json",
            }
        );

        const user = await prismaClient.user.findUnique({
            where: { email: data.email },
        });

        if (!user) {
            await prismaClient.user.create({
                data: {
                    email: data.email,
                    firstName: data.given_name,
                    lastName: data.family_name,
                    profileImageURL: data.picture,
                },
            });
        }


        const userInDb = await prismaClient.user.findUnique({
            where: { email: data.email },
        });

        if (!userInDb) throw new Error("User with email not found");

        const userToken = JWTService.generateTokenForUser(userInDb);

        return userToken;
    }

    , getCurrentUser: async (parent: any, args: any, ctx: GraphqlContext) => {
        console.log("ctx", ctx)
        const id = ctx?.user?.id
        if (!id) return null

        const user = await prismaClient.user.findUnique({ where: { id } })
        return user
        // return ctx.user
    }
}

const extraResolvers = {
    User: {
        tweets: (parent: User) => prismaClient.tweet.findMany({ where: { author: { id: parent.id } } })
        // author: (parent: Tweet) => UserService.getUserById(parent.authorId),
    },
};

export const resolvers = { queries, extraResolvers };

// const queries = {
//     verifyGoogleToken: async (parent: any, { token }: { token: string }) => {
//         return token;
//     },
// };