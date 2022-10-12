import { FC } from "react";
import { Disclosure, Transition } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import Link from "next/link";
import { useSession } from "next-auth/react";
import ThemeSwitch from "./ThemeSwitch";
import { Route, routes } from "modules/routes";
import { useRouter } from "next/router";
import Head from "next/head";

const Header: FC = () => {
    const session = useSession();
    const logged_in = Boolean(session.data?.user);

    const router = useRouter();
    let current_route = undefined as Route | undefined;
    const navigation = routes.filter(e => { 
        e.current = e.href == router.asPath;
        if (e.current) current_route = e;
        if (!e.contexts?.length) return true;
        if (logged_in && e.contexts?.includes("auth")) return true;
        if (!logged_in && e.contexts?.includes("noauth")) return true;
    });

    const title = (current_route ? current_route.name + " | " : "") + "SRXDCustomLeaderboard";

    return (
        <>
            <Head>
                <title>{title}</title>
                <meta property="og:title" content={title} />
                <meta property="og:type" content="website" />
            </Head>
            <Disclosure as="nav" className="fixed top-0 left-0 right-0 transition-all z-50 shadow-lg scroll0:shadow-none dark:bg-[#1C1B22] bg-white">
                {({open}) => (
                    <>
                        <div className={`mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 sm:border-b-0 border-b-[1px] border-white/30`}>
                            <div className="relative flex h-14 items-center justify-between">
                                <div className="absolute inset-y-0 right-0 flex items-center sm:hidden">
                                    {/* Mobile menu button*/}
                                    <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2">
                                        <span className="sr-only">Open main menu</span>
                                        {open ? (
                                            <XMarkIcon className="block h-6 w-6 text-primary" aria-hidden="true" />
                                        ) : (
                                            <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                                        )}
                                    </Disclosure.Button>
                                </div>
                                <div className="flex flex-1 items-center sm:items-stretch justify-between">
                                    <div className="flex flex-shrink-0 px-3 text-lg items-center sm:hover:text-secondary transition-all">
                                        <Link href="/">
                                            <a><span className="text-primary">SRXD</span>CustomLeaderboard</a>
                                        </Link>
                                    </div>
                                    <div className="hidden sm:ml-6 sm:block">
                                        <div className="flex space-x-4">
                                            
                                            {navigation.map((item) => (
                                                <Link
                                                    key={item.name}
                                                    href={item.href}
                                                >
                                                    <a 
                                                        className={`px-3 py-2 rounded-md text-sm hover:tracking-[0.2em] ${item.current && "text-primary"} transition-all`}
                                                        aria-current={item.current ? 'page' : undefined}
                                                    >
                                                        {item.name}
                                                    </a>
                                                </Link>
                                            ))}
                                            <ThemeSwitch />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Disclosure.Panel className={`sm:hidden ${!open ? "max-h-0" : "max-h-96"} overflow-hidden transition-all`} static>
                            <div className="space-y-1 pt-2 pb-3">
                                {navigation.map((item) => (
                                    <Link key={item.name} href={item.href} passHref>
                                        <Disclosure.Button
                                            as="a"
                                            className="block px-6 py-2 hover:text-primary transition-all cursor-pointer"
                                            aria-current={item.current ? 'page' : undefined}
                                        >
                                            {item.name}
                                        </Disclosure.Button>
                                    </Link>
                                ))}
                                <ThemeSwitch><div className="block px-6 py-2 w-full">Toggle Theme</div></ThemeSwitch>
                            </div>
                        </Disclosure.Panel>
                    </>
                )}
            </Disclosure>
        </>
    )
};

export default Header;