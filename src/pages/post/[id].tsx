import { SignInButton, useUser } from "@clerk/nextjs";
import type { NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";

const PostViewPage: NextPage = () => {
  const { isLoaded: isUserLoaded, isSignedIn } = useUser();

  // start fetch posts data
  api.post.getAllPosts.useQuery();

  return (
    <>
      <Head>
        <title>Post</title>
      </Head>
      <main className="flex h-screen justify-center">
        <div className="h-full w-full border-x border-slate-400 md:max-w-2xl">
          <div className="flex justify-center">Post View</div>
        </div>
      </main>
    </>
  );
};

export default PostViewPage;
