
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  arrayUnion,
  onSnapshot,
  query,
  where,
  getDocs,
  limit,
  getDoc
} from "firebase/firestore";

import { db } from "./firebase";

export async function createSession() {

  const newSession = {
    status: "waiting",
    players: [],
    currentRound: 1,
    maxRounds: 3,
    correctPrice: null,
    currentProduct: null,
    winnerCodename: null
  };

  const docRef = await addDoc(
    collection(
      db,
      "gameSessions"
    ),
    newSession
  );

  return {
    id: docRef.id,
    ...newSession
  };
}

export async function joinSession(
  sessionId,
  player
) {

  const sessionRef =
    doc(
      db,
      "gameSessions",
      sessionId
    );

  await updateDoc(
    sessionRef,
    {
      players: arrayUnion(player)
    }
  );
}
export function listenToSession(
  sessionId,
  callback
) {

  return onSnapshot(
    doc(
      db,
      "gameSessions",
      sessionId
    ),
    (snapshot) => {

      callback({
        id: snapshot.id,
        ...snapshot.data()
      });

    }
  );
}
export async function getWaitingSession() {

  const sessionQuery =
    query(
      collection(
        db,
        "gameSessions"
      ),
      where(
        "status",
        "==",
        "waiting"
      ),
      limit(1)
    );

  const snapshot =
    await getDocs(
      sessionQuery
    );

  if (
    snapshot.empty
  ) {
    return null;
  }

  const document =
    snapshot.docs[0];

  return {
    id: document.id,
    ...document.data()
  };
}
export async function updatePlayerScore(
  sessionId,
  uid,
  points
) {

  const sessionRef =
    doc(
      db,
      "gameSessions",
      sessionId
    );

  const sessionSnap =
    await getDoc(
      sessionRef
    );

  const session =
    sessionSnap.data();

  const updatedPlayers =
    session.players.map(
      (player) => {

        if (
          player.uid === uid
        ) {

          return {
            ...player,
            score:
              player.score +
              points
          };

        }

        return player;

      }
    );

  await updateDoc(
    sessionRef,
    {
      players:
        updatedPlayers
    }
  );
}
