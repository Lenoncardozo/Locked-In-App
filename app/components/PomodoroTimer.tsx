"use client"

import { useState, useEffect, useRef } from "react"
import { Play, Pause, RotateCcw, Volume2, VolumeX, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

type TimerMode = "work" | "break"
type TimerPreset = "25/5" | "50/10" | "90/20" | "custom"

interface TimerSettings {
  workTime: number
  breakTime: number
  preset: TimerPreset
}

const DEFAULT_SETTINGS: TimerSettings = {
  workTime: 50 * 60, // 50 minutes in seconds
  breakTime: 10 * 60, // 10 minutes in seconds
  preset: "50/10",
}

// Função para tocar um som de alerta simples usando a Web Audio API
const playAlertSound = (frequency = 440, duration = 0.3, volume = 0.5) => {
  try {
    // Cria um contexto de áudio
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Cria um oscilador (gerador de som)
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'sine'; // Tipo de onda: sine, square, sawtooth, triangle
    oscillator.frequency.value = frequency; // Frequência em Hz
    
    // Cria um nó de ganho para controlar o volume
    const gainNode = audioContext.createGain();
    gainNode.gain.value = volume;
    
    // Conecta oscilador -> ganho -> saída de áudio
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Inicia o oscilador e para após a duração especificada
    oscillator.start();
    setTimeout(() => {
      oscillator.stop();
      // Desconecta os nós para liberar memória
      oscillator.disconnect();
      gainNode.disconnect();
    }, duration * 1000);
  } catch (err) {
    console.error("Erro ao tocar som de alerta:", err);
  }
};

export default function PomodoroTimer() {
  // Load settings from localStorage or use defaults
  const loadSettings = (): TimerSettings => {
    if (typeof window === "undefined") return DEFAULT_SETTINGS

    const saved = localStorage.getItem("pomodoroSettings")
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS
  }

  const [settings, setSettings] = useState<TimerSettings>(loadSettings())
  const [timeLeft, setTimeLeft] = useState(settings.workTime)
  const [isActive, setIsActive] = useState(false)
  const [mode, setMode] = useState<TimerMode>("work")
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [customWorkTime, setCustomWorkTime] = useState(50)
  const [customBreakTime, setCustomBreakTime] = useState(10)
  const prevModeRef = useRef<TimerMode>("work");

  // Load settings on initial render
  useEffect(() => {
    const savedSettings = loadSettings()
    setSettings(savedSettings)
    setTimeLeft(savedSettings.workTime)
    setCustomWorkTime(Math.floor(savedSettings.workTime / 60))
    setCustomBreakTime(Math.floor(savedSettings.breakTime / 60))
  }, [])

  // Save settings when they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("pomodoroSettings", JSON.stringify(settings))
    }
  }, [settings])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1)
      }, 1000)
    } else if (isActive && timeLeft === 0) {
      // Tocar alerta sonoro
      if (soundEnabled) {
        if (mode === "work") {
          // Som para início de pausa (frequência mais baixa)
          playAlertSound(330, 0.5, 0.6);
        } else {
          // Som para fim de pausa (frequência mais alta)
          playAlertSound(660, 0.3, 0.6);
        }
      }

      // Switch modes
      if (mode === "work") {
        setMode("break")
        setTimeLeft(settings.breakTime)
      } else {
        setMode("work")
        setTimeLeft(settings.workTime)
      }
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeLeft, mode, soundEnabled, settings])

  // Efeito para tocar som quando o modo mudar manualmente
  useEffect(() => {
    // Verificar se houve mudança de modo e se o timer está ativo
    if (prevModeRef.current !== mode && isActive && soundEnabled) {
      if (mode === "break") {
        // Som para início de pausa
        playAlertSound(330, 0.5, 0.6);
      } else if (mode === "work") {
        // Som para início de trabalho/fim de pausa
        playAlertSound(660, 0.3, 0.6);
      }
    }
    
    // Atualizar o valor de referência
    prevModeRef.current = mode;
  }, [mode, isActive, soundEnabled]);

  const toggleTimer = () => {
    setIsActive(!isActive)
  }

  const resetTimer = () => {
    setIsActive(false)
    setMode("work")
    setTimeLeft(settings.workTime)
  }

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const calculateProgress = () => {
    const total = mode === "work" ? settings.workTime : settings.breakTime
    return ((total - timeLeft) / total) * 100
  }

  const applyPreset = (preset: TimerPreset) => {
    let newSettings: TimerSettings

    switch (preset) {
      case "25/5":
        newSettings = {
          workTime: 25 * 60,
          breakTime: 5 * 60,
          preset,
        }
        break
      case "50/10":
        newSettings = {
          workTime: 50 * 60,
          breakTime: 10 * 60,
          preset,
        }
        break
      case "90/20":
        newSettings = {
          workTime: 90 * 60,
          breakTime: 20 * 60,
          preset,
        }
        break
      case "custom":
        newSettings = {
          workTime: customWorkTime * 60,
          breakTime: customBreakTime * 60,
          preset: "custom",
        }
        break
      default:
        newSettings = DEFAULT_SETTINGS
    }

    setSettings(newSettings)

    // Reset timer with new settings
    setIsActive(false)
    setMode("work")
    setTimeLeft(newSettings.workTime)
  }

  return (
    <div className="flex flex-col items-center space-y-4 p-6 bg-background/30 rounded-lg border border-primary/20 shadow-sm max-w-md w-full mx-auto">
      <div className="w-full">
        <div className="relative h-1.5 bg-primary/10 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-primary/60"
            style={{ width: `${calculateProgress()}%` }}
          ></div>
        </div>
      </div>

      <div className="text-center">
        <div className="text-5xl font-medium text-primary font-mono">{formatTime(timeLeft)}</div>
        <div className="text-xs uppercase tracking-wider mt-1 text-primary/50">
          {mode === "work" ? "focus" : "break"}
        </div>
      </div>

      <div className="flex space-x-3">
        <Button
          onClick={toggleTimer}
          variant="outline"
          size="icon"
          className="rounded-full border border-primary/30 text-primary/70 hover:bg-primary/10 hover:text-primary w-9 h-9"
        >
          {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>

        <Button
          onClick={resetTimer}
          variant="outline"
          size="icon"
          className="rounded-full border border-primary/30 text-primary/70 hover:bg-primary/10 hover:text-primary w-9 h-9"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>

        <Button
          onClick={toggleSound}
          variant="outline"
          size="icon"
          className="rounded-full border border-primary/30 text-primary/70 hover:bg-primary/10 hover:text-primary w-9 h-9"
        >
          {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </Button>

        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border border-primary/30 text-primary/70 hover:bg-primary/10 hover:text-primary w-9 h-9 opacity-40 hover:opacity-100 transition-opacity"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-background border-primary/30 text-primary">
            <DialogHeader>
              <DialogTitle className="text-primary/80">Timer Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label className="text-primary/70">Preset Timers</Label>
                <Select value={settings.preset} onValueChange={(value) => applyPreset(value as TimerPreset)}>
                  <SelectTrigger className="border-primary/30 text-primary/80 bg-background">
                    <SelectValue placeholder="Select a preset" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-primary/30">
                    <SelectItem value="25/5">25/5 (Pomodoro)</SelectItem>
                    <SelectItem value="50/10">50/10 (Extended)</SelectItem>
                    <SelectItem value="90/20">90/20 (Deep Work)</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {settings.preset === "custom" && (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-primary/70">Work Time: {customWorkTime} minutes</Label>
                    </div>
                    <Slider
                      value={[customWorkTime]}
                      min={5}
                      max={120}
                      step={5}
                      onValueChange={(value) => setCustomWorkTime(value[0])}
                      className="text-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-primary/70">Break Time: {customBreakTime} minutes</Label>
                    </div>
                    <Slider
                      value={[customBreakTime]}
                      min={1}
                      max={30}
                      step={1}
                      onValueChange={(value) => setCustomBreakTime(value[0])}
                      className="text-primary"
                    />
                  </div>
                  <Button
                    onClick={() => applyPreset("custom")}
                    className="w-full bg-primary/10 text-primary/80 hover:bg-primary/20 border border-primary/30"
                  >
                    Apply Custom Settings
                  </Button>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

