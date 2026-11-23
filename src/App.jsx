import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

import QuizForm from "./components/QuizFormA.jsx";
import RoundResult from "./components/RoundResult.jsx";
import { fetchRandomProduct } from "./ProductService.js";
import { calculatePoints } from "./gameController.js";
import LoginForm from "./LoginForm";
import { auth, logout } from "./authService";
import {
  createSession,
  joinSession,
  listenToSession,
  getWaitingSession,
  updatePlayerScore
} from "./gameSessionService";

function App() {
  const [user, setUser] = useState(null);
  const [codename, setCodename] = useState("");
  const [guess, setGuess] = useState(null);
  const [product, setProduct] = useState(null);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
    const [session, setSession] = useState(null);

  const generateCodename = () => {
    const adjectives = [
      "Sneaky",
      "Silent",
      "Crazy",
      "Fast",
      "Happy",
    ];

    const animals = [
      "Panda",
      "Wolf",
      "Tiger",
      "Fox",
      "Eagle",
    ];

    const adjective =
      adjectives[Math.floor(Math.random() * adjectives.length)];

    const animal =
      animals[Math.floor(Math.random() * animals.length)];

    const number =
      Math.floor(Math.random() * 100);

    return `${adjective}${animal}${number}`;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        setUser(firebaseUser);

        if (firebaseUser) {

  let activeSession =
  await getWaitingSession();

if (!activeSession) {

  activeSession =
    await createSession();

}

setSession(activeSession);

  const key = `codename_${firebaseUser.uid}`;

          let name = localStorage.getItem(key);

          if (!name) {
            name = generateCodename();

            localStorage.setItem(key, name);
          }

          setCodename(name);

console.log(
  "JOINING SESSION",
  activeSession.id,
  firebaseUser.uid,
  name
);

await joinSession(
  activeSession.id,
  {
    uid: firebaseUser.uid,
    codename: name,
    score: 0,
    guess: null
  }
);
        }
      }
    );

    return () => unsubscribe();
  }, []);
  useEffect(() => {
  async function loadProduct() {

    const randomProduct =
      await fetchRandomProduct();

    setProduct(randomProduct);
  }

  loadProduct();

}, []);
useEffect(() => {

  if (!session) return;

  const unsubscribe =
    listenToSession(
      session.id,
      (updatedSession) => {

        setSession(
          updatedSession
        );

      }
    );

  return () =>
    unsubscribe();

}, [session]);
useEffect(() => {
  if (guess !== null && product) {

    const points = calculatePoints(
      guess,
      product.price
    );

    if (
      user &&
      session
    ) {

      updatePlayerScore(
        session.id,
        user.uid,
        points
      );

    }

    setScore((prev) => prev + points);

  }

}, [guess, product]);


async function nextRound() {

  if (round >= 3) {

  const winner =
    session?.players
      ?.slice()
      ?.sort(
        (a, b) =>
          b.score - a.score
      )[0];

  alert(
    `Peli päättyi!

Voittaja:
${winner?.codename}

Pisteet:
${winner?.score}`
  );

  return;
}

  const randomProduct =
    await fetchRandomProduct();

  setProduct(randomProduct);

  setGuess(null);

  setRound(round + 1);
}
  return (
    <div>
      <h1>Firebase Login Demo</h1>

      {user ? (
        <>
          <p>👋 Tervetuloa, {codename}</p>
          <p>Kierros: {round}</p>
          <p>Pisteet: {Math.round(score)}</p>
          {session && (
  <>
    <p>
      Pelisessio:
      {session.id}
    </p>

    <p>
      Pelaajia:
      {session.players?.length || 0}
    </p>
  </>
)}
{session?.players?.length > 0 && (
  <>
    <h3>Pelaajat</h3>

    <ul>
      {session.players.map(
        (player) => (
          <li key={player.uid}>
            {player.codename}
            {" - "}
            pisteet:
            {" "}
            {player.score}
          </li>
        )
      )}
    </ul>
  </>
)}


          <button onClick={logout}>
            Kirjaudu ulos
          </button>

          {product && (
  <>
    <h2>{product.title}</h2>

    <img
      src={product.thumbnail}
      alt={product.title}
      width="200"
    />

    <QuizForm
      onSubmitGuess={setGuess}
    />
  </>
)}

          {guess && (
  <RoundResult
    guess={guess}
    correctPrice={product.price}
    onNextRound={nextRound}
  />
)}
        </>
      ) : (
        <LoginForm />
      )}
    </div>
  );
}

export default App;