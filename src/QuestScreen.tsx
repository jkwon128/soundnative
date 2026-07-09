import { useState } from 'react'
import './App.css'
import { quizQuestions } from './quizData'

interface QuestScreenProps {
  onContinue: () => void
}

function QuestScreen({ onContinue }: QuestScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [wrongChoices, setWrongChoices] = useState<number[]>([])
  const [correct, setCorrect] = useState(false)

  const isComplete = currentIndex >= quizQuestions.length
  const quest = quizQuestions[currentIndex]

  const handleSelect = (choiceIndex: number) => {
    if (correct || wrongChoices.includes(choiceIndex)) return

    if (choiceIndex === quest.answer) {
      setCorrect(true)
    } else {
      setWrongChoices((prev) => [...prev, choiceIndex])
    }
  }

  const handleRetry = () => {
    setWrongChoices([])
  }

  const handleNext = () => {
    setCurrentIndex((prev) => prev + 1)
    setWrongChoices([])
    setCorrect(false)
  }

  if (isComplete) {
    return (
      <div className="app">
        <div className="logo">SoundNative</div>
        <h1 className="headline">Sound like a native</h1>

        <div className="quest-card">
          <div className="quest-complete-title">오늘의 퀘스트 완료!</div>
          <div className="quest-complete-text">
            오늘 준비한 문제를 모두 풀었어요. 잘하셨어요!
          </div>
          <button className="continue-button" onClick={onContinue}>
            Continue
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="logo">SoundNative</div>
      <h1 className="headline">Sound like a native</h1>

      <div className="quest-card">
        <div className="quest-label">{quest.situation}</div>
        <div className="quest-phrase">"{quest.phrase}"</div>

        <div className="answers">
          {quest.choices.map((choice, index) => {
            const isWrongPick = wrongChoices.includes(index)
            const isCorrectChoice = index === quest.answer

            let stateClass = ''
            if (correct) {
              stateClass = isCorrectChoice ? 'correct' : isWrongPick ? 'incorrect' : 'muted'
            } else if (isWrongPick) {
              stateClass = 'incorrect'
            }

            return (
              <button
                key={index}
                className={`answer-button ${stateClass}`.trim()}
                disabled={correct || isWrongPick}
                onClick={() => handleSelect(index)}
              >
                {choice}
              </button>
            )
          })}
        </div>

        {!correct && wrongChoices.length > 0 && (
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
            <button className="continue-button" onClick={handleNext}>
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default QuestScreen
