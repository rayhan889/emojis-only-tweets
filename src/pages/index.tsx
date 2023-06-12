import { SignInButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";

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
      />
    </div>
  );
};

const Home: NextPage = () => {
  const { data, isLoading } = api.post.getAllPosts.useQuery();

  const user = useUser();

  if (isLoading) return <div>Loading...</div>;

  if (!data) return <div>No data to display...</div>;

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
            {!user.isSignedIn && (
              <div className="flex justify-center">
                <SignInButton />
              </div>
            )}
            {!!user.isSignedIn && <CreatePostWizard />}
          </div>
          <div className="flex flex-col">
            {[...data, ...data]?.map((fullPost) => (
              <PostView {...fullPost} key={fullPost.post.id} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
