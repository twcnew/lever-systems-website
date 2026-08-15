import Link from "next/link";
import type { BlogBlock, BlogInline, BlogMeta } from "@/lib/blog";
import { isExternalHref } from "@/lib/blog";
import { withBasePath } from "@/lib/basePath";

function Inline({ nodes }: { nodes: BlogInline[] }) {
  return nodes.map((node, index) => {
    if (node.type === "text") return <span key={index}>{node.value}</span>;
    if (node.type === "strong") return <strong key={index}>{node.value}</strong>;
    if (node.type === "em") return <em key={index}>{node.value}</em>;
    if (isExternalHref(node.href)) {
      return (
        <a
          key={index}
          href={node.href}
          target="_blank"
          rel="noopener noreferrer"
        >
          {node.value}
        </a>
      );
    }
    return (
      <Link key={index} href={node.href}>
        {node.value}
      </Link>
    );
  });
}

function VideoSlot({ video }: { video: BlogMeta["video"] }) {
  return (
    <figure className="blog-video">
      {video.src ? (
        <video
          className="blog-video__player"
          controls
          playsInline
          preload="metadata"
          poster={video.poster ? withBasePath(video.poster) : undefined}
          src={withBasePath(video.src)}
        />
      ) : (
        <div className="blog-video__placeholder" role="img" aria-label={video.placeholderLabel}>
          <span>{video.placeholderLabel}</span>
        </div>
      )}
      {video.caption ? (
        <figcaption className="blog-video__caption">{video.caption}</figcaption>
      ) : null}
    </figure>
  );
}

export function BlogProse({
  blocks,
  video,
  skipTitle,
}: {
  blocks: BlogBlock[];
  video: BlogMeta["video"];
  skipTitle?: boolean;
}) {
  return (
    <div className="blog-prose">
      {blocks.map((block, index) => {
        if (block.type === "h1") {
          if (skipTitle) return null;
          return (
            <h1 className="blog-prose__title" key={index}>
              {block.text}
            </h1>
          );
        }
        if (block.type === "h2") {
          return (
            <h2 className="blog-prose__heading" key={index}>
              {block.text}
            </h2>
          );
        }
        if (block.type === "p") {
          return (
            <p className="blog-prose__p" key={index}>
              <Inline nodes={block.children} />
            </p>
          );
        }
        if (block.type === "ul" || block.type === "ol") {
          const Tag = block.type;
          return (
            <Tag className="blog-prose__list" key={index}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  <Inline nodes={item} />
                </li>
              ))}
            </Tag>
          );
        }
        if (block.type === "video") {
          return <VideoSlot video={video} key={index} />;
        }
        if (block.type === "image") {
          return (
            <figure className="blog-figure" key={index}>
              <img
                className="blog-figure__img"
                src={withBasePath(block.src)}
                alt={block.alt}
                loading="lazy"
                decoding="async"
              />
              {block.alt ? (
                <figcaption className="blog-figure__caption">{block.alt}</figcaption>
              ) : null}
            </figure>
          );
        }
        return null;
      })}
    </div>
  );
}
