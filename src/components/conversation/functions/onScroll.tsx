import { useHistory } from "../../ContextProvider";
import { useEnd, useThread, useThreadId, useUpdating } from "../ConversationContext";
import { useUpdate } from "./update";

export default function useOnScroll() {
    const [end] = useEnd();
    const [updating] = useUpdating();
    const [history, setHistory] = useHistory();
    const [thread] = useThread();
    const threadId = useThreadId();
    const update = useUpdate();
    return (e: any) => {
        if (!end && !updating) {
            const diff = e.target.scrollHeight - e.target.scrollTop;
            if (
                (e.target.clientHeight >= diff - 1.5 &&
                    e.target.clientHeight <= diff + 1.5) ||
                diff < e.target.clientHeight
            ) {
                update();
            }
        }
        const index = history.findIndex((i) => i.id === threadId);
        if (index !== -1 && thread) {
            const arr = [...Array(thread.conversation.length)].map((und, c) => {
                return Math.abs(
                    Number(
                        document.getElementById(`c${c + 1}`)?.getBoundingClientRect()?.top
                    )
                );
            });
            const currentcomment =
                arr.findIndex(
                    (i) =>
                        i ===
                        Math.min.apply(
                            Math,
                            arr.filter((i) => Boolean(i))
                        )
                ) + 1;
            if (history[index]?.cid !== currentcomment) {
                history[index].cid = currentcomment;
                setHistory(history);
                localStorage.setItem("history", JSON.stringify(history));
            }
        }
    };
}
