// Example of a restricted endpoint that only authenticated users can access from https://next-auth.js.org/getting-started/example

import { NextApiRequest, NextApiResponse } from "next";
import { getServerAuthSession, getServerAuthSessionClient } from "server/common/get-server-auth-session";
import { z } from "zod";
import { prisma } from "server/db/client";

export enum SubmitType
{
    KeepBest,
    Replace
}

export enum MetadataAccessor {
    health,
    buildNumber,
    exeRevisionNumber,
    tracklistSize,
    _progress,
    _scoreHash,
    trackDataVersion,
    streak,
    fullComboState,
    tiebreakerScore
}

export const InputValidator = z.object({
    key: z.string(),
    metaData: z.array(z.number()),
    submitType: z.nativeEnum(SubmitType),
    submittedAtTime: z.number(),
    allowLeaderboardCreation: z.boolean()
})

export type ILeaderboardSubmission = z.infer<typeof InputValidator>

export class LeaderboardSubmission implements ILeaderboardSubmission {
    private get scoreHasher() {
        return Number(process.env.SUBMISSION_SCORE_HASH);
    }

    get score() {
        const x = this.metaData[MetadataAccessor._scoreHash]; 
        if (x) {
            return x ^ this.scoreHasher
        }
        return 0
    }

    set score(value) {
        this.metaData[MetadataAccessor._scoreHash] = value ^ this.scoreHasher;
    }

    key = "";
    metaData: number[] = [];
    submitType = SubmitType.KeepBest;
    submittedAtTime = 0;
    allowLeaderboardCreation = true;

    static from(submission: ILeaderboardSubmission) {
        const returnVal = new LeaderboardSubmission();
        Object.assign(returnVal, submission)
        return returnVal;
    }
}

const submit = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getServerAuthSessionClient({ req, res });
    if (!session?.user) return res.status(401).send("UNAUTHORIZED");
    

    const input = InputValidator.parse(req.body);
    const inputLeaderboardSubmission = LeaderboardSubmission.from(input);
    if (!inputLeaderboardSubmission.allowLeaderboardCreation) return res.send("Leaderboard not created.");

    const leaderboard = await prisma.leaderboard.upsert({
        where: {
            key: inputLeaderboardSubmission.key
        },
        update: {},
        create: {
            key: inputLeaderboardSubmission.key
        }
    });
    
    let leaderboardSubmission = await prisma.leaderboardSubmission.findFirst({
        where: {
            userId: session.user.id,
            leaderboardKey: leaderboard.key 
        }
    })
    if (leaderboardSubmission && inputLeaderboardSubmission.submitType === SubmitType.KeepBest && leaderboardSubmission.score >= inputLeaderboardSubmission.score) return res.send(leaderboardSubmission);
    leaderboardSubmission = await prisma.leaderboardSubmission.upsert({
        where: {
            id: leaderboardSubmission?.id ?? "-1"
        },
        create: {
            score: leaderboardSubmission?.score ?? inputLeaderboardSubmission.score,
            metaData: leaderboardSubmission?.score ?? inputLeaderboardSubmission.metaData,
            leaderboardKey: leaderboard.key,
            userId: session.user.id
        },
        update: {
            score: inputLeaderboardSubmission.score,
            metaData: inputLeaderboardSubmission.metaData,
        }
    })
    return res.send(leaderboardSubmission);       
};

export default submit;