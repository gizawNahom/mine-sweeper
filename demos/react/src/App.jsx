import { useState } from "react"
import MineSweeper from "./MineSweeper"

const DIFFICULTIES = {
	default: { label: "Default (8×10, 10 mines)", options: undefined },
	beginner: { label: "Beginner (9×9, 10 mines)", options: { rows: 9, columns: 9, mines: 10 } },
	intermediate: { label: "Intermediate (16×16, 40 mines)", options: { rows: 16, columns: 16, mines: 40 } },
	expert: { label: "Expert (16×30, 99 mines)", options: { rows: 16, columns: 30, mines: 99 } },
}

export default function App() {
	const [difficulty, setDifficulty] = useState("default")
	const [gameNumber, setGameNumber] = useState(1)
	const [flagMode, setFlagMode] = useState(false)
	const newGame = () => setGameNumber((number) => number + 1)

	return (
		<>
			<header>
				<h1>Mine-Sweeper</h1>
				<p>
					A React sample UI for the{" "}
					<a href="https://github.com/gizawNahom/mine-sweeper">mine-sweeper engine</a>. Left
					click reveals, right click flags.
				</p>
			</header>

			<section className="controls" aria-label="Game controls">
				<label>
					Difficulty{" "}
					<select
						id="difficulty"
						value={difficulty}
						onChange={(event) => {
							setDifficulty(event.target.value)
							newGame()
						}}
					>
						{Object.entries(DIFFICULTIES).map(([value, { label }]) => (
							<option key={value} value={value}>
								{label}
							</option>
						))}
					</select>
				</label>
				<button id="new-game" type="button" onClick={newGame}>
					New game
				</button>
				<button
					id="flag-mode"
					type="button"
					aria-pressed={flagMode}
					onClick={() => setFlagMode((on) => !on)}
				>
					🚩 Flag mode
				</button>
			</section>

			{/* A new key starts a new game: the component, and the game it holds, are recreated. */}
			<MineSweeper
				key={`${difficulty}-${gameNumber}`}
				options={DIFFICULTIES[difficulty].options}
				flagMode={flagMode}
			/>
		</>
	)
}
