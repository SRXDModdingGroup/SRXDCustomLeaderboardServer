import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { trpc } from "../utils/trpc";

const Home: NextPage = () => {
    const session = useSession();
    const hello = trpc.useQuery(["example.hello", { text: "from tRPC" }]);

    return (
        <>
            <Head>
                <title>SRXDCustomLeaderboard</title>
                <meta name="description" content="SRXDCustomLeaderboard" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
                <h1 className="text-5xl font-extrabold leading-normal text-gray-700 md:text-[5rem]">
                    <span className="text-purple-300">SRXD</span>CustomLeaderboard
                </h1>
                <p className="text-2xl text-gray-700">{session.data?.user ? `Welcome, ${session.data.user.name}` : "You're not logged in"}</p>
                <div className="mt-3 grid gap-3 pt-3 text-center md:grid-cols-2 lg:w-2/3">
                    {
                        session.data?.user &&
                        <TechnologyCard
                            name="Account"
                            description="Click here to get started! Manage your game authentication tokens here."
                            documentation="/account"
                        />
                    }
                    <TechnologyCard
                        name={session.data?.user ? "Log Out" : "Log In"}
                        description="Authentication"
                        documentation={`/api/auth/${session.data?.user ? "signout" : "signin"}`}
                    />
                </div>
                {/* <div className="flex w-full items-center justify-center pt-6 text-2xl text-blue-500">
                    {hello.data ? <p>{hello.data.greeting}</p> : <p>Loading..</p>}
                </div> */}
            </main>
        </>
    );
};

export default Home;

type TechnologyCardProps = {
  name: string;
  description: string;
  documentation: string;
};

const TechnologyCard = ({
    name,
    description,
    documentation,
}: TechnologyCardProps) => {
    return (
        <section className="flex flex-col justify-center rounded border-2 border-gray-500 p-6 shadow-xl duration-500 motion-safe:hover:scale-105">
            <h2 className="text-lg text-gray-700">{name}</h2>
            <p className="text-sm text-gray-600">{description}</p>
            <Link href={documentation}>
                <a
                    className="m-auto mt-3 w-fit text-sm text-violet-500 underline decoration-dotted underline-offset-2"
                >
                    Click Here!
                </a>
            </Link>
        </section>
    );
};
