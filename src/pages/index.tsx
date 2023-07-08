import { SignInButton, useUser } from "@clerk/nextjs";
import type { NextPage } from "next";
import { api } from "~/utils/api";

import Image from "next/image";
import LoadingSpinner, { LoadingPage } from "~/components/loading";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { PageLayout } from "../components/layout";
import { PostView } from "~/components/postView";

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
