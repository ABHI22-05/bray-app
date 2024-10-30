import { useState, useEffect } from 'react'

const Hero = () => {
  const initialState = {
    gamePhase: localStorage.getItem('gamePhase') || 'setup',
    players: JSON.parse(localStorage.getItem('players')) || ['', '', '', ''],
    scores: JSON.parse(localStorage.getItem('scores')) || [0, 0, 0, 0],
    currentRoundScores: JSON.parse(localStorage.getItem('currentRoundScores')) || ['', '', '', ''],
    gameOver: JSON.parse(localStorage.getItem('gameOver')) || false,
    loosers: JSON.parse(localStorage.getItem('loosers')) || [],
    rounds: JSON.parse(localStorage.getItem('rounds')) || [],
    showRounds: JSON.parse(localStorage.getItem('showRounds')) || false,
    showGameOverModal: JSON.parse(localStorage.getItem('showGameOverModal')) || false,
    showScoreWarning: JSON.parse(localStorage.getItem('showScoreWarning')) || false,
    minusFiveUsed: JSON.parse(localStorage.getItem('minusFiveUsed')) || false,
    consecutiveZeros: JSON.parse(localStorage.getItem('consecutiveZeros')) || [0, 0, 0, 0]
  }

  const [gamePhase, setGamePhase] = useState(initialState.gamePhase)
  const [players, setPlayers] = useState(initialState.players)
  const [scores, setScores] = useState(initialState.scores)
  const [currentRoundScores, setCurrentRoundScores] = useState(initialState.currentRoundScores)
  const [gameOver, setGameOver] = useState(initialState.gameOver)
  const [loosers, setLoosers] = useState(initialState.loosers)
  const [rounds, setRounds] = useState(initialState.rounds)
  const [showRounds, setShowRounds] = useState(initialState.showRounds)
  const [showGameOverModal, setShowGameOverModal] = useState(initialState.showGameOverModal)
  const [showScoreWarning, setShowScoreWarning] = useState(initialState.showScoreWarning)
  const [minusFiveUsed, setMinusFiveUsed] = useState(initialState.minusFiveUsed)
  const [consecutiveZeros, setConsecutiveZeros] = useState(initialState.consecutiveZeros)

  useEffect(() => {
    const state = {
      gamePhase,
      players,
      scores,
      currentRoundScores,
      gameOver,
      loosers,
      rounds,
      showRounds,
      showGameOverModal,
      showScoreWarning,
      minusFiveUsed,
      consecutiveZeros
    }

    Object.entries(state).forEach(([key, value]) => {
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
    })
  }, [gamePhase, players, scores, currentRoundScores, gameOver, loosers, rounds, showRounds, showGameOverModal, showScoreWarning, minusFiveUsed, consecutiveZeros])

  const handleNameChange = (index, value) => {
    const newPlayers = [...players]
    newPlayers[index] = value.charAt(0).toUpperCase() + value.slice(1)
    setPlayers(newPlayers)
  }
  const handleScoreSubmit = () => {
    // Calculate total of positive scores only
    const roundTotal = currentRoundScores.reduce((sum, score) => {
      let scoreNum = score === '' ? 0 : parseInt(score)
      // If score is -5 and current total is less than 5, keep score at 0
      if (scoreNum === -5 && sum < 5) {
        scoreNum = 0
      }
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

    // For round total of 25, validate that at least one player has score > 11
    if (roundTotal === 25) {
      const hasPlayerOverEleven = currentRoundScores.some(score => {
        const scoreNum = score === '' ? 0 : parseInt(score)
        return scoreNum > 11
      })
      
      if (!hasPlayerOverEleven) {
        setShowScoreWarning(true)
        return
      }
    }

    // Validate that players with score >= 80 only have positive scores
    let hasNegative = false
    currentRoundScores.forEach((score, index) => {
      if (scores[index] >= 80) {
        const scoreNum = score === '' ? 0 : parseInt(score)
        // For players at/above 80, only check if positive score is 13 or ignore negative
        if (scoreNum > 0 && scoreNum !== 13) {
          hasNegative = true
        }
      }
    })

    if (hasNegative) {
      setShowScoreWarning(true)
      return
    }

    const newScores = [...scores]
    const roundScores = [...currentRoundScores]
    const newLoosers = [...loosers]
    const newConsecutiveZeros = [...consecutiveZeros]
    
    currentRoundScores.forEach((score, index) => {
      const scoreToAdd = score === '' ? 0 : parseInt(score)
      // Prevent negative scores when current score is 0
      if (scores[index] === 0 && scoreToAdd < 0) {
        newScores[index] = 0
      } else {
        newScores[index] = scores[index] + scoreToAdd
      }
      
      // Update consecutive zeros
      if (scoreToAdd === 0) {
        newConsecutiveZeros[index]++
        if (newConsecutiveZeros[index] === 3) {
          // If score is less than 5, keep previous score, otherwise subtract 5
          if (newScores[index] < 5) {
            newScores[index] = scores[index]
          } else {
            newScores[index] = newScores[index] - 5
          }
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
    const newCurrentRoundScores = [...currentRoundScores];
    newCurrentRoundScores[index] = '-5';
    setCurrentRoundScores(newCurrentRoundScores);
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
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-400">Enter Player Names</h2>
        {players.map((player, index) => (
          <div key={index} className="mb-6">
            <input
              type="text"
              value={player}
              onChange={(e) => handleNameChange(index, e.target.value)}
              placeholder={`Player ${index + 1} name`}
              className="w-full p-3 border-2 rounded-lg bg-gray-800 border-gray-600 focus:border-blue-500 focus:outline-none transition duration-200"
            />
          </div>
        ))}
        <button
          onClick={() => setGamePhase('playing')}
          disabled={players.some(player => !player)}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white p-3 rounded-lg font-bold shadow-lg hover:from-blue-600 hover:to-blue-800 transition duration-200 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed"
        >
          Start Game
        </button>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-400">Game in Progress</h2>
      
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {players.map((player, index) => (
          <div key={index} className="p-6 border-2 rounded-xl border-gray-600 bg-gray-800/50 backdrop-blur-sm shadow-xl">
            <h3 className={`text-2xl font-bold mb-3 ${scores[index] >= 100 ? 'text-red-400' : 'text-blue-400'}`}>{player}</h3>
            <p className="mb-4 text-2xl">Total Score: <span className='font-bold text-3xl'>{scores[index]}</span></p>
            <div className="flex gap-3">
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
                className="w-full p-3 border-2 rounded-lg bg-gray-700 border-gray-600 focus:border-blue-500 focus:outline-none transition duration-200"
              />
              <button
                onClick={() => handleMinusFive(index)}
                className={`text-white px-6 py-3 rounded-lg font-bold shadow-lg transition duration-200 ${
                  currentRoundScores[index] !== '' || 
                  scores[index] < 5 ||
                  currentRoundScores.filter(score => score === '-5').length >= 3
                    ? 'bg-gray-600' 
                    : 'bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800'
                }`}
                disabled={currentRoundScores[index] !== '' || 
                         scores[index] < 5 ||
                         currentRoundScores.filter(score => score === '-5').length >= 3}
              >
                -5
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-4 justify-center">
        <button
          onClick={handleScoreSubmit}
          className="bg-gradient-to-r from-green-500 to-green-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:from-green-600 hover:to-green-800 transition duration-200"
        >
          Add Round
        </button>
        <button
          onClick={handleUndo}
          className="bg-gradient-to-r from-yellow-500 to-yellow-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:from-yellow-600 hover:to-yellow-800 transition duration-200 disabled:opacity-50"
          disabled={rounds.length === 0}
        >
          Undo Round
        </button>
        <button
          onClick={() => setShowRounds(!showRounds)}
          className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:from-blue-600 hover:to-blue-800 transition duration-200"
        >
          {showRounds ? 'Hide Rounds' : 'Show Rounds'}
        </button>
        <button
          onClick={handleRestart}
          className="bg-gradient-to-r from-red-500 to-red-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:from-red-600 hover:to-red-800 transition duration-200"
        >
          Restart
        </button>
      </div>
      {showRounds && (
        <div className="mt-8">
          <h3 className="text-2xl font-bold mb-4 text-center text-blue-400">Round History</h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-4 gap-4">
              {players.map((player, index) => (
                <div key={index} className={`font-bold text-center text-lg ${scores[index] >= 100 ? 'text-red-400' : 'text-blue-400'}`}>
                  {player}
                </div>
              ))}
            </div>
            {rounds.map((round, roundIndex) => (
              <div key={roundIndex} className="grid grid-cols-4 gap-4 p-4 border-2 rounded-xl border-gray-600 bg-gray-800/50 backdrop-blur-sm shadow-xl">
                {round.map((score, playerIndex) => (
                  <div key={playerIndex} className={`text-center text-lg ${scores[playerIndex] >= 100 ? 'text-red-400' : 'text-gray-300'}`}>
                    Round {roundIndex + 1}: {score === '-5' ? '-5' : score || '0'}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
      {showScoreWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-gray-800 p-8 rounded-xl shadow-2xl text-center max-w-md w-full">
            <h2 className="text-3xl font-bold mb-4 text-yellow-400">Warning!</h2>
            <p className="text-xl mb-6 text-gray-300">
              {scores.some(score => score >= 80) 
                ? "Total round score must be exactly 25 or 13. Players with score ≥80 can only have all positive or all negative scores."
                : currentRoundScores.reduce((sum, score) => sum + (score === '' ? 0 : parseInt(score)), 0) === 25 && !currentRoundScores.some(score => (score === '' ? 0 : parseInt(score)) > 11)
                  ? "For a round total of 25, at least one player must have a score greater than 11"
                  : "Total round score must be exactly 25"}
            </p>
            <button
              onClick={() => setShowScoreWarning(false)}
              className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:from-blue-600 hover:to-blue-800 transition duration-200 z-50"
            >
              OK
            </button>
          </div>
        </div>
      )}
      {showGameOverModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-gray-800 p-8 rounded-xl shadow-2xl text-center max-w-md w-full">
            <h2 className="text-3xl font-bold mb-4 text-red-400">Game Over!</h2>
            <p className="text-xl mb-6 text-gray-300">Loosers: {loosers.join(', ')}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setShowGameOverModal(false)}
                className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:from-blue-600 hover:to-blue-800 transition duration-200"
              >
                OK
              </button>
              <button
                onClick={handleRestart}
                className="bg-gradient-to-r from-green-500 to-green-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:from-green-600 hover:to-green-800 transition duration-200"
              >
                Restart Game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Hero
