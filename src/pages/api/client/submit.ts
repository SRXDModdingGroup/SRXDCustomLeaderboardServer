// Example of a restricted endpoint that only authenticated users can access from https://next-auth.js.org/getting-started/example

import { NextApiRequest, NextApiResponse } from "next";
import { getServerAuthSession } from "server/common/get-server-auth-session";

const submit = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getServerAuthSession({ req, res });

    if (session) {
        res.send({
            content:
        "This is protected content. You can access this content because you are signed in.",
        });
    } else {
        res.send({
            error:
        "You must be signed in to view the protected content on this page.",
        });
    }
};


export interface ILeaderboardSubmission {
    key: string;
    metaData: number[];
    submitType: SubmitType;
    submittedAtTime: number;
    allowLeaderboardCreation: boolean;
}


export class LeaderboardSubmission implements ILeaderboardSubmission {
    constructor(leaderboardSubmission: ILeaderboardSubmission) {
        Object.assign(this, leaderboardSubmission)
    }

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
}

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

export default submit;