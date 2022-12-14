import { refreshSession } from "modules/auth";
import { getFormValues } from "modules/forms";
import { getLatestModRelease } from "modules/github";
import { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { FormEvent, useEffect } from "react";
import { useQuery } from "react-query";
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

    const latest_release = useQuery("releases", getLatestModRelease);


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
        <>
            <Head>
                Account
            </Head>
            <div className="mx-auto max-w-5xl px-3 sm:px-6 min-h-screen pt-20 space-y-6 pb-6">
                <form onSubmit={(e) => submitForm(e)} className="card gap-3">
                    <h2>Account</h2>
                    Name: <input className="rounded p-3 border-2 border-gray-500 focus:border-secondary outline-none transition-all" type="text" name="name" defaultValue={session.data?.user?.name ?? ''} />
                    <div className="flex justify-end">
                        <button className="action">Update User Info</button>
                    </div>
                </form>
                <div className="card gap-3">
                    <h2>Session Tokens</h2>
                    <table className="table-fixed w-full text-center border-collapse border" cellPadding="5">
                        <thead>
                            <tr className="border">
                                <th className="w-1/3 sm:w-2/3">
                                    Token
                                </th>
                                <th>
                                    Expiry
                                </th>
                                <th>
                                    Open in SRXD
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            { sessions.data?.length ? 
                                sessions.data?.map(e => (
                                    <tr key={e.id} className="border">
                                        <td><pre className="overflow-x-auto whitespace-nowrap">{e.sessionToken}</pre></td>
                                        <td>{e.expires.toLocaleDateString()}</td>
                                        <td><a className="underline" href={`steam://run/1058830//play undefined token ${e.sessionToken}`}>Load</a></td>
                                    </tr>
                                )) :
                                (
                                    <tr className="border">
                                        <td colSpan={3}>Not Yet Created</td>
                                    </tr>
                                )
                            }
                        </tbody>
                    </table>                    
                    <div className="flex justify-end">
                        <button onClick={() => new_session.mutate()} className="action">New Session Token</button>
                    </div>                
                </div>
                <div className="card gap-3">
                    <h2>How to Get Started</h2>
                    <pre className="whitespace-pre-wrap">
                        1. Find your &quot;Spin Rhythm&quot; game folder. (This is usually &quot;C:\Program Files(x86)\Steam\steamapps\common\Spin Rhythm\&quot;) <br />
                        2. <a className="underline" href="https://github.com/SRXDModdingGroup/SRXDCustomLeaderboard/releases/latest/download/SRXDCustomLeaderboard.dll">Download</a> the mod {latest_release.data?.tag_name &&`(version ${latest_release.data?.tag_name}`} and save it to &quot;Spin Rhythm/BepInEx/plugins&quot;<br />.
                        3. Click the &quot;New Session Token&quot; button above.<br />
                        4. Click &quot;Load&quot; button above under the &quot;Open in SRXD&quot; column.<br />
                        5. (If step 4 doesn&apos;t work) Run the game once with the mod installed and then put this token into the LeaderboardServerAuthCookie field in &quot;Spin Rhythm/BepInEx/config/SRXD.CustomLeaderboard.cfg&quot;.
                    </pre>
                </div>
            </div>
        </>
    )
}
  
export default Account;