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
  hint: '다시 생각해보세요 — 계산대에서 자주 쓰는 표현이에요.',
  explanation:
    '"You all set?" means "are you ready to check out?" — it\'s not about your health.',
}

interface QuestScreenProps {
  onContinue: () => void
}

function QuestScreen({ onContinue }: QuestScreenProps) {
  const [wrongIds, setWrongIds] = useState<string[]>([])
  const [correct, setCorrect] = useState(false)

  const handleSelect = (answer: (typeof quest.answers)[number]) => {
    if (correct || wrongIds.includes(answer.id)) return

    if (answer.correct) {
      setCorrect(true)
    } else {
      setWrongIds((prev) => [...prev, answer.id])
    }
  }

  const handleRetry = () => {
    setWrongIds([])
  }

  return (
    <div className="app">
      <div className="logo">SoundNative</div>
      <h1 className="headline">Sound like a native</h1>

      <div className="quest-card">
        <div className="quest-label">{quest.label}</div>
        <div className="quest-phrase">"{quest.phrase}"</div>

        <div className="answers">
          {quest.answers.map((answer) => {
            const isWrongPick = wrongIds.includes(answer.id)

            let stateClass = ''
            if (correct) {
              stateClass = answer.correct ? 'correct' : isWrongPick ? 'incorrect' : 'muted'
            } else if (isWrongPick) {
              stateClass = 'incorrect'
            }

            return (
              <button
                key={answer.id}
                className={`answer-button ${stateClass}`.trim()}
                disabled={correct || isWrongPick}
                onClick={() => handleSelect(answer)}
              >
                {answer.text}
              </button>
            )
          })}
        </div>

        {!correct && wrongIds.length > 0 && (
          <div className="quest-hint">
            <div className="quest-hint-text">{quest.hint}</div>
            <button className="quest-retry-button" onClick={handleRetry}>
              다시 시도
            </button>
          </div>
        )}

        {correct && (
          <div className="result">
            <div className="result-status">Correct!</div>
            <div className="result-explanation">{quest.explanation}</div>
            <button className="continue-button" onClick={onContinue}>
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default QuestScreen
