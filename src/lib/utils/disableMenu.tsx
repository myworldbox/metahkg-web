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
import { useMenu } from "../../components/MenuProvider";

export default function DisableMenu(props: { children: React.ReactNode }) {
    const { children } = props;
    const [menu, setMenu] = useMenu();

    useLayoutEffect(() => {
        menu && setMenu(false);
    }, [menu, setMenu]);

    return <React.Fragment>{children}</React.Fragment>;
}
