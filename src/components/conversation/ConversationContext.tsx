import React, { createContext, useState, useRef } from "react";
import { threadType } from "../../types/conversation/thread";
import queryString from "query-string";
import { commentType } from "../../types/conversation/comment";

interface editorStateType {
    open: boolean;
    quote?: commentType;
}

const ConversationContext = createContext<{
    thread: [null | threadType, React.Dispatch<React.SetStateAction<null | threadType>>];
    finalPage: [number, React.Dispatch<React.SetStateAction<number>>];
    currentPage: [number, React.Dispatch<React.SetStateAction<number>>];
    userVotes: [
        { [id: number]: "U" | "D" } | null,
        React.Dispatch<React.SetStateAction<{ [id: number]: "U" | "D" } | null>>
    ];
    updating: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
    pages: [number, React.Dispatch<React.SetStateAction<number>>];
    end: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
    loading: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
    reRender: [number, React.Dispatch<React.SetStateAction<number>>];
    story: [number, React.Dispatch<React.SetStateAction<number>>];
    lastHeight: React.MutableRefObject<number>;
    galleryOpen: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
    images: [{ src: string }[], React.Dispatch<React.SetStateAction<{ src: string }[]>>];
    editor: [editorStateType, React.Dispatch<React.SetStateAction<editorStateType>>];
    title: string | undefined;
    threadId: number;
    croot: React.MutableRefObject<HTMLDivElement | null>;
    // @ts-ignore
}>(null);

export default function ConversationProvider(props: {
    children: JSX.Element | JSX.Element[];
    threadId: number;
}) {
    const query = queryString.parse(window.location.search);
    const { threadId, children } = props;
    const [thread, setThread] = useState<threadType | null>(null);
    const [finalPage, setFinalPage] = useState(
        Number(query.page) || Math.floor(Number(query.c) / 25) + 1 || 1
    );
    /** Current page */
    const [currentPage, setCurrentPage] = useState(
        Number(query.page) || Math.floor(Number(query.c) / 25) + 1 || 1
    );
    const [userVotes, setUserVotes] = useState<{ [id: number]: "U" | "D" } | null>(null);
    const [updating, setUpdating] = useState(false);
    const [pages, setPages] = useState(1);
    const [end, setEnd] = useState(false);
    const [loading, setLoading] = useState(true);
    const [reRender, setReRender] = useState(Math.random());
    const [story, setStory] = useState(0);
    const lastHeight = useRef(0);
    const [galleryOpen, setGalleryOpen] = useState(false);
    const [images, setImages] = useState<{ src: string }[]>([]);
    const [editor, setEditor] = useState<editorStateType>({ open: false });
    const croot = useRef<HTMLDivElement>(null);
    return (
        <ConversationContext.Provider
            value={{
                thread: [thread, setThread],
                finalPage: [finalPage, setFinalPage],
                currentPage: [currentPage, setCurrentPage],
                userVotes: [userVotes, setUserVotes],
                updating: [updating, setUpdating],
                pages: [pages, setPages],
                end: [end, setEnd],
                loading: [loading, setLoading],
                reRender: [reRender, setReRender],
                story: [story, setStory],
                galleryOpen: [galleryOpen, setGalleryOpen],
                images: [images, setImages],
                lastHeight: lastHeight,
                title: thread?.title,
                threadId: threadId,
                croot: croot,
                editor: [editor, setEditor],
            }}
        >
            {children}
        </ConversationContext.Provider>
    );
}

export function useThread() {
    const { thread } = React.useContext(ConversationContext);
    return thread;
}

export function useFinalPage() {
    const { finalPage } = React.useContext(ConversationContext);
    return finalPage;
}

export function useCurrentPage() {
    const { currentPage } = React.useContext(ConversationContext);
    return currentPage;
}

export function useUserVotes() {
    const { userVotes: votes } = React.useContext(ConversationContext);
    return votes;
}

export function useUpdating() {
    const { updating } = React.useContext(ConversationContext);
    return updating;
}

export function usePages() {
    const { pages } = React.useContext(ConversationContext);
    return pages;
}

export function useEnd() {
    const { end } = React.useContext(ConversationContext);
    return end;
}

export function useLoading() {
    const { loading } = React.useContext(ConversationContext);
    return loading;
}

export function useRerender() {
    const { reRender } = React.useContext(ConversationContext);
    return reRender;
}

export function useStory() {
    const { story } = React.useContext(ConversationContext);
    return story;
}

export function useGalleryOpen() {
    const { galleryOpen } = React.useContext(ConversationContext);
    return galleryOpen;
}

export function useImages() {
    const { images } = React.useContext(ConversationContext);
    return images;
}

export function useLastHeight() {
    const { lastHeight } = React.useContext(ConversationContext);
    return lastHeight;
}

export function useThreadId() {
    const { threadId } = React.useContext(ConversationContext);
    return threadId;
}

export function useTitle() {
    const { title } = React.useContext(ConversationContext);
    return title;
}

export function useCRoot() {
    const { croot } = React.useContext(ConversationContext);
    return croot;
}

export function useEditor() {
    const { editor } = React.useContext(ConversationContext);
    return editor;
}
