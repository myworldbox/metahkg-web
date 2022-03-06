import "./css/addcomment.css";
import React, { useEffect, useState } from "react";
import { Alert, Box, Button } from "@mui/material";
import axios from "axios";
import { Navigate, useNavigate, useParams } from "react-router";
import { Link } from "react-router-dom";
import { useNotification, useWidth } from "../components/ContextProvider";
import { useData, useMenu } from "../components/MenuProvider";
import TextEditor from "../components/texteditor";
import { roundup, severity, wholepath } from "../lib/common";
import MetahkgLogo from "../components/logo";
import queryString from "query-string";
import ReCAPTCHA from "react-google-recaptcha";
declare const grecaptcha: { reset: () => void };
/**
 * This page is used to add a comment to a thread
 */
export default function AddComment() {
  const navigate = useNavigate();
  const [menu, setMenu] = useMenu();
  const [data, setData] = useData();
  const [width] = useWidth();
  const [comment, setComment] = useState("");
  const [inittext, setInittext] = useState("");
  const [disabled, setDisabled] = useState(false);
  const [rtoken, setRtoken] = useState("");
  const [alert, setAlert] = useState<{ severity: severity; text: string }>({
    severity: "info",
    text: "",
  });
  const [, setNotification] = useNotification();
  const params = useParams();
  const query = queryString.parse(window.location.search);
  const quote = Number(query.quote);
  useEffect(() => {
    if (localStorage.user) {
      axios.post("/api/check", { id: id }).catch((err) => {
        if (err.response.status === 404) {
          setAlert({
            severity: "warning",
            text: "Thread not found. Redirecting you to the homepage in 5 seconds.",
          });
          setNotification({
            open: true,
            text: "Thread not found. Redirecting you to the homepage in 5 seconds.",
          });
          setTimeout(() => {
            navigate("/", { replace: true });
          }, 5000);
        } else {
          setAlert({
            severity: "error",
            text: err?.response?.data?.error || err?.response?.data || "",
          });
          setNotification({
            open: true,
            text: err?.response?.data?.error || err?.response?.data || "",
          });
        }
      });
      if (quote) {
        setNotification({ open: true, text: "Fetching comment..." });
        axios
          .get(`/api/thread/${id}?type=2&start=${quote}&end=${quote}`)
          .then((res) => {
            setInittext(
              `<blockquote style="color: #aca9a9; border-left: 2px solid #aca9a9; margin-left: 0"><div style="margin-left: 15px">${res.data?.[0]?.comment}</div></blockquote><p></p>`
            );
            setTimeout(() => {
              setNotification({ open: false, text: "" });
            }, 1000);
          })
          .catch(() => {
            setNotification({
              open: true,
              text: "Unable to fetch comment. This comment would not be a quote.",
            });
          });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /**
   * It sends a post request to the server with the comment data.
   */
  function addcomment() {
    //send data to server /api/comment
    setDisabled(true);
    setAlert({ severity: "info", text: "Adding comment..." });
    axios
      .post("/api/comment", { id: id, comment: comment, rtoken: rtoken })
      .then((res) => {
        data.length && setData([]);
        navigate(
          `/thread/${id}?page=${roundup(res.data.id / 25)}&c=${res.data.id}`
        );
      })
      .catch((err) => {
        setAlert({
          severity: "error",
          text: err?.response?.data?.error || err?.response?.data || "",
        });
        setNotification({
          open: true,
          text: err?.response?.data?.error || err?.response?.data || "",
        });
        setDisabled(false);
        setRtoken("");
        grecaptcha.reset();
      });
  }
  if (!localStorage.user) {
    return (
      <Navigate
        to={`/signin?continue=true&returnto=${encodeURIComponent(wholepath())}`}
        replace
      />
    );
  }
  const id = Number(params.id);
  menu && setMenu(false);
  document.title = "Comment | Metahkg";
  const small = width * 0.8 - 40 <= 450;
  return (
    <Box
      className="min-height-fullvh flex justify-center fullwidth align-center"
      sx={{
        bgcolor: "primary.dark",
      }}
    >
      <div style={{ width: width < 760 ? "100vw" : "80vw" }}>
        <div className="m20">
          <div className="flex align-center">
            <MetahkgLogo
              svg
              height={50}
              width={40}
              light
              className="mr10 mb10"
            />
            <h1 className="nomargin">Add comment</h1>
          </div>
          <h4 className="mt5 mb10 font-size-22">
            target: thread{" "}
            <Link to={`/thread/${id}`} target="_blank" rel="noreferrer">
              {id}
            </Link>
          </h4>
          {alert.text && (
            <Alert className="mt10 mb15" severity={alert.severity}>
              {alert.text}
            </Alert>
          )}
          <TextEditor
            key={id}
            text={inittext}
            changehandler={(v, e: any) => {
              setComment(e.getContent());
            }}
          />
          <div
            className={`mt20 ${
              small ? "" : "flex fullwidth justify-space-between"
            }`}
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
            <Button
              disabled={disabled || !comment || !rtoken}
              className="mt20 font-size-16 ac-btn"
              onClick={addcomment}
              variant="contained"
              color="secondary"
            >
              Comment
            </Button>
          </div>
        </div>
      </div>
    </Box>
  );
}
