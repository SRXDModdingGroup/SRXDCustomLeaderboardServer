// Wrapper for unstable_getServerSession https://next-auth.js.org/configuration/nextjs

import type { GetServerSidePropsContext } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions as nextAuthOptions } from "../../pages/api/auth/[...nextauth]";

// Next API route example - /pages/api/restricted.ts
export const getServerAuthSession = async (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
    return await unstable_getServerSession(ctx.req, ctx.res, nextAuthOptions);
};

export const getServerAuthSessionClient: typeof getServerAuthSession = async (ctx) => {
    console.log(ctx.req.headers);
    const valid_auth_index = Object.keys(ctx.req.cookies).find(e => e.endsWith("next-auth.session-token"));
    const auth_key = valid_auth_index ? ctx.req.cookies[valid_auth_index] : ctx.res.getHeader("X-API-Key") as string | undefined;
    ctx.req.cookies["next-auth.session-token"] = auth_key;
    ctx.req.cookies["__Secure-next-auth.session-token"] = auth_key;
    return await getServerAuthSession(ctx);
}