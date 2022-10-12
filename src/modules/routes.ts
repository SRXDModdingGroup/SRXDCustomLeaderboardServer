export const routes: Route[] = [
    {
        name: "Home",
        href: "/",
    },
    {
        name: "Account",
        href: "/account",
        contexts: ["auth"]
    },
    {
        name: "Logout",
        href: "/api/auth/signout",
        contexts: ["auth"]
    },
    {
        name: "Login",
        href: "/api/auth/signin",
        contexts: ["noauth"]
    }
]

export interface Route {
    name: string,
    href: string,
    current?: boolean,
    contexts?: ("auth" | "noauth")[]
}