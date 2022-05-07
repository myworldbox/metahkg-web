import React, {useEffect} from "react";
import {Navigate, useParams} from "react-router-dom";
import {
    useCat,
    useData,
    useId,
    useMenu,
    useProfile,
    useRecall,
    useSearch,
    useSelected,
    useMenuTitle,
} from "../components/MenuProvider";
import {useBack, useIsSmallScreen} from "../components/ContextProvider";

/**
 * Only for small screens
 * Controls the menu to show ProfileMenu
 * @returns a div element
 */
export default function History() {
    const params = useParams();
    const [profile, setProfile] = useProfile();
    const [search, setSearch] = useSearch();
    const [recall, setRecall] = useRecall();
    const [menu, setMenu] = useMenu();
    const [back, setBack] = useBack();
    const isSmallScreen = useIsSmallScreen();
    const [selected, setSelected] = useSelected();
    const [, setMenuTitle] = useMenuTitle();
    const [, setData] = useData();
    const [id, setId] = useId();
    const [cat, setCat] = useCat();

    function clearData() {
        setData([]);
        setMenuTitle("");
        selected && setSelected(0);
    }

    useEffect(() => {
        if (isSmallScreen) {
            !menu && setMenu(true);
            back !== window.location.pathname && setBack(window.location.pathname);

            (profile !== (Number(params.id) || "self") || search) && clearData();
            profile !== (Number(params.id) || "self") && setProfile(Number(params.id) || "self");

            search && setSearch(false);
            recall && setRecall(false);
            id && setId(0);
            cat && setCat(0);
        }
    })

    if (!isSmallScreen)
        return <Navigate to={`/profile/${params.id}`} replace/>;

    return <React.Fragment/>;
}
