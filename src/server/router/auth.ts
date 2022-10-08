import { TRPCError } from "@trpc/server";
import { generateKey } from "crypto";
import { z } from "zod";
import { prisma } from "../db/client"
import { createRouter } from "./context"

export const authRouter = createRouter()
    .middleware(async ({ ctx, next }) => {
        if (!ctx.session?.user) {
            throw new TRPCError({ code: "UNAUTHORIZED" });
        }
        return next({ctx: {...ctx, user: ctx.session.user}})
    })
    .mutation("updateUser", {
        input: z.object({
            name: z.string().optional().nullable()
        }),
        async resolve({ctx, input}) {
            return await prisma.user.update({
                where: {
                    id: ctx.user.id
                },
                data: {
                    ...input
                } as any
            });
        }
    })
    .query('getClientSessions', {
        async resolve({ctx}) {
            return await prisma.session.findMany({
                where: {
                    userId: ctx.user.id,
                    sessionToken: {
                        startsWith: "CLIENT-"
                    }
                }
            })
        },
    })
    .mutation('newSession', {
        async resolve({ctx}) {
            const client_token_exists = await prisma.session.findFirst({
                where: {
                    userId: ctx.user.id,
                    sessionToken: {
                        startsWith: "CLIENT-"
                    }
                }
            })

            const key: string = await new Promise((resolve, reject) => {
                generateKey("aes", { length: 128 }, (err, data) => {
                    if (err) {
                        return reject(err)
                    }
                    return resolve(data.export().toString("hex"))
                });
            });
            const sessionToken = "CLIENT-"+key;
            const expires = new Date();

            if (!client_token_exists) {
               
                expires.setFullYear(expires.getFullYear() + 1)
                
                return await prisma.session.create({
                    data: {
                        userId: ctx.user.id,
                        sessionToken,
                        expires
                    }
                })
            }

            return prisma.session.update({
                where: {
                    id: client_token_exists.id
                },
                data: {
                    sessionToken,
                    expires
                }
            });
        }
    });
