import { NextApiRequest, NextApiResponse } from "next";
import { getServerAuthSession, getServerAuthSessionClient } from "server/common/get-server-auth-session";
import { z } from "zod";
import { prisma } from "server/db/client";

const zLeaderboardEntry = z.object({
    DisplayName: z.string(),
    Value: z.number(),
    DisplayValueOverride: z.optional(z.number()),
    Position: z.number(),
    IsCurrentPlayer: z.boolean(),
    PlayerId: z.string(),
    MetaData: z.array(z.number()),
    MetaDataCount: z.number()
})

export type ILeaderboardEntry = z.infer<typeof zLeaderboardEntry>;

const zLeaderboardResult = z.object({
    requestSize: z.number(),
    timeCreated: z.number(),
    key: z.string(),
    leaderboardEntries: z.array(zLeaderboardEntry),
    playerEntry: zLeaderboardEntry,
    playerEntryIndex: z.number(),
    totalLeaderboardEntries: z.number(),
    buildNumberToDisplayFor: z.number(),
    buildNumberOfDisplayedTracklist: z.number(),
    seed: z.number()
});

export type ILeaderboardResult = z.infer<typeof zLeaderboardResult>;

const get = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getServerAuthSessionClient({ req, res });

    const leaderboardResult = zLeaderboardResult.parse(req.body);

    const leaderboardSubmissions = await prisma.leaderboardSubmission.findMany({
        where: {
            leaderboardKey: leaderboardResult.key,
        },
        include: {
            leaderboard: true,
            user: true
        },
        orderBy: {
            score: "desc"
        },
        take: leaderboardResult.requestSize
    })

    leaderboardResult.leaderboardEntries = leaderboardSubmissions.map((e, i) => {
        return {
            DisplayName: e.user.name,
            Value: e.score,
            Position: i + 1,
            PlayerId: e.userId,
            IsCurrentPlayer: session?.user?.id === e.userId,
            MetaData: e.metaData,
            MetaDataCount: e.metaData.length,            
        } as ILeaderboardEntry;
    })

    leaderboardResult.totalLeaderboardEntries = leaderboardSubmissions.length;
    leaderboardResult

    return res.send(leaderboardResult);
}


export interface LeaderboardEntry {
    DisplayName: string;
    Value: number;
    DisplayValueOverride: number;
    Position: number;
    MetaData: number[];
    MetaDataCount: number;
}
export default get;