import { TRPCError } from "@trpc/server";
import { generateKey } from "crypto";
import { z } from "zod";
import { prisma } from "server/db/client"
import { createRouter } from "server/router/context"

export const leaderboardRouter = createRouter()
    .query('search', {
        input: z.object({
            query: z.string().optional()
        }),
        async resolve({input}) {
            return await prisma.leaderboard.findMany({
                where: {
                    key: {
                        search: input.query
                    }
                }
            })
        },
    });
