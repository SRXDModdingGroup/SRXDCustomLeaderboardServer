import { GetServerSideProps, NextPage } from "next";
import { getSession } from "next-auth/react";
import { trpc } from "utils/trpc";

const Account: NextPage = () => {

    const ctx = trpc.useContext();
    
    const t = trpc.useQuery(["auth.getClientSessions"]);
    
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

    return (
        <div className="mx-auto max-w-5xl px-3 sm:px-6 min-h-screen pt-20 space-y-6">
            <div className="flex flex-col w-full justify-center rounded border-2 border-gray-500 p-6 shadow-xl gap-3">
                <h2 className="text-lg">Account</h2>
            </div>
            <div className="flex flex-col justify-center rounded border-2 border-gray-500 p-6 shadow-xl gap-3">
                <h2 className="text-lg">Session Tokens</h2>
                <p className="text-sm">
                    <table className="table-fixed w-full text-center border-collapse border" cellPadding="5">
                        <thead>
                            <th className="w-1/2 sm:w-2/3">
                                Token
                            </th>
                            <th>
                                Expiry
                            </th>
                            <th>
                                CFG
                            </th>
                        </thead>
                        <tbody>
                            { t.data?.map(e => (
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
                    - Click &quot;Download CFG File&quot; and save the file to &quot;Spin Rhythm/BepInEx/config/SRXD.CustomLeaderboard.cfg&quot;
                    <div className="w-full text-center">OR</div>
                    - Put this token into the LeaderboardServerAuthCookie field in &quot;Spin Rhythm/BepInEx/config/SRXD.CustomLeaderboard.cfg&quot; to login on your game client after you have ran the game with the mod installed at least once.
                </p>
                <div className="flex justify-end">
                    <button onClick={() => new_session.mutate()} className="text-sm text-white bg-secondary rounded px-2 py-1 font-semibold uppercase">New Session Token</button>
                </div>                
            </div>
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    const session = await getSession(ctx)

    if (!session) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        }
    }

    return {
        props: { session }
    }
}
  
export default Account;