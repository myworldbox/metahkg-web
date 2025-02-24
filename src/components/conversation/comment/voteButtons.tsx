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

import React, { useState } from "react";
import { ArrowDropDown, ArrowDropUp } from "@mui/icons-material";
import { Button, ButtonGroup, Typography } from "@mui/material";
import { useNotification, useUser } from "../../AppContextProvider";
import { api } from "../../../lib/api";
import { useThreadId, useVotes } from "../ConversationContext";
import { parseError } from "../../../lib/parseError";
import { Comment, Vote } from "@metahkg/api";

export default function VoteButtons(props: { comment: Comment }) {
    const threadId = useThreadId();
    const [votes, setVotes] = useVotes();
    const [, setNotification] = useNotification();
    const [user] = useUser();
    const [comment, setComment] = useState(props.comment);

    const vote = votes?.find((v) => v.cid === comment.id)?.vote;
    const up = comment.U || 0;
    const down = comment.D || 0;

    /**
     * It sends a vote to the server.
     * @param {Vote} vote - "U" | "D"
     */
    function sendVote(vote: Vote) {
        api.commentVote({ vote }, threadId, comment.id)
            .then(() => {
                // for the refetch effect to work, we need to fetch the comment again
                setComment({ ...comment, [vote]: (comment[vote] || 0) + 1 });
                votes && setVotes([...votes, { cid: comment.id, vote }]);
            })
            .catch((err) => {
                setNotification({
                    open: true,
                    severity: "error",
                    text: parseError(err),
                });
            });
    }

    return (
        <ButtonGroup variant="text" className="!rounded-[4px] !bg-[#333]">
            <Button
                className="!p-0 !m-0 !block !py-[2px] !min-w-0 !pl-[5.5px] !pr-[6px] !rounded-r-0"
                disabled={!user || Boolean(vote)}
                onClick={() => {
                    sendVote("U");
                }}
            >
                <Typography
                    className="flex"
                    sx={{
                        color: vote === "U" ? "green" : "#aaa",
                    }}
                >
                    <ArrowDropUp className={!vote ? "hover:!text-[#fff]" : ""} />
                    {up}
                </Typography>
            </Button>
            <Button
                className="!p-0 !m-0 !block !py-[2px] !min-w-0 !pr-[10px] !rounded-l-0"
                disabled={!user || Boolean(vote)}
                onClick={() => {
                    sendVote("D");
                }}
            >
                <Typography
                    className="flex"
                    sx={{
                        color: vote === "D" ? "red" : "#aaa",
                    }}
                >
                    <ArrowDropDown className={!vote ? "hover:!text-[#fff]" : ""} />
                    {down}
                </Typography>
            </Button>
        </ButtonGroup>
    );
}
