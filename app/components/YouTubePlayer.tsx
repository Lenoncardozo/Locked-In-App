"use client"

import { useState, useEffect } from "react"
import { Plus, X, PinIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface Note {
  id: string
  content: string
  isPinned: boolean
}

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [newNoteContent, setNewNoteContent] = useState<string>('')

  // Load notes from localStorage on initial render
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedNotes = localStorage.getItem("notes")
        if (savedNotes) {
          setNotes(JSON.parse(savedNotes))
        }
      } catch (error) {
        console.error("Failed to load notes from localStorage:", error)
      }
    }
  }, [])

  // Save notes to localStorage on changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("notes", JSON.stringify(notes))
    }
  }, [notes])

  // Handle adding a new note
  const addNote = () => {
    if (!newNoteContent.trim()) return
    
    const newNote: Note = {
      id: Date.now().toString(),
      content: newNoteContent,
      isPinned: false
    }
    
    setNotes([...notes, newNote])
    setNewNoteContent('')
  }

  // Toggle pin status of a note
  const togglePin = (id: string) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, isPinned: !note.isPinned } : note
    ))
  }

  // Delete a note
  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id))
  }

  // Sort notes with pinned ones first
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    return 0
  })

  return (
    <div className="flex flex-col space-y-3 p-6 bg-background/30 rounded-lg border border-primary/20 shadow-sm w-full max-w-full mx-auto"
         style={{ minHeight: '200px', height: 'auto' }}>
      <h2 className="text-lg font-medium text-primary/80 text-center">(notes)</h2>
      <p className="text-center text-primary/60 text-sm font-medium italic mb-2">
        <strong><em>Don't stop when you're tired,<br />stop when you're done.</em></strong>
      </p>

      {/* New Note Input and Add Button */}
      <div className="flex space-y-2 flex-col">
        <Textarea
          value={newNoteContent}
          onChange={(e) => setNewNoteContent(e.target.value)}
          placeholder="Add a new note..."
          className="flex-grow border-primary/20 bg-background/50 text-primary placeholder:text-primary/30 text-sm min-h-[80px]"
        />
        <Button
          onClick={addNote}
          className="bg-primary/10 text-primary/70 hover:bg-primary/20 border-none self-end px-3 py-1 h-8"
        >
          <Plus className="h-3 w-3 mr-1" /> Add Note
        </Button>
      </div>

      {/* Notes List */}
      <div className="space-y-2 flex-grow overflow-y-auto" style={{ maxHeight: notes.length > 0 ? '400px' : 'auto' }}>
        {notes.length === 0 ? (
          <div className="h-full flex items-center justify-center text-primary/30 text-sm bg-background/50 p-4 rounded">
            No notes yet. Add one above!
          </div>
        ) : (
          sortedNotes.map((note) => (
            <div
              key={note.id}
              className={`p-3 rounded text-sm relative ${
                note.isPinned ? 'bg-primary/15 text-primary/90' : 'bg-background/50 text-primary/70'
              } border border-primary/10`}
            >
              <div className="flex justify-between items-start mb-1">
                <Button
                  onClick={() => togglePin(note.id)}
                  className={`h-6 w-6 p-0 rounded-full ${
                    note.isPinned 
                      ? 'bg-primary/20 text-primary/90 hover:bg-primary/30' 
                      : 'bg-transparent text-primary/40 hover:bg-primary/10 hover:text-primary/60'
                  }`}
                  title={note.isPinned ? "Unpin note" : "Pin note"}
                >
                  <PinIcon className="h-3 w-3" />
                </Button>
                <Button
                  onClick={() => deleteNote(note.id)}
                  className="h-6 w-6 p-0 rounded-full bg-transparent text-primary/40 hover:bg-primary/10 hover:text-primary/60"
                  title="Delete note"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <div className="whitespace-pre-wrap break-words">
                {note.content}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
} 