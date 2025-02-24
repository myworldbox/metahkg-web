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

import React, { useEffect, useLayoutEffect } from "react";
import { Alert, Box } from "@mui/material";
import { useMenu } from "../../components/MenuProvider";
import queryString from "query-string";
import { useNavigate } from "react-router-dom";
import { useNotification, useUser } from "../../components/AppContextProvider";
import { setTitle } from "../../lib/common";
import { api } from "../../lib/api";
import { parseError } from "../../lib/parseError";

/**
 * Renders an alert while logging out.
 * @returns an info alert
 */
export default function Logout() {
    const [menu, setMenu] = useMenu();
    const [, setNotification] = useNotification();
    const [, setUser] = useUser();
    const navigate = useNavigate();
    const query = queryString.parse(window.location.search);

    useLayoutEffect(() => {
        setTitle("Logout | Metahkg");

        menu && setMenu(false);
    }, [menu, setMenu]);

    useEffect(() => {
        (async () => {
            await api
                .meLogout()
                .then(() => {
                    // logout
                    localStorage.removeItem("token");
                    setUser(null);
                    setNotification({
                        open: true,
                        severity: "info",
                        text: "Logged out.",
                    });
                    if ("serviceWorker" in navigator) {
                        navigator.serviceWorker.ready.then(async (registration) => {
                            const subscription =
                                await registration.pushManager.getSubscription();
                            subscription?.unsubscribe();
                        });
                    }
                })
                .catch((err) => {
                    setNotification({
                        open: true,
                        severity: "error",
                        text: parseError(err),
                    });
                });

            // go back
            navigate(decodeURIComponent(String(query.returnto || "/")), {
                replace: true,
            });
        })();
    }, [navigate, query.returnto, setNotification, setUser]);

    return (
        <Box
            className="min-h-screen justify-center w-screen"
            sx={{
                backgroundColor: "primary.dark",
            }}
        >
            <Box className="flex w-full justify-center">
                <Alert className="!mt-[30px] w-1/2" severity="info">
                    Logging you out...
                </Alert>
            </Box>
        </Box>
    );
}
