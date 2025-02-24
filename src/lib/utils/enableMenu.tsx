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

import React, { useLayoutEffect } from "react";
import { useIsSmallScreen } from "../../components/AppContextProvider";
import { useMenu } from "../../components/MenuProvider";

export default function EnableMenu(props: {
    children: React.ReactNode;
    notOnSmallScreen?: boolean;
}) {
    const { children, notOnSmallScreen: noSmallScreen } = props;
    const [menu, setMenu] = useMenu();
    const isSmallScreen = useIsSmallScreen();

    useLayoutEffect(() => {
        if (!menu && (!noSmallScreen || !isSmallScreen)) setMenu(true);
        if (menu && noSmallScreen && isSmallScreen) setMenu(false);
    }, [isSmallScreen, menu, noSmallScreen, setMenu]);

    return <React.Fragment>{children}</React.Fragment>;
}
