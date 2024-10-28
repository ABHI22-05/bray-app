import { useState, useEffect } from 'react'

const Hero = () => {
  const [gamePhase, setGamePhase] = useState(() => {
    return localStorage.getItem('gamePhase') || 'setup'
  })
  const [players, setPlayers] = useState(() => {
    return JSON.parse(localStorage.getItem('players')) || ['', '', '', '']
  })
  const [scores, setScores] = useState(() => {
    return JSON.parse(localStorage.getItem('scores')) || [0, 0, 0, 0]
  })
  const [currentRoundScores, setCurrentRoundScores] = useState(() => {
    return JSON.parse(localStorage.getItem('currentRoundScores')) || ['', '', '', '']
  })
  const [gameOver, setGameOver] = useState(() => {
    return JSON.parse(localStorage.getItem('gameOver')) || false
  })
  const [loosers, setLoosers] = useState(() => {
    return JSON.parse(localStorage.getItem('loosers')) || []
  })
  const [rounds, setRounds] = useState(() => {
    return JSON.parse(localStorage.getItem('rounds')) || []
  })
  const [showRounds, setShowRounds] = useState(() => {
    return JSON.parse(localStorage.getItem('showRounds')) || false
  })
  const [showGameOverModal, setShowGameOverModal] = useState(() => {
    return JSON.parse(localStorage.getItem('showGameOverModal')) || false
  })
  const [showScoreWarning, setShowScoreWarning] = useState(() => {
    return JSON.parse(localStorage.getItem('showScoreWarning')) || false
  })
  const [minusFiveUsed, setMinusFiveUsed] = useState(() => {
    return JSON.parse(localStorage.getItem('minusFiveUsed')) || false
  })
  const [consecutiveZeros, setConsecutiveZeros] = useState(() => {
    return JSON.parse(localStorage.getItem('consecutiveZeros')) || [0, 0, 0, 0]
  })

  useEffect(() => {
    localStorage.setItem('gamePhase', gamePhase)
    localStorage.setItem('players', JSON.stringify(players))
    localStorage.setItem('scores', JSON.stringify(scores))
    localStorage.setItem('currentRoundScores', JSON.stringify(currentRoundScores))
    localStorage.setItem('gameOver', JSON.stringify(gameOver))
    localStorage.setItem('loosers', JSON.stringify(loosers))
    localStorage.setItem('rounds', JSON.stringify(rounds))
    localStorage.setItem('showRounds', JSON.stringify(showRounds))
    localStorage.setItem('showGameOverModal', JSON.stringify(showGameOverModal))
    localStorage.setItem('showScoreWarning', JSON.stringify(showScoreWarning))
    localStorage.setItem('minusFiveUsed', JSON.stringify(minusFiveUsed))
    localStorage.setItem('consecutiveZeros', JSON.stringify(consecutiveZeros))
  }, [gamePhase, players, scores, currentRoundScores, gameOver, loosers, rounds, showRounds, showGameOverModal, showScoreWarning, minusFiveUsed, consecutiveZeros])

  const handleNameChange = (index, value) => {
    const newPlayers = [...players]
    newPlayers[index] = value.charAt(0).toUpperCase() + value.slice(1)
    setPlayers(newPlayers)
  }

  const handleScoreSubmit = () => {
    // Calculate total of positive scores only
    const roundTotal = currentRoundScores.reduce((sum, score) => {
      const scoreNum = score === '' ? 0 : parseInt(score)
      return sum + (scoreNum > 0 ? scoreNum : 0)
    }, 0)

    // Check if any player has score >= 80
    const hasHighScorePlayer = scores.some(score => score >= 80)

    // Validate round total based on high score player
    if (hasHighScorePlayer) {
      if (roundTotal !== 25 && roundTotal !== 13) {
        setShowScoreWarning(true)
        return
      }
    } else if (roundTotal !== 25) {
      setShowScoreWarning(true)
      return
    }

    // Validate that players with score >= 80 only have positive or negative scores, not both
    let hasPositive = false
    let hasNegative = false
    currentRoundScores.forEach((score, index) => {
      if (scores[index] >= 80) {
        const scoreNum = score === '' ? 0 : parseInt(score)
        if (scoreNum > 0) hasPositive = true
        if (scoreNum < 0) hasNegative = true
      }
    })

    if (hasPositive && hasNegative) {
      setShowScoreWarning(true)
      return
    }

    const newScores = [...scores]
    const roundScores = [...currentRoundScores]
    const newLoosers = [...loosers]
    const newConsecutiveZeros = [...consecutiveZeros]
    
    currentRoundScores.forEach((score, index) => {
      const scoreToAdd = score === '' ? 0 : parseInt(score)
      newScores[index] = scores[index] + scoreToAdd
      
      // Update consecutive zeros
      if (scoreToAdd === 0) {
        newConsecutiveZeros[index]++
        if (newConsecutiveZeros[index] === 3) {
          newScores[index] -= 5
          newConsecutiveZeros[index] = 0
        }
      } else {
        newConsecutiveZeros[index] = 0
      }
      
      if (newScores[index] >= 100 && !newLoosers.includes(players[index])) {
        setGameOver(true)
        setShowGameOverModal(true)
        newLoosers.push(players[index])
      }
    })
    
    setScores(newScores)
    setLoosers(newLoosers)
    setRounds([...rounds, roundScores])
    setConsecutiveZeros(newConsecutiveZeros)
    setMinusFiveUsed(false)
    
    // Reset current round scores
    setCurrentRoundScores(['', '', '', ''])
  }

  const handleUndo = () => {
    if (rounds.length > 0) {
      const newRounds = [...rounds]
      const lastRound = newRounds.pop()
      const newScores = [...scores]
      
      lastRound.forEach((score, index) => {
        const scoreToSubtract = score === '' ? 0 : parseInt(score)
        newScores[index] = scores[index] - scoreToSubtract
      })
      
      // Remove from loosers if score goes below 100
      const newLoosers = loosers.filter(looser => {
        const playerIndex = players.indexOf(looser)
        return newScores[playerIndex] >= 100
      })
      
      setScores(newScores)
      setLoosers(newLoosers)
      setRounds(newRounds)
      setGameOver(newLoosers.length > 0)
      setMinusFiveUsed(false)
    }
  }

  const handleMinusFive = (index) => {
    if (!minusFiveUsed && scores[index] >= 5) {
      const newScores = [...scores]
      newScores[index] = scores[index] - 5
      
      if (newScores[index] < 100) {
        const newLoosers = loosers.filter(looser => looser !== players[index])
        setLoosers(newLoosers)
        setGameOver(newLoosers.length > 0)
      }
      
      setScores(newScores)
      setMinusFiveUsed(true)
    }
  }

  const handleRestart = () => {
    setGamePhase('setup')
    setPlayers(['', '', '', ''])
    setScores([0, 0, 0, 0])
    setCurrentRoundScores(['', '', '', ''])
    setGameOver(false)
    setLoosers([])
    setRounds([])
    setShowRounds(false)
    setShowGameOverModal(false)
    setShowScoreWarning(false)
    setMinusFiveUsed(false)
    setConsecutiveZeros([0, 0, 0, 0])
    
    // Clear localStorage on restart
    localStorage.clear()
  }

  if (gamePhase === 'setup') {
    return (
      <div className="p-8 max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4">Enter Player Names</h2>
        {players.map((player, index) => (
          <div key={index} className="mb-4">
            <input
              type="text"
              value={player}
              onChange={(e) => handleNameChange(index, e.target.value)}
              placeholder={`Player ${index + 1} name`}
              className="w-full p-2 border rounded bg-gray-700 border-gray-600"
            />
          </div>
        ))}
        <button
          onClick={() => setGamePhase('playing')}
          disabled={players.some(player => !player)}
          className="w-full bg-blue-600 text-white p-2 rounded disabled:bg-gray-500"
        >
          Next
        </button>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Game in Progress</h2>
      {showGameOverModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
            <p className="text-xl mb-4">Loosers: {loosers.join(', ')}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setShowGameOverModal(false)}
                className="bg-blue-600 text-white px-6 py-2 rounded"
              >
                OK
              </button>
              <button
                onClick={handleRestart}
                className="bg-green-600 text-white px-6 py-2 rounded"
              >
                Restart Game
              </button>
            </div>
          </div>
        </div>
      )}
      {showScoreWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Warning!</h2>
            <p className="text-xl mb-4">
              {scores.some(score => score >= 80) 
                ? "Total round score must be exactly 25 or 13. Players with score ≥80 can only have all positive or all negative scores."
                : "Total round score must be exactly 25"}
            </p>
            <button
              onClick={() => setShowScoreWarning(false)}
              className="bg-blue-600 text-white px-6 py-2 rounded"
            >
              OK
            </button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {players.map((player, index) => (
          <div key={index} className="p-4 border rounded border-gray-600">
            <h3 className={`text-xl font-bold mb-2 ${scores[index] >= 100 ? 'text-red-500' : ''}`}>{player}</h3>
            <p className="mb-2 text-2xl">Total Score: <span className='font-bold text-2xl'>{scores[index]}</span></p>
            <div className="flex gap-2">
              <input
                type="number"
                value={currentRoundScores[index]}
                onChange={(e) => {
                  const newScores = [...currentRoundScores]
                  const value = e.target.value
                  newScores[index] = value
                  setCurrentRoundScores(newScores)
                }}
                placeholder="Round score"
                className="w-full p-2 border rounded bg-gray-700 border-gray-600"
              />
              <button
                onClick={() => {
                  const minusFiveCount = currentRoundScores.filter(score => score === '-5').length;
                  if (minusFiveCount < 3) {
                    const newScores = [...currentRoundScores];
                    newScores[index] = '-5';
                    setCurrentRoundScores(newScores);
                  }
                }}
                className={`text-white px-4 py-2 rounded ${
                  currentRoundScores[index] !== '' || 
                  currentRoundScores.filter(score => score === '-5').length >= 3 
                    ? 'bg-gray-600' 
                    : 'bg-blue-600'
                }`}
                disabled={currentRoundScores[index] !== '' || currentRoundScores.filter(score => score === '-5').length >= 3}
              >
                -5
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2 justify-center">
        <button
          onClick={handleScoreSubmit}
          className="bg-green-600 text-white px-6 py-2 rounded"
        >
          Add Round
        </button>
        <button
          onClick={handleUndo}
          className="bg-yellow-600 text-white px-6 py-2 rounded"
          disabled={rounds.length === 0}
        >
          Undo Round
        </button>
        <button
          onClick={() => setShowRounds(!showRounds)}
          className="bg-blue-600 text-white px-6 py-2 rounded"
        >
          {showRounds ? 'Hide Rounds' : 'Show Rounds'}
        </button>
        <button
          onClick={handleRestart}
          className="bg-red-600 text-white px-6 py-2 rounded"
        >
          Restart
        </button>
      </div>
      {showRounds && (
        <div className="mt-4">
          <h3 className="text-xl font-bold mb-2">Round History</h3>
          <div className="grid grid-cols-1 gap-2">
            <div className="grid grid-cols-4 gap-2">
              {players.map((player, index) => (
                <div key={index} className={`font-bold text-center ${scores[index] >= 100 ? 'text-red-500' : ''}`}>
                  {player}
                </div>
              ))}
            </div>
            {rounds.map((round, roundIndex) => (
              <div key={roundIndex} className="grid grid-cols-4 gap-2 p-2 border rounded border-gray-600">
                {round.map((score, playerIndex) => (
                  <div key={playerIndex} className={`text-center ${scores[playerIndex] >= 100 ? 'text-red-500' : ''}`}>
                    Round {roundIndex + 1}: {score || '0'}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Hero
