"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

import { buttonVariants } from "@/components/ui/button";

export default function LoginPage() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function login() {

        const { data, error } =
            await supabase.auth.signInWithPassword({

                email,
                password

            });

        if (error) {

            alert(error.message);
            return;

        }

        console.log(data);
    }

    return (

        <div>

            <input
                placeholder="Email"
                onChange={(e)=>setEmail(e.target.value)}
            />

            <input
                type="password"
                placeholder="Password"
                onChange={(e)=>setPassword(e.target.value)}
            />

            <button onClick={login} className={buttonVariants({ variant: "default" })}>
                Login
            </button>

        </div>

    );

}