import { useState } from "react";

function QuizForm({ onSubmitGuess }) {
  const [guess, setGuess] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmitGuess(Number(guess));
    setGuess("");
  };

  return (
    <div>
      <h2>Arvaa tuotteen hinta</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="number"
          value={guess}
          onChange={(event) =>
            setGuess(event.target.value)
          }
          placeholder="Anna arvio (€)"
          required
        />

        <button type="submit">
          Lähetä arvaus
        </button>
      </form>
    </div>
  );
}

export default QuizForm;