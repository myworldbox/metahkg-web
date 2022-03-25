import { parse } from "node-html-parser";
import DOMPurify from 'dompurify';
/**
 * It takes a string, parses it, and then looks for any links in the string. If it finds a link, it
 * checks if the link is a YouTube link. If it is, it adds a YouTube link to the page
 * @param {string} comment - The comment to modify.
 * @returns The modified comment.
 */
export function modifycomment(comment: string) {
  comment = DOMPurify.sanitize(comment);
  let parsed = parse(comment);
  // eslint-disable-next-line no-loop-func
  parsed.querySelectorAll("a").forEach((item) => {
    const href = item.getAttribute("href");
    if (
      href?.startsWith("https://www.youtube.com/") ||
      href?.startsWith("https://youtu.be")
    ) {
      addyoutube(item);
    }
    linkinnewtab(item);
  });
  return parsed.toString();
}
/**
 * It takes a link to a YouTube video and inserts an iframe with the video embedded
 * @param item - The node that contains the link to the YouTube video.
 * @returns A string
 */
function addyoutube(item: import("node-html-parser/dist/nodes/html").default) {
  try {
    const youtubeurl = new URL(String(item.getAttribute("href")));
    const videoId =
      youtubeurl.origin === "https://youtu.be"
        ? youtubeurl.pathname.replace("/", "")
        : youtubeurl.searchParams.get("v");
    if (!videoId) return;
    item.insertAdjacentHTML(
      "beforebegin",
      `<iframe 
      width="${window.innerWidth < 760 ? "100%" : "60%"}"
      height="auto"
      style="aspect-ratio: 16/9;"
      src="https://www.youtube.com/embed/${videoId}"
      title="YouTube video player"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen
    ></iframe>
  <br/>`
    );
  } catch {}
}
/**
 * It takes an HTML node and
 * sets its attributes to open in a new tab
 * @param item - The node to be modified.
 */
function linkinnewtab(
  item: import("node-html-parser/dist/nodes/html").default
) {
  item.setAttribute("target", "_blank");
  item.setAttribute("rel", "noreferrer");
}
