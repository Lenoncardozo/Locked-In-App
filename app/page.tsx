import DigitalClock from "./components/DigitalClock"
import DailyJournal from "./components/Journal"
import TaskList from "./components/TaskList"
import ThemeSelector from "./components/ThemeSelector"
import PomodoroTimer from "./components/PomodoroTimer"

export default function Home() {
  return (
    <main className="flex flex-col justify-center items-center min-h-screen bg-background p-4 gap-6">
      <ThemeSelector />

      <div className="flex flex-col items-center justify-center gap-1 mt-8">
        <h1 className="text-3xl font-medium text-primary/90 font-['Space_Mono']">[Locked In]</h1>
        <DigitalClock />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl mt-4">
        <div className="space-y-6">
          <PomodoroTimer />
          <DailyJournal />
        </div>
        <TaskList />
      </div>
    </main>
  )
}

