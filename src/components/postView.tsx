import type { RouterOutputs } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import Link from "next/link";

dayjs.extend(relativeTime);

type PostWithAuthor = RouterOutputs["post"]["getAllPosts"][number];
export const PostView = (props: PostWithAuthor) => {
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
