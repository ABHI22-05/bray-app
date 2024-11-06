import { useState, useEffect } from 'react'
import { jsPDF } from 'jspdf'

const Hero = () => {
  const initialState = {
    gamePhase: localStorage.getItem('gamePhase') || 'setup',
    players: JSON.parse(localStorage.getItem('players')) || ['', '', '', ''],
    scores: JSON.parse(localStorage.getItem('scores')) || [0, 0, 0, 0],
    currentRoundScores: JSON.parse(localStorage.getItem('currentRoundScores')) || ['', '', '', ''],
    gameOver: JSON.parse(localStorage.getItem('gameOver')) || false,
    losers: JSON.parse(localStorage.getItem('losers')) || [],
    rounds: JSON.parse(localStorage.getItem('rounds')) || [],
    showRounds: JSON.parse(localStorage.getItem('showRounds')) || false,
    showGameOverModal: JSON.parse(localStorage.getItem('showGameOverModal')) || false,
    showScoreWarning: JSON.parse(localStorage.getItem('showScoreWarning')) || false,
    showSuccessModal: JSON.parse(localStorage.getItem('showSuccessModal')) || false,
    minusFiveUsed: JSON.parse(localStorage.getItem('minusFiveUsed')) || false,
    consecutiveZeros: JSON.parse(localStorage.getItem('consecutiveZeros')) || [0, 0, 0, 0],
    brayUsed: JSON.parse(localStorage.getItem('brayUsed')) || false
  }

  const [gamePhase, setGamePhase] = useState(initialState.gamePhase)
  const [players, setPlayers] = useState(initialState.players)
  const [scores, setScores] = useState(initialState.scores)
  const [currentRoundScores, setCurrentRoundScores] = useState(initialState.currentRoundScores)
  const [gameOver, setGameOver] = useState(initialState.gameOver)
  const [losers, setLosers] = useState(initialState.losers)
  const [rounds, setRounds] = useState(initialState.rounds)
  const [showRounds, setShowRounds] = useState(initialState.showRounds)
  const [showGameOverModal, setShowGameOverModal] = useState(initialState.showGameOverModal)
  const [showScoreWarning, setShowScoreWarning] = useState(initialState.showScoreWarning)
  const [showSuccessModal, setShowSuccessModal] = useState(initialState.showSuccessModal)
  const [minusFiveUsed, setMinusFiveUsed] = useState(initialState.minusFiveUsed)
  const [consecutiveZeros, setConsecutiveZeros] = useState(initialState.consecutiveZeros)
  const [playersWithMinusFive, setPlayersWithMinusFive] = useState([])
  const [brayUsed, setBrayUsed] = useState(initialState.brayUsed)

  useEffect(() => {
    const state = {
      gamePhase,
      players,
      scores,
      currentRoundScores,
      gameOver,
      losers,
      rounds,
      showRounds,
      showGameOverModal,
      showScoreWarning,
      showSuccessModal,
      minusFiveUsed,
      consecutiveZeros,
      brayUsed
    }

    Object.entries(state).forEach(([key, value]) => {
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
    })
  }, [gamePhase, players, scores, currentRoundScores, gameOver, losers, rounds, showRounds,
    showGameOverModal, showScoreWarning, showSuccessModal, minusFiveUsed, consecutiveZeros, brayUsed])

  const downloadPDF = () => {
    // Check if file was recently downloaded
    const lastDownloadTime = localStorage.getItem('lastPdfDownload')
    const now = Date.now()
    
    if (lastDownloadTime && now - parseInt(lastDownloadTime) < 5000) { // Within last 5 seconds
      const confirmDownload = window.confirm('You recently downloaded this history. Do you want to download it again?')
      if (!confirmDownload) {
        return
      }
    }

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })
    
    let yPos = 30

    // Add title with styling
    doc.setFontSize(24)
    doc.setTextColor(0, 102, 204) // Blue title
    doc.text('Game History', doc.internal.pageSize.width / 2, yPos, { align: 'center' })
    yPos += 25

    // Add decorative line under title
    doc.setDrawColor(0, 102, 204)
    doc.setLineWidth(0.5)
    doc.line(30, yPos, doc.internal.pageSize.width - 30, yPos)
    yPos += 20

    // Calculate column widths and positions
    const margin = 30
    const usableWidth = doc.internal.pageSize.width - (2 * margin)
    const columnWidth = usableWidth / 4
    
    // Add player names in a row with styling
    doc.setFontSize(16)
    doc.setTextColor(51, 51, 51) // Dark gray
    players.forEach((player, index) => {
      const xPos = margin + (columnWidth * index) + (columnWidth / 2)
      const isLoser = losers.includes(player)
      if (isLoser) {
        doc.setTextColor(204, 51, 51) // Softer red for losers
      }
      doc.setFont("helvetica", "bold")
      doc.text(player, xPos, yPos, { align: 'center' })
      doc.setTextColor(51, 51, 51)
      doc.setFont("helvetica", "normal")
    })
    yPos += 15

    // Add subtle grid background
    doc.setDrawColor(230, 230, 230)
    doc.setLineWidth(0.1)

    // Add round scores under each player
    doc.setFontSize(12)
    rounds.forEach((round, roundIndex) => {
      // Alternate row background
      if (roundIndex % 2 === 0) {
        doc.setFillColor(247, 247, 247)
        doc.rect(margin - 15, yPos - 5, usableWidth + 30, 10, 'F')
      }

      doc.setTextColor(128, 128, 128) // Gray for round numbers
      doc.text(`Round ${roundIndex + 1}`, margin - 15, yPos)
      
      round.forEach((score, playerIndex) => {
        const xPos = margin + (columnWidth * playerIndex) + (columnWidth / 2)
        const isLoser = losers.includes(players[playerIndex])
        if (isLoser) {
          doc.setTextColor(204, 51, 51)
        } else {
          doc.setTextColor(51, 51, 51)
        }
        const scoreText = score.toString() || '0'
        doc.text(scoreText, xPos, yPos, { align: 'center' })
      })
      yPos += 10

      // Add new page if needed
      if (yPos > doc.internal.pageSize.height - 30) {
        doc.addPage()
        yPos = 30
      }
    })

    // Add total scores at bottom
    yPos += 10
    doc.setDrawColor(0, 102, 204)
    doc.setLineWidth(0.5)
    doc.line(margin, yPos, doc.internal.pageSize.width - margin, yPos)
    yPos += 15

    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    scores.forEach((totalScore, index) => {
      const xPos = margin + (columnWidth * index) + (columnWidth / 2)
      const isLoser = losers.includes(players[index])
      if (isLoser) {
        doc.setTextColor(204, 51, 51)
      } else {
        doc.setTextColor(0, 102, 204)
      }
      const scoreText = `Total: ${totalScore}`
      doc.text(scoreText, xPos, yPos, { align: 'center' })
    })

    // Save the PDF and record download time
    doc.save('game-history.pdf')
    localStorage.setItem('lastPdfDownload', now.toString())
  }

  const handleNameChange = (index, value) => {
    const newPlayers = [...players]
    newPlayers[index] = value.charAt(0).toUpperCase() + value.slice(1)
    setPlayers(newPlayers)
  }

  const handleScoreSubmit = () => {
    const roundTotal = currentRoundScores.reduce((sum, score) => {
      let scoreNum = score === '' ? 0 : parseInt(score)
      return sum + (scoreNum > 0 ? scoreNum : 0)
    }, 0)

    const hasHighScorePlayer = scores.some(score => score >= 80)

    if (hasHighScorePlayer) {
      if (roundTotal !== 25 && roundTotal !== 13) {
        setShowScoreWarning(true)
        return
      }
    } else if (roundTotal !== 25) {
      setShowScoreWarning(true)
      return
    }

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

    let hasInvalidScore = false
    currentRoundScores.forEach((score, index) => {
      const scoreNum = score === '' ? 0 : parseInt(score)
      if (scores[index] >= 80 && Math.abs(scoreNum) > 13) {
        hasInvalidScore = true
      }
    })

    if (hasInvalidScore) {
      setShowScoreWarning(true)
      return
    }

    const newScores = [...scores]
    const roundScores = [...currentRoundScores]
    const newLosers = [...losers]
    const newConsecutiveZeros = [...consecutiveZeros]
    const newPlayersWithMinusFive = []

    currentRoundScores.forEach((score, index) => {
      const scoreToAdd = score === '' ? 0 : parseInt(score)
      if (scores[index] === 0 && scoreToAdd < 0) {
        newScores[index] = 0
      } else {
        newScores[index] = scores[index] + scoreToAdd
      }

      if (scoreToAdd === 0) {
        if (scores[index] < 80) {
          newConsecutiveZeros[index]++
          if (newConsecutiveZeros[index] === 3 && scores[index] >= 5) {
            newScores[index] = newScores[index] - 5
            newConsecutiveZeros[index] = 0
            newPlayersWithMinusFive.push(players[index])
            roundScores[index] = '-5'
          }
        }
      } else {
        newConsecutiveZeros[index] = 0
      }

      if (newScores[index] >= 100) {
        if (!newLosers.includes(players[index])) {
          newLosers.push(players[index])
        }
      }
    })

    setScores(newScores)
    setLosers(newLosers)
    setRounds([...rounds, roundScores])
    setConsecutiveZeros(newConsecutiveZeros)
    setMinusFiveUsed(false)
    setBrayUsed(false)

    if (newPlayersWithMinusFive.length > 0) {
      setPlayersWithMinusFive(newPlayersWithMinusFive)
      setShowSuccessModal(true)
    }

    if (newLosers.length > 0) {
      setGameOver(true)
      setShowGameOverModal(true)
    }

    setCurrentRoundScores(['', '', '', ''])
  }

  const handleBray = () => {
    const playersOver80 = scores.filter(score => score >= 80).length
    if (playersOver80 !== 2) return

    const roundTotal = currentRoundScores.reduce((sum, score) =>
      sum + (score === '' ? 0 : parseInt(score)), 0
    )

    if (roundTotal !== 13) {
      setShowScoreWarning(true)
      return
    }

    const highScorePlayers = scores.map((score, index) => ({
      index,
      score,
      currentRoundScore: currentRoundScores[index] === '' ? 0 : parseInt(currentRoundScores[index])
    })).filter(player => player.score >= 80)

    const allPositive = highScorePlayers.every(player => player.currentRoundScore >= 0)
    const allNegative = highScorePlayers.every(player => player.currentRoundScore <= 0)

    if (!allPositive && !allNegative) {
      setShowScoreWarning(true)
      return
    }

    setBrayUsed(true)
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

      const newLosers = losers.filter(loser => {
        const playerIndex = players.indexOf(loser)
        return newScores[playerIndex] >= 100
      })

      setScores(newScores)
      setLosers(newLosers)
      setRounds(newRounds)
      setGameOver(newLosers.length > 0)
      setMinusFiveUsed(false)
      setBrayUsed(false)
    }
  }

  const handleMinusFive = (index) => {
    const newCurrentRoundScores = [...currentRoundScores]
    newCurrentRoundScores[index] = '-5'
    setCurrentRoundScores(newCurrentRoundScores)
  }

  const handleRestart = () => {
    setGamePhase('setup')
    setPlayers(['', '', '', ''])
    setScores([0, 0, 0, 0])
    setCurrentRoundScores(['', '', '', ''])
    setGameOver(false)
    setLosers([])
    setRounds([])
    setShowRounds(false)
    setShowGameOverModal(false)
    setShowScoreWarning(false)
    setShowSuccessModal(false)
    setMinusFiveUsed(false)
    setConsecutiveZeros([0, 0, 0, 0])
    setBrayUsed(false)

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
    <div className="p-4 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center text-blue-400">Game in Progress</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {players.map((player, index) => (
          <div key={index} className="p-3 border-2 rounded-xl border-gray-600 bg-gray-800/50 backdrop-blur-sm shadow-xl">
            <h3 className={`text-lg font-bold mb-1 ${scores[index] >= 100 ? 'text-red-400' : 'text-blue-400'}`}>{player}</h3>
            <p className="mb-2 text-lg">Total Score: <span className={`font-bold text-xl ${scores[index] >= 80 ? 'text-red-400' : scores[index] >= 70 ? 'text-yellow-400' : ''}`}>{scores[index]}</span></p>
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
                className="w-full p-1.5 border-2 rounded-lg bg-gray-700 border-gray-600 focus:border-blue-500 focus:outline-none transition duration-200"
              />
              <button
                onClick={() => handleMinusFive(index)}
                className={`text-white px-3 py-1.5 rounded-lg font-bold shadow-lg transition duration-200 ${currentRoundScores[index] !== '' ||
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
              {scores[index] >= 80 && !brayUsed && scores[index] < 100 && scores.filter(score => score >= 80).length === 2 && (
                <button
                  onClick={() => handleBray(index)}
                  className={`bg-gradient-to-r from-purple-500 to-purple-700 text-white px-3 py-1.5 rounded-lg font-bold shadow-lg hover:from-purple-600 hover:to-purple-800 transition duration-200 ${scores[index] === 80 ? 'animate-pulse' : ''}`}
                >
                  Bray
                </button>
              )}

            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-2 justify-center">
        {!gameOver ? (
          <>
            <button
              onClick={handleScoreSubmit}
              className="bg-gradient-to-r from-green-500 to-green-700 text-white px-4 py-2 rounded-lg font-bold shadow-lg hover:from-green-600 hover:to-green-800 transition duration-200 text-sm"
            >
              Add Round
            </button>
            <button
              onClick={handleUndo}
              className="bg-gradient-to-r from-yellow-500 to-yellow-700 text-white px-4 py-2 rounded-lg font-bold shadow-lg hover:from-yellow-600 hover:to-yellow-800 transition duration-200 disabled:opacity-50 text-sm"
              disabled={rounds.length === 0}
            >
              Undo Round
            </button>
            <button
              onClick={() => setShowRounds(!showRounds)}
              className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-2 rounded-lg font-bold shadow-lg hover:from-blue-600 hover:to-blue-800 transition duration-200 text-sm"
            >
              {showRounds ? 'Hide Rounds' : 'Show Rounds'}
            </button>
          </>
        ) : null}
        <button
          onClick={handleRestart}
          className="bg-gradient-to-r from-red-500 to-red-700 text-white px-4 py-2 rounded-lg font-bold shadow-lg hover:from-red-600 hover:to-red-800 transition duration-200 text-sm"
        >
          Restart
        </button>
      </div>
      {showRounds && (
        <div className="mt-8 px-4">
          <h3 className="text-3xl font-extrabold mb-6 text-center bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Round History</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="font-bold text-xl p-4 text-gray-400"></th>
                  {players.map((player, index) => (
                    <th key={index} className={`font-bold text-xl p-4 ${
                      losers.includes(player)
                        ? 'text-red-400'
                        : 'text-blue-400'
                    }`}>
                      {player}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rounds.map((round, roundIndex) => (
                  <tr key={roundIndex} className={roundIndex % 2 === 0 ? 'bg-gray-800/30' : ''}>
                    <td className="p-4 text-gray-500">
                      Round {roundIndex + 1}
                    </td>
                    {round.map((score, playerIndex) => (
                      <td key={playerIndex} className={`p-4 text-center ${
                        losers.includes(players[playerIndex])
                          ? 'text-red-400'
                          : 'text-gray-300'
                      }`}>
                        {score === '-5' ? '-5' : score || '0'}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="border-t border-blue-500/30">
                  <td className="p-4 font-bold text-blue-400">Total</td>
                  {scores.map((score, index) => (
                    <td key={index} className={`p-4 text-center font-bold ${
                      losers.includes(players[index])
                        ? 'text-red-400'
                        : 'text-blue-400'
                    }`}>
                      {score}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
      {showScoreWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-gray-800 p-6 rounded-xl shadow-2xl text-center max-w-sm w-full mx-4">
            <h2 className="text-2xl font-bold mb-3 text-yellow-400">Warning!</h2>
            <p className="text-base mb-4 text-gray-300">
              {scores.some(score => score >= 80)
                ? "Total round score must be exactly 25 or 13. Players with score ≥80 can only have all positive or all negative scores."
                : currentRoundScores.reduce((sum, score) => sum + (score === '' ? 0 : parseInt(score)), 0) === 25 && !currentRoundScores.some(score => (score === '' ? 0 : parseInt(score)) > 11)
                  ? "For a round total of 25, at least one player must have a score greater than 11"
                  : "Total round score must be exactly 25"}
            </p>
            <button
              onClick={() => setShowScoreWarning(false)}
              className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-2 rounded-lg font-bold shadow-lg hover:from-blue-600 hover:to-blue-800 transition duration-200 z-50 text-sm"
            >
              OK
            </button>
          </div>
        </div>
      )}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-gray-800 p-6 rounded-xl shadow-2xl text-center max-w-sm w-full mx-4">
            <h2 className="text-2xl font-bold mb-3 text-green-400">Success!</h2>
            <p className="text-lg mb-4 text-gray-300">
              {playersWithMinusFive.join(', ')} got -5 for consecutive zeros!
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-2 rounded-lg font-bold shadow-lg hover:from-blue-600 hover:to-blue-800 transition duration-200 text-sm"
            >
              OK
            </button>
          </div>
        </div>
      )}
      {showGameOverModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-gray-800 p-6 rounded-xl shadow-2xl text-center max-w-sm w-full mx-4">
            <h2 className="text-2xl font-bold mb-3 text-red-400">Game Over!</h2>
            <p className="text-lg mb-4 text-gray-300">Losers: {losers.join(', ')}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowGameOverModal(false)}
                className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-2 rounded-lg font-bold shadow-lg hover:from-blue-600 hover:to-blue-800 transition duration-200 text-sm"
              >
                OK
              </button>
              <button
                onClick={handleRestart}
                className="bg-gradient-to-r from-green-500 to-green-700 text-white px-6 py-2 rounded-lg font-bold shadow-lg hover:from-green-600 hover:to-green-800 transition duration-200 text-sm"
              >
                Restart Game
              </button>
              <button
                onClick={downloadPDF}
                className="bg-gradient-to-r from-purple-500 to-purple-700 text-white px-4 py-2 rounded-lg font-bold shadow-lg hover:from-purple-600 hover:to-purple-800 transition duration-200 text-sm"
              >
                Download History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Hero