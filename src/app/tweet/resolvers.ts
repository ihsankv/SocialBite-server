// import { Tweet } from "@prisma/client";
// import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// import { prismaClient } from "../../clients/db";
// import UserService from "../../services/user";
// import TweetService, { CreateTweetPayload } from "../../services/tweet";

import { Tweet } from "@prisma/client";
import { prismaClient } from "../../clients/db";
import { GraphqlContext } from "../../interfaces";

// const s3Client = new S3Client({
//   region: process.env.AWS_DEFAULT_REGION,
// });

const queries = {
  getAllTweets: () => prismaClient.tweet.findMany({ orderBy: { createdAt: "desc" } })
  // //   getSignedURLForTweet: async (
  // //     parent: any,
  // //     { imageType, imageName }: { imageType: string; imageName: string },
  // //     ctx: GraphqlContext
  // //   ) => {
  // //     if (!ctx.user || !ctx.user.id) throw new Error("Unauthenticated");
  // //     const allowedImageTypes = [
  // //       "image/jpg",
  // //       "image/jpeg",
  // //       "image/png",
  // //       "image/webp",
  // //     ];

  // //     if (!allowedImageTypes.includes(imageType))
  // //       throw new Error("Unsupported Image Type");

  // //     const putObjectCommand = new PutObjectCommand({
  // //       Bucket: process.env.AWS_S3_BUCKET,
  // //       ContentType: imageType,
  // //       Key: `uploads/${ctx.user.id}/tweets/${imageName}-${Date.now()}`,
  // //     });

  // //     const signedURL = await getSignedUrl(s3Client, putObjectCommand);

  // //     return signedURL;
  // //   },
};

export interface CreateTweetPayload {
  content: string;
  imageURL?: string;
  // userId: string;
}

const mutations = {
  createTweet: async (
    parent: any,
    { payload }: { payload: CreateTweetPayload },
    ctx: GraphqlContext
  ) => {
    if (!ctx.user) throw new Error("You are not authenticated");
    const tweet = await prismaClient.tweet.create({
      data: {
        content: payload.content,
        imageURL: payload.imageURL,
        author: { connect: { id: ctx.user.id } },
      },
    })
    // const tweet = await TweetService.createTweet({
    //   ...payload,
    //   userId: ctx.user.id,
    // });

    return tweet;
  },
};

const extraResolvers = {
  Tweet: {
    author: (parent: Tweet) => prismaClient.user.findUnique({ where: { id: parent.authorId } })
    // author: (parent: Tweet) => UserService.getUserById(parent.authorId),
  },
};

// export const resolvers = { mutations, extraResolvers };
export const resolvers = { mutations, extraResolvers, queries };
