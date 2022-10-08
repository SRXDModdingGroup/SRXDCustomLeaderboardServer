import { refreshSession } from "modules/auth";
import { getFormValues } from "modules/forms";
import { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { FormEvent, useEffect } from "react";
import { trpc } from "utils/trpc";

const Account: NextPage = () => {
    const session = useSession();
    const router = useRouter();
    const ctx = trpc.useContext();
    
    useEffect(() => {
        if (session.status === "unauthenticated") {
            router.push("/api/auth/signin");
        }
    }, [router,session])

    const update_user = trpc.useMutation(["auth.updateUser"], {
        onSuccess() {
            refreshSession();
        },
    });

    const sessions = trpc.useQuery(["auth.getClientSessions"]);
    const new_session = trpc.useMutation(["auth.newSession"], {
        onMutate: () => {
            ctx.cancelQuery(["auth.getClientSessions"]);
        
            const optimisticUpdate = ctx.getQueryData(["auth.getClientSessions"]);
            if (optimisticUpdate) {
                ctx.setQueryData(["auth.getClientSessions"], optimisticUpdate);
            }
        },
        onSettled: () => {
            ctx.invalidateQueries(["auth.getClientSessions"]);
        },
    });

    const downloadCfgUri = (token: string) => {
        const output_string = `[General]\nLeaderboardServerAuthCookie = ${token}`

        const blob = new Blob([output_string], {
            type: 'text/plain'
        });
        return window.URL.createObjectURL(blob);
    }
    
    const submitForm = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        update_user.mutate(getFormValues(e));
    };

    return (
        <div className="mx-auto max-w-5xl px-3 sm:px-6 min-h-screen pt-20 space-y-6">
            <form onSubmit={(e) => submitForm(e)} className="flex flex-col w-full justify-center rounded border-2 border-gray-500 p-6 shadow-xl gap-3">
                <h2 className="text-lg">Account</h2>
                Name: <input className="rounded p-3" type="text" name="name" defaultValue={session.data?.user?.name ?? ''} />
                <div className="flex justify-end">
                    <button className="text-sm text-white bg-secondary rounded px-2 py-1 font-semibold uppercase">Update User Info</button>
                </div>
            </form>
            <div className="flex flex-col justify-center rounded border-2 border-gray-500 p-6 shadow-xl gap-3">
                <h2 className="text-lg">Session Tokens</h2>
                <div className="text-sm">
                    <table className="table-fixed w-full text-center border-collapse border" cellPadding="5">
                        <thead>
                            <tr>
                                <th className="w-1/2 sm:w-2/3">
                                    Token
                                </th>
                                <th>
                                    Expiry
                                </th>
                                <th>
                                    CFG
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            { sessions.data?.map(e => (
                                <tr key={e.id} className="border">
                                    <td><pre className="overflow-x-scroll whitespace-nowrap">{e.sessionToken}</pre></td>
                                    <td>{e.expires.toLocaleDateString()}</td>
                                    <td><a className="underline" href={downloadCfgUri(e.sessionToken)} download="SRXD.CustomLeaderboard.cfg">Download</a></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <br />
                    Either: <br />
                    - Click &quot;Download CFG File&quot; and save the file to &quot;Spin Rhythm/BepInEx/config/SRXD.CustomLeaderboard.cfg&quot;.
                    <div className="w-full text-center">OR</div>
                    - Put this token into the LeaderboardServerAuthCookie field in &quot;Spin Rhythm/BepInEx/config/SRXD.CustomLeaderboard.cfg&quot; to login on your game client after you have ran the game with the mod installed at least once.
                </div>
                <div className="flex justify-end">
                    <button onClick={() => new_session.mutate()} className="text-sm text-white bg-secondary rounded px-2 py-1 font-semibold uppercase">New Session Token</button>
                </div>                
            </div>
        </div>
    )
}
  
export default Account;