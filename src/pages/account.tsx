import { NextPage } from "next";
import { trpc } from "utils/trpc";

const Account: NextPage = () => {
    const new_session = trpc.useMutation(["auth.newSession"]);
    if (new_session.status = "success") {
        console.log(new_session)
    }

    const t = trpc.useQuery(["auth.getSessions"]);
    return <button onClick={() => new_session.mutate()}>New Session Token</button>
}
export default Account;