import { FC } from "react";
import { Disclosure, Transition } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import Link from "next/link";
import { useSession } from "next-auth/react";
import ThemeSwitch from "./themeswitch";

const Header: FC = () => {
    const session = useSession();
    const sessioned_navigation = session.data?.user ? [
        { name: 'Account', href: '/account', current: false },
        { name: 'Logout', href: '/api/auth/signout', current: false }
    ] : [
        { name: 'Login', href: '/api/auth/signin', current: false },
    ];
    const navigation = [
        ...sessioned_navigation
    ]

    return (
        <Disclosure as="nav" className="fixed sm:scroll0:bg-primary top-0 left-0 right-0 transition-all z-50 shadow-lg dark:bg-[#1C1B22] bg-white">
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
                                                    className="px-3 py-2 rounded-md text-sm text-inherit hover:tracking-[0.2em] transition-all"
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
                                <Disclosure.Button
                                    key={item.name}
                                    as="a"
                                    href={item.href}
                                    className="block px-6 py-2 hover:text-primary transition-all"
                                    aria-current={item.current ? 'page' : undefined}
                                >
                                    {item.name}
                                </Disclosure.Button>
                            ))}
                            <Disclosure.Button>
                                <ThemeSwitch><div className="block px-6 py-2 w-full">Toggle Theme</div></ThemeSwitch>
                            </Disclosure.Button>
                        </div>
                    </Disclosure.Panel>
                </>
            )}
        </Disclosure>
    )
};

export default Header;