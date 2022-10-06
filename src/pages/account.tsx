import { NextPage } from "next";
import { trpc } from "utils/trpc";

const Account: NextPage = () => {
    const new_session = trpc.useMutation(["auth.newSession"]);
    if (new_session.status = "success") {
        console.log(new_session)
    }

    const t = trpc.useQuery(["auth.getClientSessions"]);
    return (
        <>
            <button onClick={() => new_session.mutate()}>New Session Token</button>
            { t.data?.map(e => (
                <div key={e.id}>
                    <span>Token: &quot;{e.sessionToken}&quot;</span>
                </div>
            ))}
        </>
    )
}
export default Account;