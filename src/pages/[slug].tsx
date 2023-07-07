import type {
  GetStaticPaths,
  GetStaticPropsContext,
  InferGetServerSidePropsType,
} from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { PageLayout } from "./layout";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const ProfilePage = (
  props: InferGetServerSidePropsType<typeof getStaticProps>
) => {
  const { username } = props;
  const { data } = api.profile.getUserByUsername.useQuery({
    username,
  });

  if (!data) return <div>404</div>;

  return (
    <>
      <Head>
        <title>Profile | {data?.username}</title>
      </Head>
      <PageLayout>
        <div className="relative h-36 border-b border-black bg-slate-600">
          <div className="p-4">
            <Link href={"/"}>
              <ArrowLeft className="cursor-pointer" />
            </Link>
          </div>
          <Image
            src={data?.profileImageUrl}
            alt={`${data?.username ?? "user"} profile pic`}
            width={128}
            height={128}
            className="absolute bottom-0 -mb-[64px] ml-6 rounded-full border-4 border-black"
          />
        </div>
        <div className="h-[64px]"></div>
        <div className="border-b border-slate-200 p-4">
          <span className="text-2xl font-bold">{`@${
            data?.username ?? ""
          }`}</span>
        </div>
      </PageLayout>
    </>
  );
};

import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "~/server/api/root";
import superjson from "superjson";
import { prisma } from "~/server/db";

export async function getStaticProps(
  context: GetStaticPropsContext<{ slug: string }>
) {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: superjson, // optional - adds superjson serialization
  });

  const slug = context?.params?.slug;

  if (typeof slug !== "string") throw new Error("no slug!");

  const username = slug.replace("@", "");

  await helpers.profile.getUserByUsername.prefetch({ username });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      username,
    },
  };
}

export const getStaticPaths: GetStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default ProfilePage;
