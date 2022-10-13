import { getLatestModRelease } from "modules/github";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useQuery } from "react-query";

const Home: NextPage = () => {
    const session = useSession();
    const latest_release = useQuery("releases", getLatestModRelease);

    return (
        <>
            <Head>
                <title>SRXDCustomLeaderboard</title>
                <meta name="description" content="SRXDCustomLeaderboard" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            {
                false && (
                    <div className="card fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-[#1C1B22]">
                        <h2>
                            hi
                        </h2>
                    </div>
                )
            }
            <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4 pt-16">
                <h1 className="text-5xl font-extrabold mb-6 md:text-[5rem] wrap">
                    Private <span className="text-primary">Leaderboard</span> for SRXD
                </h1>
                <p className="text-2xl">{session.data?.user ? `Welcome, ${session.data.user.name}` : "Login to get started!"}</p>
                <div className="mt-3 grid gap-3 pt-3 text-center md:grid-cols-2 lg:w-2/3">
                    {
                        session.data?.user ?
                            <CardLink
                                name="Account / Get Started"
                                description="Click here to get started! Manage your game authentication tokens here."
                                documentation="/account"
                            /> :
                            <CardLink
                                name="Login / Sign Up"
                                description="Login / sign up to get started!"
                                documentation={`/api/auth/signin`}
                            />
                    }
                    <CardLink
                        name="Download Mod"
                        description={`Download the custom leaderboard client mod for SRXD ${latest_release.data?.tag_name &&`(version ${latest_release.data?.tag_name})`}.`}
                        documentation="https://github.com/SRXDModdingGroup/SRXDCustomLeaderboard/releases/latest/download/SRXDCustomLeaderboard.dll"
                    />
                </div>
            </main>
        </>
    );
};

export default Home;

type CardLinkProps = {
  name: string;
  description: string;
  documentation: string;
};

const CardLink = ({
    name,
    description,
    documentation,
}: CardLinkProps) => {
    return (
        <section className="card duration-500 motion-safe:hover:scale-105">
            <h2 className="text-lg">{name}</h2>
            <p className="text-sm">{description}</p>
            <Link href={documentation}>
                <a
                    className="m-auto mt-3 w-fit text-sm text-primary underline decoration-dotted underline-offset-2"
                >
                    Click Here!
                </a>
            </Link>
        </section>
    );
};
