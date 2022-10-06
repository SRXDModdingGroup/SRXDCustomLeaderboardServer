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

    
    return (
        <>
            <button onClick={() => new_session.mutate()}>New Session Token</button>
            { t.data?.map(e => (
                <div key={e.id}>
                    <span>Token: &quot;{e.sessionToken}&quot;</span>
                </div>
            ))}
            Put this token into the LeaderboardsServerAuthCookie field in &quot;Spin Rhythm/BepInEx/config/SRXDCustomLeaderboard.cfg&quot; to login on your game client.
        </>
    )
}
export default Account;