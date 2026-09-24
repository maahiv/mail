import { useCallback } from "react";
import {
  ref,
  query,
  orderByChild,
  equalTo,
  get,
  update,
  remove,
  push,
  set
} from "firebase/database";

import { db } from "./firebase";

function useHttp() {
  const fetchInbox = useCallback(async (email) => {
    const inboxQuery = query(
      ref(db, "emails"),
      orderByChild("receiver"),
      equalTo(email.toLowerCase())
    );

    const snapshot = await get(inboxQuery);
    const mails = [];

    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        const data = child.val();

        mails.push({
          id: child.key,
          ...data,
          read: data.read === true
        });
      });
    }

    mails.sort((a, b) => b.createdAt - a.createdAt);

    return mails;
  }, []);

  const fetchSentMails = useCallback(async (email) => {
    const sentQuery = query(
      ref(db, "emails"),
      orderByChild("sender"),
      equalTo(email.toLowerCase())
    );

    const snapshot = await get(sentQuery);
    const mails = [];

    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        mails.push({
          id: child.key,
          ...child.val()
        });
      });
    }

    mails.sort((a, b) => b.createdAt - a.createdAt);

    return mails;
  }, []);

  const sendMail = useCallback(
    async (sender, receiver, subject, body) => {
      const newMailRef = push(ref(db, "emails"));

      await set(newMailRef, {
        sender: sender.toLowerCase(),
        receiver: receiver.trim().toLowerCase(),
        subject: subject.trim(),
        body,
        createdAt: Date.now(),
        read: false
      });
    },
    []
  );

  const markAsRead = useCallback(async (mailId) => {
    await update(ref(db, `emails/${mailId}`), {
      read: true
    });
  }, []);

  const deleteMail = useCallback(async (mailId) => {
    await remove(ref(db, `emails/${mailId}`));
  }, []);

  return {
    fetchInbox,
    fetchSentMails,
    sendMail,
    markAsRead,
    deleteMail
  };
}

export default useHttp;