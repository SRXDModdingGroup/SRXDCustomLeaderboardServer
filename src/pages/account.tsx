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
            <form onSubmit={(e) => submitForm(e)} className="card gap-3">
                <h2>Account</h2>
                Name: <input className="rounded p-3" type="text" name="name" defaultValue={session.data?.user?.name ?? ''} />
                <div className="flex justify-end">
                    <button className="text-sm text-white bg-secondary rounded px-2 py-1 font-semibold uppercase">Update User Info</button>
                </div>
            </form>
            <div className="card gap-3">
                <h2>Session Tokens</h2>
                <table className="table-fixed w-full text-center border-collapse border" cellPadding="5">
                    <thead>
                        <tr className="border">
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
                <div className="flex justify-end">
                    <button onClick={() => new_session.mutate()} className="text-sm text-white bg-secondary rounded px-2 py-1 font-semibold uppercase">New Session Token</button>
                </div>                
            </div>
            <div className="card gap-3">
                <h2>How to Get Started</h2>
                <pre className="whitespace-pre-wrap">
                    1. Find your &quot;Spin Rhythm&quot; game folder. (This is usually &quot;C:\Program Files(x86)\Steam\steamapps\common\Spin Rhythm\&quot;) <br />
                    2. <a className="underline" href="https://github.com/SRXDModdingGroup/SRXDCustomLeaderboard/releases/latest/download/SRXDCustomLeaderboard.dll">Download</a> the mod and save it to &quot;Spin Rhythm/BepInEx/plugins&quot;<br />
                    3. Click the &quot;New Session Token&quot; button above.<br />
                    4. Click &quot;Download&quot; button above under the CFG table and save the file to &quot;Spin Rhythm/BepInEx/config/SRXD.CustomLeaderboard.cfg&quot;.<br />
                    5. (If step 4 doesn&apos;t work) Run the game once with the mod installed and then put this token into the LeaderboardServerAuthCookie field in &quot;Spin Rhythm/BepInEx/config/SRXD.CustomLeaderboard.cfg&quot;.
                </pre>
            </div>
        </div>
    )
}
  
export default Account;