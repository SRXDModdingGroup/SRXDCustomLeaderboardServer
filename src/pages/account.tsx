import { NextPage } from "next";
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
    if (new_session.status = "success") {
        console.log(new_session)
        t.refetch()
    }

    const downloadCfgUri = (token: string) => {
        const output_string = `[General]\nLeaderboardServerAuthCookie = ${token}`

        const blob = new Blob([output_string], {
            type: 'text/plain'
        });
        return window.URL.createObjectURL(blob);
    }

    
    return (
        <>
            <button onClick={() => new_session.mutate()}>New Session Token</button>
            <br /><br />
            { t.data?.map(e => (
                <div key={e.id}>
                    <span>Token: &quot;{e.sessionToken}&quot;</span>
                    <br />
                    <a href={downloadCfgUri(e.sessionToken)} download="SRXD.CustomLeaderboard.cfg">Download CFG File</a>
                    <br /><br />
                </div>
            ))}
            
            Either <br />
            Click &quot;Download CFG File&quot; and save the file to &quot;Spin Rhythm/BepInEx/config/SRXD.CustomLeaderboard.cfg&quot;<br />
            OR<br />
            Put this token into the LeaderboardsServerAuthCookie field in &quot;Spin Rhythm/BepInEx/config/SRXD.CustomLeaderboard.cfg&quot; to login on your game client after you have ran the game with the mod installed at least once.

        </>
    )
}
export default Account;