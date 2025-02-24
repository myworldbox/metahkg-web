/*
 Copyright (C) 2022-present Metahkg Contributors

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as
 published by the Free Software Foundation, either version 3 of the
 License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Alert, Box, Button, TextField } from "@mui/material";
import { Create as CreateIcon } from "@mui/icons-material";
import TextEditor from "../components/textEditor";
import ReCAPTCHA from "react-google-recaptcha";
import { Navigate, useNavigate } from "react-router-dom";
import queryString from "query-string";
import { useCat, useMenu } from "../components/MenuProvider";
import {
    useIsSmallScreen,
    useNotification,
    useReCaptchaSiteKey,
    useUser,
    useWidth,
} from "../components/AppContextProvider";
import { setTitle, wholePath } from "../lib/common";
import { severity } from "../types/severity";
import MetahkgLogo from "../components/logo";
import { api } from "../lib/api";
import ChooseCat from "../components/create/ChooseCat";
import { parseError } from "../lib/parseError";
import ReCaptchaNotice from "../lib/reCaptchaNotice";

/**
 * Page for creating a new thread
 */
export default function Create() {
    const navigate = useNavigate();
    const query = queryString.parse(window.location.search);
    const [menu, setMenu] = useMenu();
    const isSmallScreen = useIsSmallScreen();
    const [width] = useWidth();
    const [cat] = useCat();
    const [notification, setNotification] = useNotification();
    const [catchoosed, setCatchoosed] = useState<number>(cat || 1);
    const [threadTitle, setThreadTitle] = useState(""); //this will be the post title
    const [comment, setComment] = useState(""); //initial comment (#1)
    const [disabled, setDisabled] = useState(false);
    const [alert, setAlert] = useState<{ severity: severity; text: string }>({
        severity: "info",
        text: "",
    });
    const reCaptchaRef = useRef<ReCAPTCHA>(null);

    const quote = {
        threadId: Number(String(query.quote).split(".")[0]),
        commentId: Number(String(query.quote).split(".")[1]),
    };

    const [inittext, setInittext] = useState("");
    const [user] = useUser();
    const reCaptchaSiteKey = useReCaptchaSiteKey();

    const isSmallSmallScreen = width * 0.8 - 40 <= 450;

    useLayoutEffect(() => {
        setTitle("Create thread | Metahkg");
        menu && setMenu(false);
    }, [menu, setMenu, user]);

    useEffect(() => {
        if (user && quote.threadId && quote.commentId) {
            setAlert({ severity: "info", text: "Fetching comment..." });
            setNotification({
                open: true,
                severity: "info",
                text: "Fetching comment...",
            });
            api.comment(quote.threadId, quote.commentId)
                .then((data) => {
                    if (data) {
                        setInittext(
                            /*html*/ `<blockquote style="color: #aca9a9; border-left: 2px solid #646262; margin-left: 0"><div style="margin-left: 15px">${data.comment}</div></blockquote><p></p>`
                        );
                        setAlert({ severity: "info", text: "" });
                        setTimeout(() => {
                            if (notification.open)
                                setNotification({ open: false, text: "" });
                        }, 500);
                    } else {
                        setAlert({ severity: "error", text: "Comment not found!" });
                        setNotification({
                            open: true,
                            severity: "error",
                            text: "Comment not found!",
                        });
                    }
                })
                .catch(() => {
                    const text =
                        "Unable to fetch comment. This comment would not be a quote.";
                    setAlert({ severity: "warning", text });
                    setNotification({ open: true, severity: "warning", text });
                });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!user)
        return (
            <Navigate
                to={`/users/login?continue=true&returnto=${encodeURIComponent(
                    wholePath()
                )}`}
                replace
            />
        );

    async function onSubmit(e?: React.FormEvent<HTMLFormElement>) {
        e?.preventDefault();
        setDisabled(true);
        const rtoken = await reCaptchaRef.current?.executeAsync();
        if (!rtoken) return;
        setAlert({ severity: "info", text: "Creating thread..." });
        setNotification({ open: true, severity: "info", text: "Creating thread..." });
        api.threadCreate({
            title: threadTitle,
            category: catchoosed,
            comment,
            rtoken,
        })
            .then((data) => {
                navigate(`/thread/${data.id}`, { replace: true });
                setTimeout(() => {
                    notification.open && setNotification({ open: false, text: "" });
                }, 100);
            })
            .catch((err) => {
                const text = parseError(err);
                setAlert({ severity: "error", text });
                setNotification({ open: true, severity: "error", text });
                setDisabled(false);
                reCaptchaRef.current?.reset();
            });
    }

    return (
        <Box
            className="flex w-full min-h-screen justify-center max-w-full"
            sx={{
                backgroundColor: "primary.dark",
            }}
        >
            <Box className={isSmallScreen ? "w-100v" : "w-80v"}>
                <Box className="m-[20px]" component="form" onSubmit={onSubmit}>
                    <Box className="flex items-center">
                        <MetahkgLogo
                            svg
                            height={50}
                            width={40}
                            light
                            className="!mr-[10px] !mb-[10px]"
                        />
                        <h1>Create thread</h1>
                    </Box>
                    {alert.text && (
                        <Alert className="!mb-[15px]" severity={alert.severity}>
                            {alert.text}
                        </Alert>
                    )}
                    <Box className={`mb-[15px] ${isSmallScreen ? "" : "flex "}`}>
                        <ChooseCat cat={catchoosed} setCat={setCatchoosed} />
                        <TextField
                            className={isSmallScreen ? "!mt-[15px]" : "!ml-[15px]"}
                            variant="filled"
                            color="secondary"
                            fullWidth
                            label="Title"
                            onChange={(e) => {
                                setThreadTitle(e.target.value);
                            }}
                        />
                    </Box>
                    <TextEditor
                        onChange={(v, e: any) => {
                            setComment(e.getContent());
                        }}
                        initText={inittext}
                        toolbarSticky
                        autoResize
                        minHeight={isSmallScreen ? 310 : 350}
                    />
                    <Box className="mt-[15px]">
                        <ReCAPTCHA
                            theme="dark"
                            sitekey={reCaptchaSiteKey}
                            size="invisible"
                            ref={reCaptchaRef}
                        />
                        <Button
                            disabled={disabled || !(comment && threadTitle && catchoosed)}
                            className={`${
                                isSmallSmallScreen ? "!mt-[15px] " : ""
                            }!text-[16px] !h-[40px] !py-0 !normal-case`}
                            variant="contained"
                            color="secondary"
                            type="submit"
                        >
                            <CreateIcon className="!mr-[5px] !text-[16px]" />
                            Create
                        </Button>
                        <ReCaptchaNotice />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
