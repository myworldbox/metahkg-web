import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { Box, Typography, SxProps, Theme, CircularProgress } from "@mui/material";
import { useBlockList, useNotification } from "../ContextProvider";
import { useThreadId, useVotes } from "./ConversationContext";
import CommentTop from "./comment/commentTop";
import CommentBody from "./comment/commentBody";
import { api } from "../../lib/api";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import CommentPopup from "../../lib/commentPopup";
import { parseError } from "../../lib/parseError";
import { Comment as CommentType } from "@metahkg/api";
import CommentBottom from "./comment/commentBottom";

const CommentContext = createContext<{
    comment: [CommentType, React.Dispatch<React.SetStateAction<CommentType>>];
    reFetch: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
    showReplies: [
        boolean | undefined,
        React.Dispatch<React.SetStateAction<boolean | undefined>>
    ];
    replies: [CommentType[], React.Dispatch<React.SetStateAction<CommentType[]>>];
    popupOpen: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
    fold: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
    blocked: [
        boolean | undefined,
        React.Dispatch<React.SetStateAction<boolean | undefined>>
    ];
    commentRef: React.RefObject<HTMLElement>;
    inPopUp?: boolean;
    setIsExpanded?: React.Dispatch<React.SetStateAction<boolean>>;
    // @ts-ignore
}>({});

export default function Comment(props: {
    comment: CommentType;
    noId?: boolean;
    inPopUp?: boolean;
    showReplies?: boolean;
    fetchComment?: boolean;
    noQuote?: boolean;
    setIsExpanded?: React.Dispatch<React.SetStateAction<boolean>>;
    fold?: boolean;
    blocked?: boolean;
    noStory?: boolean;
    scrollIntoView?: boolean;
    className?: string;
    sx?: SxProps<Theme>;
    maxHeight?: string | number;
    noFullWidth?: boolean;
}) {
    const {
        noId,
        scrollIntoView,
        fetchComment,
        inPopUp,
        noQuote,
        setIsExpanded,
        noStory,
        sx,
        className,
        maxHeight,
        noFullWidth,
    } = props;
    const threadId = useThreadId();
    const [comment, setComment] = useState(props.comment);
    const [votes] = useVotes();
    const [, setNotification] = useNotification();
    const [blockList] = useBlockList();
    const [ready, setReady] = useState(!fetchComment);
    const [reFetch, setReFetch] = useState(false);
    const [showReplies, setShowReplies] = useState(props.showReplies);
    const [replies, setReplies] = useState<CommentType[]>([]);
    const [loading, setLoading] = useState(false);
    const [popupOpen, setPopupOpen] = useState(false);
    const [fold, setFold] = useState(Boolean(props.fold));
    const commentRef = useRef<HTMLElement>(null);
    const prevVote = useRef(votes?.find((vote) => vote.cid === comment.id)?.vote);

    const [blocked, setBlocked] = useState<boolean | undefined>(
        Boolean(blockList.find((i) => i.id === comment.user.id)) || undefined
    );

    useEffect(() => {
        (blocked || blocked === undefined) &&
            setBlocked(
                Boolean(blockList.find((i) => i.id === comment.user.id)) || undefined
            );
    }, [blockList, blocked, comment.user.id]);

    useEffect(() => {
        const currentVote = votes?.find((vote) => vote.cid === comment.id)?.vote;
        if (prevVote.current !== currentVote && currentVote) {
            prevVote.current = currentVote;
            setReFetch(true);
        }
    }, [votes?.[comment.id], prevVote, votes, comment.id]);

    useEffect(() => {
        commentRef.current && scrollIntoView && commentRef.current.scrollIntoView();
        if (!ready || reFetch) {
            setReFetch(false);
            api.comment(threadId, comment.id)
                .then((data) => {
                    setComment(data);
                    setReady(true);
                })
                .catch((err) => {
                    setNotification({
                        open: true,
                        text: parseError(err),
                    });
                });
        }
        if (inPopUp) {
            setLoading(true);
            api.commentReplies(threadId, comment.id)
                .then((data) => {
                    setReplies(data);
                    setLoading(false);
                })
                .catch(() => {
                    setLoading(false);
                });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ready, reFetch]);

    return useMemo(
        () => (
            <CommentContext.Provider
                value={{
                    comment: [comment, setComment],
                    reFetch: [reFetch, setReFetch],
                    showReplies: [showReplies, setShowReplies],
                    replies: [replies, setReplies],
                    popupOpen: [popupOpen, setPopupOpen],
                    fold: [fold, setFold],
                    blocked: [blocked, setBlocked],
                    inPopUp,
                    commentRef,
                }}
            >
                <Box
                    className={`${noFullWidth ? "" : "w-full"} ${className || ""}`}
                    sx={sx}
                    ref={commentRef}
                    id={noId ? undefined : `c${comment.id}`}
                >
                    {comment.replies?.length && (
                        <CommentPopup
                            comment={comment}
                            showReplies
                            open={popupOpen}
                            setOpen={setPopupOpen}
                        />
                    )}
                    <Box
                        className={`text-left ${
                            !inPopUp ? "!mt-[6px]" : showReplies ? "" : "overflow-auto"
                        } w-full comment-root`}
                        sx={(theme) => ({
                            "& *::selection": {
                                background: theme.palette.secondary.main,
                                color: "black",
                            },
                            bgcolor: "primary.main",
                            maxHeight: inPopUp && !showReplies ? "90vh" : "",
                        })}
                    >
                        <Box className="!ml-[20px] !mr-[20px]">
                            <CommentTop comment={comment} noStory={noStory} />
                            {!fold && !blocked && (
                                <React.Fragment>
                                    <CommentBody
                                        maxHeight={maxHeight}
                                        noQuote={noQuote}
                                        comment={comment}
                                        depth={0}
                                    />
                                    <Box className="h-[2px]" />
                                </React.Fragment>
                            )}
                        </Box>
                        {ready && !fold && !blocked && <CommentBottom />}
                        <Box className="h-[15px]" />
                    </Box>
                    {loading && (
                        <Box className="flex justify-center items-center">
                            <CircularProgress
                                size={30}
                                className="!mt-[10px] !mb-[5px]"
                                color={"secondary"}
                            />
                        </Box>
                    )}
                    {!!replies.length && (
                        <Box>
                            <Box
                                className="flex items-center justify-center text-center cursor-pointer"
                                onClick={() => {
                                    setShowReplies(!showReplies);
                                    setIsExpanded?.(!showReplies);
                                }}
                            >
                                <Typography
                                    className="!mt-[5px] !mb-[5px]"
                                    color="secondary"
                                >
                                    {showReplies ? "Hide" : "Show"} Replies
                                </Typography>
                                {showReplies ? (
                                    <KeyboardArrowUp color="secondary" />
                                ) : (
                                    <KeyboardArrowDown color="secondary" />
                                )}
                            </Box>
                            {showReplies && (
                                <React.Fragment>
                                    {replies.map((comment) => (
                                        <Comment comment={comment} noId noQuote noStory />
                                    ))}
                                    <Box className="flex justify-center items-center">
                                        <Typography
                                            className="!mt-[5px] !mb-[5px] !text-[18px]"
                                            color="secondary"
                                        >
                                            End
                                        </Typography>
                                    </Box>
                                </React.Fragment>
                            )}
                        </Box>
                    )}
                </Box>
            </CommentContext.Provider>
        ),
        [
            comment,
            reFetch,
            showReplies,
            replies,
            popupOpen,
            fold,
            noFullWidth,
            className,
            sx,
            noId,
            inPopUp,
            noStory,
            blocked,
            maxHeight,
            noQuote,
            ready,
            setIsExpanded,
            loading,
        ]
    );
}

export function useComment() {
    const { comment } = useContext(CommentContext);
    return comment;
}

export function useReFetch() {
    const { reFetch } = useContext(CommentContext);
    return reFetch;
}

export function useShowReplies() {
    const { showReplies } = useContext(CommentContext);
    return showReplies;
}

export function useReplies() {
    const { replies } = useContext(CommentContext);
    return replies;
}

export function usePopupOpen() {
    const { popupOpen } = useContext(CommentContext);
    return popupOpen;
}

export function useFold() {
    const { fold } = useContext(CommentContext);
    return fold;
}

export function useBlocked() {
    const { blocked } = useContext(CommentContext);
    return blocked;
}

export function useCommentRef() {
    const { commentRef } = useContext(CommentContext);
    return commentRef;
}

export function useInPopUp() {
    const { inPopUp } = useContext(CommentContext);
    return inPopUp;
}

export function useSetIsExpanded() {
    const { setIsExpanded } = useContext(CommentContext);
    return setIsExpanded;
}
