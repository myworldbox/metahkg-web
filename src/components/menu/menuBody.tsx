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

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    useCat,
    useReFetch,
    useId,
    useProfile,
    useSmode,
    useMenuMode,
} from "../MenuProvider";
import {
    useHistory,
    useNotification,
    useQuery,
    useStarList,
} from "../AppContextProvider";
import { AxiosError } from "axios";
import { api } from "../../lib/api";
import { Box, Divider, Paper, Typography } from "@mui/material";
import MenuThread from "./menuThread";
import MenuPreload from "./menuPreload";
import { parseError } from "../../lib/parseError";
import { ThreadMeta } from "@metahkg/api";

/**
 * This function renders the main content of the menu
 */
export default function MenuBody(props: { selected: number }) {
    const { selected } = props;
    const navigate = useNavigate();
    const [menuMode] = useMenuMode();
    const [category] = useCat();
    const [profile] = useProfile();
    const [query] = useQuery();
    const [, setNotification] = useNotification();
    const [id] = useId();
    const [data, setData] = useState<ThreadMeta[]>([]);
    const [smode] = useSmode();
    const [page, setPage] = useState(1);
    const [end, setEnd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useHistory();
    const [starList] = useStarList();
    const [reFetch, setReFetch] = useReFetch();
    const paperRef = useRef<HTMLDivElement>(null);

    /**
     * It sets the notification state to an object with the open property set to true and the text
     * property set to the error message.
     * @param {AxiosError} err - The error object.
     */
    function onError(err: AxiosError<any>) {
        setNotification({
            open: true,
            severity: "error",
            text: parseError(err),
        });
        setLoading(false);
        err?.response?.status === 404 && navigate("/404", { replace: true });
        err?.response?.status === 403 && navigate("/403", { replace: true });
    }

    /* A way to make sure that the effect is only run once. */
    useEffect(() => {
        if (
            (reFetch || (!loading && !data.length)) &&
            { category: category, profile, search: query, recall: true, starred: true }[
                menuMode
            ]
        ) {
            data.length && setData([]);
            setReFetch(false);
            setEnd(false);
            setLoading(true);

            const onSuccess = (data: ThreadMeta[]) => {
                page !== 1 && setPage(1);
                data.length && setData(data);
                data.length < 25 && setEnd(true);
                setLoading(false);
                setTimeout(() => {
                    if (paperRef.current) paperRef.current.scrollTop = 0;
                });
            };

            switch (menuMode) {
                case "category":
                    api.categoryThreads(
                        category,
                        { 0: "latest", 1: "viral" }[selected] as "latest" | "viral"
                    )
                        .then(onSuccess)
                        .catch(onError);
                    break;
                case "profile":
                    api.userThreads(
                        profile,
                        { 0: "created", 1: "lastcomment" }[selected] as
                            | "created"
                            | "lastcomment"
                    )
                        .then(onSuccess)
                        .catch(onError);
                    break;
                case "search":
                    api.threadsSearch(
                        encodeURIComponent(query),
                        { 0: "title", 1: "op" }[smode] as "title" | "op",
                        { 0: "relevance", 1: "created", 2: "lastcomment" }[selected] as
                            | "relevance"
                            | "created"
                            | "lastcomment"
                    )
                        .then(onSuccess)
                        .catch(onError);
                    break;
                case "recall":
                    api.threads(history.map((item) => item.id).slice(0, 24))
                        .then(onSuccess)
                        .catch(onError);
                    break;
                case "starred":
                    api.threads(starList.map((item) => item.id).slice(0, 24))
                        .then(onSuccess)
                        .catch(onError);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profile, data, selected, category, reFetch]);

    useEffect(() => {
        if (query && menuMode === "search") setData([]);
    }, [query, menuMode]);

    /**
     * It updates the data array with the new data from the API.
     */
    function update() {
        setEnd(false);
        setLoading(true);

        const onSuccess = (data2: ThreadMeta[]) => {
            setData([...data, ...data2]);
            data2.length < 25 && setEnd(true);
            setPage((page) => page + 1);
            setLoading(false);
        };

        switch (menuMode) {
            case "category":
                api.categoryThreads(
                    category,
                    { 0: "latest", 1: "viral" }[selected] as "latest" | "viral",
                    page + 1
                )
                    .then(onSuccess)
                    .catch(onError);
                break;
            case "profile":
                api.userThreads(
                    profile,
                    { 0: "created", 1: "lastcomment" }[selected] as
                        | "created"
                        | "lastcomment",
                    page + 1
                )
                    .then(onSuccess)
                    .catch(onError);
                break;
            case "search":
                api.threadsSearch(
                    encodeURIComponent(query),
                    { 0: "title", 1: "op" }[smode] as "title" | "op",
                    { 0: "relevance", 1: "created", 2: "lastcomment" }[selected] as
                        | "relevance"
                        | "created"
                        | "lastcomment",
                    page + 1
                )
                    .then(onSuccess)
                    .catch(onError);
                break;
            case "recall":
                api.threads(
                    history.map((item) => item.id).slice(page * 25, (page + 1) * 25 - 1)
                )
                    .then(onSuccess)
                    .catch(onError);
                break;
            case "starred":
                api.threads(
                    starList.map((item) => item.id).slice(page * 25, (page + 1) * 25 - 1)
                )
                    .then(onSuccess)
                    .catch(onError);
        }
    }

    /**
     * If the user has scrolled to the bottom of the page, update the list
     * @param {any} e - The event object.
     */
    function onScroll(e: any) {
        if (!end && !loading) {
            const diff = e.target.scrollHeight - e.target.scrollTop;
            if (
                (e.target.clientHeight >= diff - 1.5 &&
                    e.target.clientHeight <= diff + 1.5) ||
                diff < e.target.clientHeight
            ) {
                update();
            }
        }
    }

    if (menuMode === "search" && !query)
        return (
            <Typography className={"text-center !mt-[10px]"} color={"secondary"}>
                Please enter a query.
            </Typography>
        );

    return (
        <Paper
            className="!bg-none !shadow-none overflow-auto"
            style={{
                maxHeight: `calc(100vh - ${
                    { search: 151, recall: 51, category: 91, profile: 91, starred: 51 }[
                        menuMode
                    ]
                }px)`,
            }}
            onScroll={onScroll}
            ref={paperRef}
        >
            <Box className="min-h-full bg-[#1e1e1e] flex flex-col">
                {Boolean(data.length) && (
                    <Box className="flex flex-col max-w-full bg-[#1e1e1e]">
                        {data.map((thread, index) => (
                            <Box key={index}>
                                <MenuThread
                                    key={`${category}${id === thread.id}`}
                                    thread={thread}
                                    onClick={() => {
                                        const index = history.findIndex(
                                            (i) => i.id === thread.id
                                        );
                                        if (index === -1) {
                                            history.unshift({
                                                id: thread.id,
                                                c: thread.count,
                                                cid: 1,
                                            });
                                            setHistory(history);
                                            localStorage.setItem(
                                                "history",
                                                JSON.stringify(history)
                                            );
                                        } else if (history[index].cid < thread.count) {
                                            history[index].c = thread.count;
                                            setHistory(history);
                                            localStorage.setItem(
                                                "history",
                                                JSON.stringify(history)
                                            );
                                        }
                                    }}
                                />
                                <Divider />
                            </Box>
                        ))}
                    </Box>
                )}
                {loading && <MenuPreload />}
                {end && (
                    <Typography
                        className="!mt-[10px] !mb-[40px] text-center !text-[20px]"
                        sx={{
                            color: "secondary.main",
                        }}
                    >
                        End
                    </Typography>
                )}
            </Box>
        </Paper>
    );
}
