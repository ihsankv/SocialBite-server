import { prismaClient } from "../clients/db";

export interface CreateTweetPayload {
    content: string;
    imageURL?: string;
    userId: string;
}

class TweetService {
    public static async createTweet(data: CreateTweetPayload) {
        return prismaClient.tweet.create({
            data: {
                content: data.content,
                imageURL: data.imageURL,
                author: { connect: { id: data.userId } },
            },
        });
    }
    public static getALLTweets() {
        return prismaClient.tweet.findMany({ orderBy: { createdAt: "desc" } })

    }
}
export default TweetService