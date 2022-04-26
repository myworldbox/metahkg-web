import "./css/commentBody.css";
import { replace } from "../../../lib/modifycomments";
import { commentType } from "../../../types/conversation/comment";
import parse from "html-react-parser";
import React, { useEffect, useState } from "react";
import { PopUp } from "../../../lib/popup";
import Comment from "../comment";
import Prism from "prismjs";
export default function CommentBody(props: { comment: commentType; depth: number }) {
    const { comment, depth } = props;
    const commentJSX = parse(comment.comment, { replace: replace });
    const [quoteOpen, setQuoteOpen] = useState(false);
    const content = [
        comment.quote && (
            <blockquote
                style={{ border: "none" }}
                className={`flex fullwidth${depth !== 1 ? " novmargin" : ""}`}
            >
                <div
                    className="pointer comment-body-quote-div"
                    style={{ width: 15, marginLeft: 0 }}
                    onClick={() => {
                        setQuoteOpen(true);
                    }}
                />
                <div className="comment-body fullwidth">
                    <CommentBody comment={comment.quote} depth={depth + 1} />
                </div>
            </blockquote>
        ),
        commentJSX,
    ];
    useEffect(() => {
        Prism.highlightAll();
    });
    return (
        <React.Fragment>
            {comment.quote && (
                <PopUp open={quoteOpen} setOpen={setQuoteOpen} fullWidth>
                    <Comment
                        fetchComment
                        noId
                        comment={comment.quote}
                    />
                </PopUp>
            )}
            {depth === 1 ? (
                <p className="novmargin comment-body fullwidth break-word-force">
                    {content}
                </p>
            ) : (
                content
            )}
        </React.Fragment>
    );
}
