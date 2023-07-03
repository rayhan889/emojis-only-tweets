import { SignInButton, useUser } from "@clerk/nextjs";
import type { NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import { LoadingPage } from "~/components/loading";
import { useState } from "react";

dayjs.extend(relativeTime);

type PostWithAuthor = RouterOutputs["post"]["getAllPosts"][number];
const PostView = (props: PostWithAuthor) => {
  const { post, author } = props;

  return (
    <div
      key={post.id}
      className="flex gap-3 border-b border-slate-400 px-4 py-8"
    >
      <Image
        src={author?.profileImageUrl}
        alt={author?.username}
        className="rounded-full"
        width={56}
        height={56}
      />
      <div className="flex flex-col">
        <div className="flex gap-1 font-thin text-slate-400">
          <span className="font-semibold text-slate-50">{`@${author?.username}`}</span>{" "}
          . <span>{dayjs(post?.createdAt).fromNow()}</span>
        </div>
        <span>{post?.content}</span>
      </div>
    </div>
  );
};

const CreatePostWizard = () => {
  const { user } = useUser();

  const [input, setInput] = useState<string>("");

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.post.createPost.useMutation({
    onSuccess: () => {
      setInput(""), void ctx.post.getAllPosts.invalidate();
    },
  });

  return (
    <div className="flex w-full gap-4">
      <Image
        src={user?.profileImageUrl as string}
        alt={user?.username as string}
        className="rounded-full"
        width={56}
        height={56}
      />
      <input
        type="text"
        placeholder="Type emojis here..."
        className="grow bg-transparent outline-none"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isPosting}
      />
      <button onClick={() => mutate({ content: input })}>Post</button>
    </div>
  );
};

const Feed = () => {
  const { data, isLoading: isDataLoading } = api.post.getAllPosts.useQuery();

  if (isDataLoading) return <LoadingPage />;

  if (!data) return <div>No data to display...</div>;

  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  const { isLoaded: isUserLoaded, isSignedIn } = useUser();

  // start fetch posts data
  api.post.getAllPosts.useQuery();

  if (!isUserLoaded) return <div />;

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">
        <div className="h-full w-full border-x border-slate-400 md:max-w-2xl">
          <div className="flex border-b border-slate-400 p-4">
            {!isSignedIn && (
              <div className="flex justify-center">
                <SignInButton />
              </div>
            )}
            {!!isSignedIn && <CreatePostWizard />}
          </div>
          <Feed />
        </div>
      </main>
    </>
  );
};

export default Home;
