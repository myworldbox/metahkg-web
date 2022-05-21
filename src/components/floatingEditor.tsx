import React, { useState } from "react";
import { Close, Comment as CommentIcon } from "@mui/icons-material";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    DialogTitle,
    IconButton,
    Snackbar,
    Tooltip,
} from "@mui/material";
import ReCAPTCHA from "react-google-recaptcha";
import { api } from "../lib/api";
import Comment from "./conversation/comment";
import {
    useCBottom,
    useEditor,
    useThread,
    useThreadId,
} from "./conversation/ConversationContext";
import { useUpdate } from "./conversation/functions/update";
import TextEditor from "./texteditor";
import { useIsSmallScreen, useNotification } from "./ContextProvider";
import UploadImage from "./uploadimage";
import { severity } from "../types/severity";
import { TinyMCE } from "tinymce";

declare const tinymce: TinyMCE;
declare const grecaptcha: { reset: () => void };

export default function FloatingEditor() {
    const threadId = useThreadId();
    const [editor, setEditor] = useEditor();
    const handleClose = () => {
        setEditor({ ...editor, open: false });
    };
    const [comment, setComment] = useState("");
    const [rtoken, setRtoken] = useState<null | string>(null);
    const [creating, setCreating] = useState(false);
    const [fold, setFold] = useState(false);
    const [, setNotification] = useNotification();
    const [thread] = useThread();
    const [imgUrl, setImgUrl] = useState("");
    const [alert, setAlert] = useState<{ severity: severity; text: string }>({
        severity: "info",
        text: "",
    });
    const isSmallScreen = useIsSmallScreen();
    const update = useUpdate();
    const cBottom = useCBottom();

    function CreateComment() {
        setCreating(true);
        api.post("/posts/comment", {
            id: threadId,
            comment,
            quote: editor.quote?.id,
            rtoken,
        })
            .then(() => {
                setEditor({ ...editor, open: false });
                update();

                if (cBottom.current)
                    cBottom.current.scrollIntoView({ behavior: "smooth" });

                setCreating(false);
            })
            .catch((err) => {
                setNotification({
                    open: true,
                    text: err.response.data?.error || err.response.data || "",
                });
                setCreating(false);
                grecaptcha.reset();
            });
    }

    return (
        <Snackbar
            sx={{ zIndex: 1000, top: `${thread?.pin ? "110" : "60"}px !important` }}
            className="border-radius-20"
            anchorOrigin={{ horizontal: "right", vertical: "top" }}
            open={editor.open}
        >
            <Box
                sx={{
                    maxWidth: isSmallScreen ? "100vw" : "70vw",
                    width: isSmallScreen ? "100vw" : "50vw",
                    maxHeight: "70vh",
                    bgcolor: "primary.dark",
                    overflow: "auto",
                }}
                className="border-radius-15"
            >
                <DialogTitle className="flex justify-space-between align-center nopadding">
                    <p className="ml20 mt10 mb10">{editor.quote ? "Reply" : "Comment"}</p>
                    <Box className="flex">
                        <p
                            className="novmargin pointer mr10 metahkg-yellow"
                            onClick={() => {
                                setFold(!fold);
                            }}
                        >
                            {fold ? "Expand" : "Fold"}
                        </p>
                        <IconButton className="mr5" onClick={handleClose}>
                            <Close className="font-size-18-force" />
                        </IconButton>
                    </Box>
                </DialogTitle>
                {editor.quote && <Comment comment={editor.quote} fold noId fetchComment noStory />}
                {!fold && (
                    <Box className="border-radius-20">
                        <UploadImage
                            className="m10"
                            onUpload={() => {
                                setAlert({
                                    severity: "info",
                                    text: "Uploading image...",
                                });
                            }}
                            onSuccess={(res) => {
                                setAlert({ severity: "info", text: "Image uploaded!" });
                                setImgUrl(res.data.url);
                                tinymce.activeEditor.insertContent(
                                    `<a href="${res.data.url}" target="_blank" rel="noreferrer"><img src="${res.data.url}" width="auto" height="auto" style="object-fit: contain; max-height: 400px; max-width: 100%;" /></a>`
                                );
                            }}
                            onError={() => {
                                setAlert({
                                    severity: "error",
                                    text: "Error uploading image.",
                                });
                            }}
                        />
                        {imgUrl && (
                            <p
                                className={`ml10 novmargin flex${
                                    isSmallScreen ? " mt5" : ""
                                }`}
                            >
                                <Tooltip
                                    arrow
                                    title={
                                        <img
                                            src={`https://i.metahkg.org/thumbnail?src=${imgUrl}`}
                                            alt=""
                                        />
                                    }
                                >
                                    <a href={imgUrl} target="_blank" rel="noreferrer">
                                        {imgUrl}
                                    </a>
                                </Tooltip>
                                <p
                                    className="link novmargin metahkg-grey-force ml5"
                                    onClick={() => {
                                        navigator.clipboard.writeText(imgUrl);
                                        setNotification({
                                            open: true,
                                            text: "Copied to clipboard!",
                                        });
                                    }}
                                >
                                    copy
                                </p>
                            </p>
                        )}
                        {alert.text && (
                            <Alert className="m10" severity={alert.severity}>
                                {alert.text}
                            </Alert>
                        )}
                        <TextEditor
                            onChange={(e) => {
                                setComment(e);
                            }}
                            autoresize
                            className="ml10 mr10"
                        />
                        <Box
                            className={`${
                                isSmallScreen ? "" : "flex"
                            } justify-space-between align-center m10`}
                        >
                            <ReCAPTCHA
                                theme="dark"
                                sitekey={
                                    process.env.REACT_APP_recaptchasitekey ||
                                    "6LcX4bceAAAAAIoJGHRxojepKDqqVLdH9_JxHQJ-"
                                }
                                onChange={(token) => {
                                    setRtoken(token || "");
                                }}
                            />
                            {creating ? (
                                <CircularProgress color="secondary" disableShrink />
                            ) : (
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={CreateComment}
                                    disabled={!rtoken || !comment}
                                    className={isSmallScreen ? "mt10" : ""}
                                >
                                    <CommentIcon />
                                    Comment
                                </Button>
                            )}
                        </Box>
                    </Box>
                )}
            </Box>
        </Snackbar>
    );
}
