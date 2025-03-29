"use client"

import { useState, useEffect, useRef } from "react"
import { Trash2, Plus, Music, Play, Pause, SkipForward, SkipBack } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"

interface Track {
  id: string
  title: string
  url: string
}

// Declare the Spotify variable
declare global {
  interface Window {
    Spotify: any // You might want to define a more specific type for Spotify
  }
}

export default function SpotifyPlayer() {
  const [playlist, setPlaylist] = useState<Track[]>([])
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [newTrackUrl, setNewTrackUrl] = useState("")
  const [volume, setVolume] = useState(70)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const playerRef = useRef<Spotify.Player | null>(null)
  const deviceIdRef = useRef<string | null>(null)

  // Load playlist from localStorage on initial render
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPlaylist = localStorage.getItem("spotifyPlaylist")
      if (savedPlaylist) {
        setPlaylist(JSON.parse(savedPlaylist))
      }
    }
  }, [])

  // Save playlist to localStorage when it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("spotifyPlaylist", JSON.stringify(playlist))
    }
  }, [playlist])

  // Extract Spotify track/playlist ID from URL
  const extractSpotifyId = (url: string): { id: string; type: string } | null => {
    // Handle track URLs
    const trackMatch = url.match(/track\/([a-zA-Z0-9]+)/)
    if (trackMatch && trackMatch[1]) {
      return { id: trackMatch[1], type: "track" }
    }

    // Handle playlist URLs
    const playlistMatch = url.match(/playlist\/([a-zA-Z0-9]+)/)
    if (playlistMatch && playlistMatch[1]) {
      return { id: playlistMatch[1], type: "playlist" }
    }

    // Handle album URLs
    const albumMatch = url.match(/album\/([a-zA-Z0-9]+)/)
    if (albumMatch && albumMatch[1]) {
      return { id: albumMatch[1], type: "album" }
    }

    return null
  }

  // Extract title from URL (simplified version)
  const extractTitle = (url: string): string => {
    const spotifyData = extractSpotifyId(url)
    if (!spotifyData) return "Unknown Track"

    return `Spotify ${spotifyData.type} (${spotifyData.id.substring(0, 6)}...)`
  }

  // Add a new track to the playlist
  const addTrack = () => {
    if (!newTrackUrl.trim()) return

    const spotifyData = extractSpotifyId(newTrackUrl)
    if (!spotifyData) {
      alert("Invalid Spotify URL. Please use a Spotify track, album, or playlist URL.")
      return
    }

    const title = extractTitle(newTrackUrl)
    const newTrack: Track = {
      id: spotifyData.id,
      title,
      url: newTrackUrl,
    }

    setPlaylist([...playlist, newTrack])
    setNewTrackUrl("")

    // If this is the first track, select it
    if (playlist.length === 0) {
      setCurrentTrackIndex(0)
    }
  }

  // Remove a track from the playlist
  const removeTrack = (index: number) => {
    const newPlaylist = [...playlist]
    newPlaylist.splice(index, 1)
    setPlaylist(newPlaylist)

    // Adjust currentTrackIndex if necessary
    if (index === currentTrackIndex) {
      if (isPlaying) {
        setIsPlaying(false)
      }
      if (newPlaylist.length > 0) {
        setCurrentTrackIndex(0)
      } else {
        setCurrentTrackIndex(-1)
      }
    } else if (index < currentTrackIndex) {
      setCurrentTrackIndex(currentTrackIndex - 1)
    }
  }

  // Toggle play/pause
  const togglePlay = () => {
    if (currentTrackIndex === -1 && playlist.length > 0) {
      setCurrentTrackIndex(0)
      return
    }

    setIsPlaying(!isPlaying)
  }

  // Play the previous track
  const playPreviousTrack = () => {
    if (playlist.length === 0) return

    const newIndex = currentTrackIndex <= 0 ? playlist.length - 1 : currentTrackIndex - 1
    setCurrentTrackIndex(newIndex)
  }

  // Play the next track
  const playNextTrack = () => {
    if (playlist.length === 0) return

    const newIndex = (currentTrackIndex + 1) % playlist.length
    setCurrentTrackIndex(newIndex)
  }

  // Get Spotify embed URL
  const getSpotifyEmbedUrl = (track: Track | null): string => {
    if (!track) return ""

    const spotifyData = extractSpotifyId(track.url)
    if (!spotifyData) return ""

    return `https://open.spotify.com/embed/${spotifyData.type}/${spotifyData.id}?utm_source=generator&theme=0`
  }

  return (
    <div className="flex flex-col space-y-3 p-6 bg-background/30 rounded-lg border border-primary/20 shadow-sm max-w-md w-full mx-auto">
      <h2 className="text-lg font-medium text-primary/80 text-center">(music)</h2>

      <div className="flex space-x-2">
        <Input
          value={newTrackUrl}
          onChange={(e) => setNewTrackUrl(e.target.value)}
          placeholder="Paste Spotify URL"
          className="flex-grow border-primary/20 bg-background/50 text-primary placeholder:text-primary/30 h-8 text-sm"
        />
        <Button
          onClick={addTrack}
          className="bg-primary/10 text-primary/70 hover:bg-primary/20 border-none h-8 w-8 p-0"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      {/* Spotify iframe player */}
      <div className="w-full bg-background/50 rounded overflow-hidden">
        {currentTrackIndex >= 0 && playlist[currentTrackIndex] ? (
          <iframe
            ref={iframeRef}
            src={getSpotifyEmbedUrl(playlist[currentTrackIndex])}
            width="100%"
            height="152"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="border-none"
          ></iframe>
        ) : (
          <div className="h-[152px] flex items-center justify-center text-primary/30 text-sm">No track selected</div>
        )}
      </div>

      {/* Volume slider */}
      <div className="space-y-1">
        <Slider
          value={[volume]}
          min={0}
          max={100}
          step={1}
          onValueChange={(value) => setVolume(value[0])}
          className="h-1.5"
        />
        <p className="text-xs text-primary/50 text-right">Vol: {volume}%</p>
      </div>

      {/* Playback controls */}
      <div className="flex justify-center space-x-3">
        <Button
          onClick={playPreviousTrack}
          variant="outline"
          size="icon"
          className="rounded-full border border-primary/30 text-primary/70 hover:bg-primary/10 hover:text-primary w-8 h-8"
          disabled={playlist.length === 0}
        >
          <SkipBack className="h-3 w-3" />
        </Button>

        <Button
          onClick={togglePlay}
          variant="outline"
          size="icon"
          className="rounded-full border border-primary/30 text-primary/70 hover:bg-primary/10 hover:text-primary w-8 h-8"
          disabled={playlist.length === 0}
        >
          {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
        </Button>

        <Button
          onClick={playNextTrack}
          variant="outline"
          size="icon"
          className="rounded-full border border-primary/30 text-primary/70 hover:bg-primary/10 hover:text-primary w-8 h-8"
          disabled={playlist.length === 0}
        >
          <SkipForward className="h-3 w-3" />
        </Button>
      </div>

      {/* Playlist */}
      <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
        {playlist.length === 0 ? (
          <p className="text-primary/30 text-xs italic text-center">No tracks added</p>
        ) : (
          playlist.map((track, index) => (
            <div
              key={track.id}
              className={`flex justify-between items-center p-1.5 rounded group ${
                index === currentTrackIndex ? "bg-primary/10" : ""
              }`}
            >
              <div
                className="flex-1 truncate cursor-pointer text-primary/70 hover:text-primary/90 flex items-center gap-1 text-xs"
                onClick={() => {
                  setCurrentTrackIndex(index)
                }}
              >
                <Music className="h-2.5 w-2.5 flex-shrink-0" />
                <span>{track.title}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeTrack(index)}
                className="opacity-0 group-hover:opacity-100 text-primary/40 hover:text-primary/60 hover:bg-transparent h-6 w-6"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

