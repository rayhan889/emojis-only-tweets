import { SignInButton, useUser } from "@clerk/nextjs";
import type { NextPage } from "next";
import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import LoadingSpinner, { LoadingPage } from "~/components/loading";
import { useState } from "react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { PageLayout } from "./layout";

dayjs.extend(relativeTime);

type PostWithAuthor = RouterOutputs["post"]["getAllPosts"][number];
const PostView = (props: PostWithAuthor) => {
  const { post, author } = props;

  return (
    <Link href={`/post/${post?.id}`}>
      <div
        key={post.id}
        className="flex cursor-pointer gap-3 border-b border-slate-400 px-4 py-8"
      >
        <Link href={`/@${author?.username}`}>
          <Image
            src={author?.profileImageUrl}
            alt={author?.username}
            className="rounded-full"
            width={56}
            height={56}
          />
        </Link>
        <div className="flex flex-col">
          <div className="flex gap-1 font-thin text-slate-400">
            <Link href={`/@${author?.username}`}>
              <span className="font-semibold text-slate-50">{`@${author?.username}`}</span>
            </Link>{" "}
            . <span>{dayjs(post?.createdAt).fromNow()}</span>
          </div>
          <span>{post?.content}</span>
        </div>
      </div>
    </Link>
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
    onError: (e) => {
      const errorMsg = e?.data?.zodError?.fieldErrors.content;
      if (errorMsg && errorMsg[0]) {
        toast.error(errorMsg[0]);
      } else {
        toast.error("Error while create post!");
      }
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
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (input !== "") {
              mutate({ content: input });
            }
          }
        }}
        disabled={isPosting}
      />
      {!isPosting && input !== "" && (
        <button onClick={() => mutate({ content: input })}>Post</button>
      )}
      {isPosting && (
        <div className="flex items-center justify-center">
          <LoadingSpinner size={20} />
        </div>
      )}
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
      <PageLayout>
        <div className="flex border-b border-slate-400 p-4">
          {!isSignedIn && (
            <div className="flex justify-center">
              <SignInButton />
            </div>
          )}
          {!!isSignedIn && <CreatePostWizard />}
        </div>
        <Feed />
      </PageLayout>
    </>
  );
};

export default Home;
