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
    .query('getSessions', {
        async resolve({ctx}) {
            return await prisma.session.findMany({
                where: {
                    userId: ctx.user.id
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
            if (!client_token_exists) {
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
                expires.setFullYear(expires.getFullYear() + 1)
                
                return await prisma.session.create({
                    data: {
                        userId: ctx.user.id,
                        sessionToken,
                        expires
                    }
                })
            }
            return client_token_exists;
        }
    });
