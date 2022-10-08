import { FormEvent } from "react";

export const getFormValues = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const vals = Object.assign(
        {}, 
        ...Object.values(e.target)
            .filter(e => e.name)
            .map(e => ({ [e.name]: e.value }))
    );
    return vals;
};