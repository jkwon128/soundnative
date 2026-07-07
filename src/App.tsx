import { useState } from 'react'
import './App.css'

const quest = {
  label: 'The cashier says',
  phrase: 'You all set?',
  answers: [
    { id: 'a', text: 'Are you feeling okay?', correct: false },
    { id: 'b', text: 'Are you ready to check out?', correct: true },
    { id: 'c', text: 'Is it sold out?', correct: false },
  ],
  explanation:
    '"You all set?" means "are you ready to check out?" — it\'s not about your health.',
}

function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selectedAnswer = quest.answers.find((a) => a.id === selectedId)

  return (
    <div className="app">
      <div className="logo">SoundNative</div>
      <h1 className="headline">Sound like a native</h1>

      <div className="quest-card">
        <div className="quest-label">{quest.label}</div>
        <div className="quest-phrase">"{quest.phrase}"</div>

        <div className="answers">
          {quest.answers.map((answer) => (
            <button
              key={answer.id}
              className="answer-button"
              disabled={selectedAnswer !== undefined}
              onClick={() => setSelectedId(answer.id)}
            >
              {answer.text}
            </button>
          ))}
        </div>

        {selectedAnswer && (
          <div className="result">
            <div className="result-status">
              {selectedAnswer.correct ? 'Correct!' : 'Not quite.'}
            </div>
            <div className="result-explanation">{quest.explanation}</div>
            <button
              className="continue-button"
              onClick={() => setSelectedId(null)}
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
