"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Plus, Trash2, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

interface Task {
  id: string
  text: string
  completed: boolean
}

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskText, setNewTaskText] = useState("")
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    // Load tasks from localStorage
    const savedTasks = localStorage.getItem("focusTasks")
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks))
    }
  }, [])

  // Save tasks to localStorage when they change
  useEffect(() => {
    localStorage.setItem("focusTasks", JSON.stringify(tasks))
  }, [tasks])

  const addTask = () => {
    if (!newTaskText.trim()) return

    const newTask: Task = {
      id: Date.now().toString(),
      text: newTaskText,
      completed: false,
    }

    // This already adds the task to the end of the list
    setTasks([...tasks, newTask])
    setNewTaskText("")
  }

  const toggleTask = (id: string) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }

  const removeTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addTask()
    }
  }

  // Simple Mouse-Based Drag-and-Drop
  const handleMouseDown = (index: number) => {
    setActiveIndex(index)
    setIsDragging(true)
    // Prevent text selection during drag
    document.body.classList.add('dragging-task')
  }

  const handleMouseUp = () => {
    setActiveIndex(null)
    setDraggedOverIndex(null)
    setIsDragging(false)
    // Re-enable text selection
    document.body.classList.remove('dragging-task')
  }

  const handleMouseEnter = (index: number) => {
    if (activeIndex !== null && activeIndex !== index) {
      setDraggedOverIndex(index)
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    e.preventDefault()
    if (activeIndex !== null && draggedOverIndex !== null && activeIndex !== draggedOverIndex) {
      // Create a copy of the tasks array
      const newTasks = [...tasks]
      
      // Remove the dragged item
      const draggedItem = newTasks.splice(activeIndex, 1)[0]
      
      // Insert it at the drop position
      newTasks.splice(draggedOverIndex, 0, draggedItem)
      
      // Update state
      setTasks(newTasks)
      
      // Update active index to new position
      setActiveIndex(draggedOverIndex)
      setDraggedOverIndex(null)
    }
  }
  
  // Calculate responsive max height based on number of tasks
  const getTaskListMaxHeight = () => {
    if (tasks.length === 0) return 'auto';
    // Base height for empty list + height per task (adjust as needed)
    const minHeight = 100;
    const heightPerTask = 40;
    const calculatedHeight = Math.min(400, minHeight + tasks.length * heightPerTask);
    return `${calculatedHeight}px`;
  };

  // Global mouse up handler for when mouse is released outside elements
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (activeIndex !== null) {
        setActiveIndex(null)
        setDraggedOverIndex(null)
        setIsDragging(false)
        document.body.classList.remove('dragging-task')
      }
    }
    
    window.addEventListener('mouseup', handleGlobalMouseUp)
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [activeIndex])

  // Add global style to disable text selection while dragging
  useEffect(() => {
    // Create a style element
    const style = document.createElement('style')
    style.innerHTML = `
      .dragging-task {
        user-select: none !important;
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
      }
    `
    document.head.appendChild(style)
    
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  return (
    <div 
      className="flex flex-col space-y-4 p-6 bg-background/30 rounded-lg border border-primary/20 shadow-sm max-w-md w-full mx-auto"
      style={{ minHeight: '200px', height: 'auto' }}
    >
      <h2 className="text-lg font-medium text-primary/80 text-center">(tasks)</h2>

      <div className="flex space-x-2">
        <Input
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add task..."
          className="flex-grow border-primary/20 bg-background/50 text-primary placeholder:text-primary/30 h-9"
        />
        <Button onClick={addTask} className="bg-primary/10 text-primary hover:bg-primary/20 border-none h-9 w-9 p-0">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div 
        className={`space-y-1 overflow-y-auto flex-grow ${isDragging ? 'cursor-grabbing' : ''}`}
        style={{ maxHeight: getTaskListMaxHeight() }}
        onMouseMove={handleMouseMove}
      >
        {tasks.length === 0 ? (
          <p className="text-primary/30 text-sm italic text-center">No tasks</p>
        ) : (
          tasks.map((task, index) => (
            <div
              key={task.id}
              className={`flex items-center p-1.5 rounded group ${
                task.completed ? "bg-primary/5" : ""
              } ${activeIndex === index ? "opacity-50 bg-primary/10" : ""} ${
                draggedOverIndex === index ? "border-t-2 border-primary/50" : ""
              }`}
              onMouseEnter={() => handleMouseEnter(index)}
              style={{ userSelect: 'none' }}
            >
              <div 
                className="cursor-grab mr-1 text-primary/30 hover:text-primary/60 touch-manipulation px-1 py-1" 
                onMouseDown={() => handleMouseDown(index)}
                onMouseUp={handleMouseUp}
                style={{ touchAction: 'none' }}
              >
                <GripVertical size={16} />
              </div>
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => toggleTask(task.id)}
                className="border-primary/30 data-[state=checked]:bg-primary/70 data-[state=checked]:text-primary-foreground mr-2"
              />
              <span className={`flex-1 text-sm text-primary ${task.completed ? "line-through text-primary/40" : ""}`}>
                {task.text}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeTask(task.id)}
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

