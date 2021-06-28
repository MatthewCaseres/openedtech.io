import { useSession, signIn, signOut } from "next-auth/client";

export default function Login() {
  const [session, loading] = useSession();
  return (
    <>
      {!session && (
        <div>
          <button
            className="bg-indigo-300 hover:bg-indigo-500 dark:bg-indigo-800 dark:text-gray-300 text-gray-700 px-4 py-1 rounded-md"
            onClick={() => signIn()}
          >
            Sign in
          </button>
        </div>
      )}
      {session && (
        <>
          <button
            className="bg-indigo-300 hover:bg-indigo-500 dark:bg-indigo-800 dark:text-gray-300 text-gray-700 px-4 py-1 rounded-md"
            onClick={() => signOut()}
          >
            Sign out
          </button>
        </>
      )}
    </>
  );
}
