import type { MetaFunction } from "@remix-run/cloudflare";
import { useState } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  const [userId, setUserId] = useState<string | null>(null);

  const handleLogin = async () => {
    console.log("login");
    /*
    const response = await signIn.oauth2({
      providerId: "amazon-sp-api",
      callbackURL: "/",
    });
    console.log(response);*/
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <button onClick={handleLogin} className="px-4 py-2 bg-blue-500 text-white rounded">ログイン</button>

      {userId && <p>ログイン中: {userId}</p>}

    </div>
  );
}