import Hero from "@/components/hero";
import ConnectSupabaseSteps from "@/components/tutorial/connect-supabase-steps";
import SignUpUserSteps from "@/components/tutorial/sign-up-user-steps";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default async function Index() {
  return (
    <>
      <main className="flex-1 flex flex-col gap-6 px-4">
        <section className="flex flex-col p-32 items-center">
          <h2 className="font-serif text-6xl mb-4 font-black">Online Jam</h2>
        </section>
        <section className="flex flex-col p-32 items-center">
          <Button className="w-1/2">Sign Up</Button>
          <Input />
        </section>
      </main>
    </>
  );
}
