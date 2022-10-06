// Example of a restricted endpoint that only authenticated users can access from https://next-auth.js.org/getting-started/example

import { NextApiRequest, NextApiResponse } from "next";
import { getServerAuthSession } from "server/common/get-server-auth-session";
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
    const session = await getServerAuthSession({ req, res });
    if (!session?.user) return res.status(401).send("UNAUTHORIZED");
    

    const input = InputValidator.parse(req.body);
    const leaderboardSubmission = LeaderboardSubmission.from(input);
    if (!leaderboardSubmission.allowLeaderboardCreation) return res.send("Leaderboard not created.");

    const leaderboard = await prisma.leaderboard.upsert({
        where: {
            key: leaderboardSubmission.key
        },
        update: {},
        create: {
            key: leaderboardSubmission.key
        }
    });
    
    let leaderboardEntry = await prisma.leaderboardEntry.findFirst({
        where: {
            userId: session.user.id,
            leaderboardKey: leaderboard.key 
        }
    })
    if (leaderboardEntry && leaderboardSubmission.submitType === SubmitType.KeepBest && leaderboardEntry.score >= leaderboardSubmission.score) return res.send(leaderboardEntry);
    leaderboardEntry = await prisma.leaderboardEntry.upsert({
        where: {
            id: leaderboardEntry?.id ?? "-1"
        },
        create: {
            score: leaderboardEntry?.score ?? leaderboardSubmission.score,
            metaData: leaderboardEntry?.score ?? leaderboardSubmission.metaData,
            leaderboardKey: leaderboard.key,
            userId: session.user.id
        },
        update: {
            score: leaderboardSubmission.score,
            metaData: leaderboardSubmission.metaData,
        }
    })
    return res.send(leaderboardEntry);       
};

export default submit;